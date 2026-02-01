import type { sendUnaryData, ServerUnaryCall } from "@grpc/grpc-js";
import * as Sentry from "@sentry/node";
import _ from "lodash";
import type {
    AreaData,
    AtLeast,
    EntityCoordinates,
    EntityDataProperties,
    EntityDimensions,
    WAMEntityData,
} from "@workadventure/map-editor";
import {
    AreaDataProperties,
    CreateAreaCommand,
    CreateEntityCommand,
    EntityPermissions,
    UpdateWAMMetadataCommand,
    UpdateWAMSettingCommand,
} from "@workadventure/map-editor";
import type {
    EditMapCommandMessage,
    EditMapCommandsArrayMessage,
    EditMapCommandWithKeyMessage,
    MapStorageClearAfterUploadMessage,
    PingMessage,
    UpdateMapToNewestWithKeyMessage,
} from "@workadventure/messages";
import type { Empty } from "@workadventure/messages/src/ts-proto-generated/google/protobuf/empty";
import * as catchUnknown from "catch-unknown";
const asError = catchUnknown.asError;
import { DeleteCustomEntityMapStorageCommand } from "./Commands/Entity/DeleteCustomEntityMapStorageCommand";
import { ModifyCustomEntityMapStorageCommand } from "./Commands/Entity/ModifyCustomEntityMapStorageCommand";
import { UploadEntityMapStorageCommand } from "./Commands/Entity/UploadEntityMapStorageCommand";
import { entitiesManager } from "./EntitiesManager";
import { mapsManager } from "./MapsManager";
import { mapPathUsingDomainWithPrefix } from "./Services/PathMapper";
import { LockByKey } from "./Services/LockByKey";
import { DeleteAreaMapStorageCommand } from "./Commands/Area/DeleteAreaMapStorageCommand";
import { UpdateAreaMapStorageCommand } from "./Commands/Area/UpdateAreaMapStorageCommand";
import { DeleteEntityMapStorageCommand } from "./Commands/Entity/DeleteEntityMapStorageCommand";
import { UploadFileMapStorageCommand } from "./Commands/File/UploadFileMapStorageCommand";
import { hookManager } from "./Modules/HookManager";
import { UpdateEntityMapStorageCommand } from "./Commands/Entity/UpdateEntityMapStorageCommand";

const editionLocks = new LockByKey<string>();

/**
 * List of commands that can be executed even if the user does not have edit rights on the map
 */
const COMMANDS_ACCESSIBLE_WITHOUT_CAN_EDIT = new Set<string>([
    "modifyEntityMessage",
    "createEntityMessage",
    "deleteEntityMessage",
    "uploadEntityMessage",
    "modifyCustomEntityMessage",
    "deleteCustomEntityMessage",
    "uploadFileMessage",
]);

// FIXED: Use 'any' to bypass 'MapStorageServer' member not found error
const mapStorageServer: any = {
    ping(call: ServerUnaryCall<PingMessage, Empty>, callback: sendUnaryData<PingMessage>): void {
        callback(null, call.request);
    },
    handleClearAfterUpload(
        call: ServerUnaryCall<MapStorageClearAfterUploadMessage, Empty>,
        callback: sendUnaryData<Empty>
    ): void {
        const wamUrl = call.request.wamUrl;
        const url = new URL(wamUrl);
        const wamKey = mapPathUsingDomainWithPrefix(url.pathname, url.hostname);
        mapsManager.clearAfterUpload(wamKey);
        callback(null, {} as Empty);
    },
    handleUpdateMapToNewestMessage(
        call: ServerUnaryCall<UpdateMapToNewestWithKeyMessage, Empty>,
        callback: sendUnaryData<EditMapCommandsArrayMessage>
    ): void {
        try {
            const mapUrl = new URL(call.request.mapKey);
            const mapKey = mapPathUsingDomainWithPrefix(mapUrl.pathname, mapUrl.hostname);
            const updateMapToNewestMessage = call.request.updateMapToNewestMessage;
            if (!updateMapToNewestMessage) {
                callback({ name: "MapStorageError", message: "UpdateMapToNewest message does not exist" }, null);
                return;
            }
            const clientCommandId = updateMapToNewestMessage.commandId;
            const lastCommandId = mapsManager.getGameMap(mapKey)?.getLastCommandId();
            let commandsToApply: EditMapCommandMessage[] = [];
            if (clientCommandId !== lastCommandId) {
                commandsToApply = mapsManager.getCommandsNewerThan(mapKey, updateMapToNewestMessage.commandId);
            }
            const editMapCommandsArrayMessage: EditMapCommandsArrayMessage = {
                editMapCommands: commandsToApply,
            };
            callback(null, editMapCommandsArrayMessage);
        } catch (e: unknown) {
            const error = asError(e);
            console.error(`[${new Date().toISOString()}] Error in handleUpdateMapToNewest`, e);
            Sentry.captureException(e);
            callback({ name: "MapStorageError", message: error.message }, null);
        }
    },

    handleEditMapCommandWithKeyMessage(
        call: ServerUnaryCall<EditMapCommandWithKeyMessage, Empty>,
        callback: sendUnaryData<EditMapCommandMessage>
    ): void {
        (async () => {
            const editMapCommandMessage = call.request.editMapCommandMessage;
            
            // FIXED: Removed '.message' check for flattened unions
            if (!editMapCommandMessage || !editMapCommandMessage.editMapMessage) {
                callback({ name: "MapStorageError", message: "EditMapCommand message does not exist" }, null);
                return;
            }

            const mapUrl = new URL(call.request.mapKey);
            const mapKey = mapPathUsingDomainWithPrefix(mapUrl.pathname, mapUrl.hostname);

            await editionLocks.waitForLock(mapKey, async () => {
                const editMapCommandMessage = call.request.editMapCommandMessage;
                if (!editMapCommandMessage || !editMapCommandMessage.editMapMessage) {
                    callback({ name: "MapStorageError", message: "EditMapCommand message does not exist" }, null);
                    return;
                }

                // FIXED: Direct access to flattened message
                const editMapMessage = editMapCommandMessage.editMapMessage as any;
                const gameMap = await mapsManager.getOrLoadGameMap(mapKey);

                const { connectedUserTags, userCanEdit, userUUID } = call.request;
                const gameMapAreas = gameMap.getGameMapAreas();
                const entityCommandPermissions = gameMapAreas
                    ? new EntityPermissions(gameMapAreas, connectedUserTags, userCanEdit, userUUID)
                    : undefined;

                const commandId = editMapCommandMessage.id;

                if (!userCanEdit && !COMMANDS_ACCESSIBLE_WITHOUT_CAN_EDIT.has(editMapMessage.$case)) {
                    throw new Error(
                        `User ${userUUID} not allowed to execute command: ${editMapMessage.$case}`
                    );
                }

                switch (editMapMessage.$case) {
                    case "modifyAreaMessage": {
                        const message = editMapMessage.modifyAreaMessage;
                        const dataToModify: AtLeast<AreaData, "id"> = structuredClone(message);
                        if (!message.modifyProperties) {
                            dataToModify.properties = undefined;
                        }
                        const area = gameMap.getGameMapAreas()?.getArea(message.id);
                        if (area) {
                            await mapsManager.executeCommand(
                                mapKey,
                                mapUrl.host,
                                new UpdateAreaMapStorageCommand(gameMap, dataToModify, commandId, area, hookManager, mapUrl.hostname)
                            );

                            const newAreaData = gameMap.getGameMapAreas()?.getArea(message.id);
                            if (newAreaData) {
                                const oldPropertiesParsed = AreaDataProperties.safeParse(message.properties).data || [];
                                const oldServerData = oldPropertiesParsed.filter(p => p.serverData).map(p => ({ id: p.id, serverData: p.serverData }));
                                const newServerData = newAreaData.properties.filter(p => p.serverData).map(p => ({ id: p.id, serverData: p.serverData }));

                                editMapMessage.modifyAreaMessage = {
                                    ...newAreaData,
                                    modifyServerData: !_.isEqual(oldServerData, newServerData),
                                };
                            }
                        }
                        break;
                    }
                    case "createAreaMessage": {
                        const message = editMapMessage.createAreaMessage;
                        await mapsManager.executeCommand(mapKey, mapUrl.host, new CreateAreaCommand(gameMap, { ...message, visible: true }, commandId));
                        break;
                    }
                    case "deleteAreaMessage": {
                        await mapsManager.executeCommand(mapKey, mapUrl.host, new DeleteAreaMapStorageCommand(gameMap, editMapMessage.deleteAreaMessage.id, commandId, mapUrl.hostname, hookManager));
                        break;
                    }
                    case "modifyEntityMessage": {
                        const message = editMapMessage.modifyEntityMessage;
                        const dataToModify: Partial<WAMEntityData> = structuredClone(message);
                        if (!message.modifyProperties) dataToModify.properties = undefined;
                        const entity = gameMap.getGameMapEntities()?.getEntity(message.id);
                        if (entity) {
                            const { x, y, width, height } = message;
                            if (entityCommandPermissions && !entityCommandPermissions.canEdit(getEntityCenterCoordinates({ x, y }, { width, height }))) break;
                            await mapsManager.executeCommand(mapKey, mapUrl.host, new UpdateEntityMapStorageCommand(gameMap, message.id, dataToModify, commandId, entity, hookManager, mapUrl.hostname));
                        }
                        break;
                    }
                    case "createEntityMessage": {
                        const message = editMapMessage.createEntityMessage;
                        const { x, y, width, height } = message;
                        if (entityCommandPermissions && !entityCommandPermissions.canEdit(getEntityCenterCoordinates({ x, y }, { width, height }))) break;
                        await mapsManager.executeCommand(mapKey, mapUrl.host, new CreateEntityCommand(gameMap, message.id, {
                            prefabRef: { id: message.prefabId, collectionName: message.collectionName },
                            x: message.x, y: message.y, properties: message.properties as EntityDataProperties, name: message.name,
                        }, commandId));
                        break;
                    }
                    case "deleteEntityMessage": {
                        await mapsManager.executeCommand(mapKey, mapUrl.host, new DeleteEntityMapStorageCommand(gameMap, editMapMessage.deleteEntityMessage.id, commandId, mapUrl.hostname, hookManager));
                        break;
                    }
                    case "uploadEntityMessage": {
                        await entitiesManager.executeCommand(new UploadEntityMapStorageCommand(editMapMessage.uploadEntityMessage, mapUrl.hostname));
                        break;
                    }
                    case "modifyCustomEntityMessage": {
                        await entitiesManager.executeCommand(new ModifyCustomEntityMapStorageCommand(editMapMessage.modifyCustomEntityMessage, mapUrl.hostname));
                        break;
                    }
                    case "deleteCustomEntityMessage": {
                        await entitiesManager.executeCommand(new DeleteCustomEntityMapStorageCommand(editMapMessage.deleteCustomEntityMessage, gameMap, mapUrl.hostname));
                        break;
                    }
                    case "updateWAMSettingsMessage": {
                        const wam = gameMap.getWam();
                        if (wam) await mapsManager.executeCommand(mapKey, mapUrl.host, new UpdateWAMSettingCommand(wam, editMapMessage.updateWAMSettingsMessage, commandId));
                        break;
                    }
                    case "modifiyWAMMetadataMessage": {
                        const wam = gameMap.getWam();
                        if (wam) await mapsManager.executeCommand(mapKey, mapUrl.host, new UpdateWAMMetadataCommand(wam, editMapMessage.modifiyWAMMetadataMessage, commandId));
                        break;
                    }
                    case "uploadFileMessage": {
                        await entitiesManager.executeCommand(new UploadFileMapStorageCommand(editMapMessage.uploadFileMessage, mapUrl.hostname));
                        editMapMessage.uploadFileMessage.file = new Uint8Array(0);
                        break;
                    }
                }
                mapsManager.addCommandToQueue(mapKey, editMapCommandMessage);
                callback(null, editMapCommandMessage);
            });
        } )().catch((e: unknown) => {
            console.error(e);
            Sentry.captureException(e);
            callback(null, {
                id: call.request.editMapCommandMessage?.id ?? "Unknown",
                editMapMessage: {
                    // FIXED: Flattened structure for error response
                    $case: "errorCommandMessage",
                    errorCommandMessage: {
                        reason: getMessageFromError(e),
                    },
                } as any,
            });
        });
    },
};

function getMessageFromError(error: unknown): string {
    if (error instanceof Error) return error.message;
    if (typeof error === "string") return error;
    return "Unknown error";
}

function getEntityCenterCoordinates(entityCoordinates: EntityCoordinates, entityDimensions: EntityDimensions) {
    return {
        x: entityCoordinates.x + entityDimensions.width * 0.5,
        y: entityCoordinates.y + entityDimensions.height * 0.5,
    };
}

export { mapStorageServer };