import crypto from "crypto";
import type {
    ZoneMessage,
    AskPositionMessage,
    BanUserMessage,
    BatchToPusherRoomMessage,
    EditMapCommandMessage,
    EditMapCommandsArrayMessage,
    EditMapCommandWithKeyMessage,
    EmoteEventMessage,
    EmotePromptMessage,
    FollowAbortMessage,
    FollowConfirmationMessage,
    FollowRequestMessage,
    ItemEventMessage,
    ItemStateMessage,
    JitsiJwtAnswer,
    JitsiJwtQuery,
    JoinBBBMeetingAnswer,
    JoinBBBMeetingQuery,
    JoinRoomMessage,
    KickOffMessage,
    LockGroupPromptMessage,
    PlayerDetailsUpdatedMessage,
    QueryMessage,
    RoomDescription,
    RoomsList,
    SendEventQuery,
    SendUserMessage,
    SetPlayerDetailsMessage,
    SubToPusherRoomMessage,
    UpdateMapToNewestWithKeyMessage,
    UpdateSpaceMetadataMessage,
    UpdateSpaceUserMessage,
    UserMovesMessage,
    VariableMessage,
    Zone as ProtoZone,
    PublicEvent,
    PrivateEvent,
    LeaveSpaceMessage,
    JoinSpaceMessage,
    ExternalModuleMessage,
    SyncSpaceUsersMessage,
    SpaceQueryMessage,
    AddSpaceUserToNotifyMessage,
    DeleteSpaceUserToNotifyMessage,
    AbortQueryMessage,
} from "@workadventure/messages";
import {
    AnswerMessage,
    RoomJoinedMessage,
    UserJoinedZoneMessage,
    FilterType,
    AskPositionMessage_AskType,
} from "@workadventure/messages";
import Jwt from "jsonwebtoken";
import BigbluebuttonJs from "bigbluebutton-js";
import Debug from "debug";
import * as Sentry from "@sentry/node";
import { WAMSettingsUtils } from "@workadventure/map-editor";
import { z } from "zod";
import type { ServiceError } from "@grpc/grpc-js";
import { asError } from "catch-unknown";
import { GameRoom } from "../Model/GameRoom";
import type { UserSocket } from "../Model/User";
import { User } from "../Model/User";
import { ProtobufUtils } from "../Model/Websocket/ProtobufUtils";
import { Group } from "../Model/Group";
import { GROUP_RADIUS, MINIMUM_DISTANCE } from "../Enum/EnvironmentVariable";
import type { Movable } from "../Model/Movable";
import type { PositionInterface } from "../Model/PositionInterface";
import type { EventSocket, RoomSocket, VariableSocket } from "../RoomManager";
import type { Zone, ZonePosition } from "../Model/Zone";
import type { Admin } from "../Model/Admin";
import { Space } from "../Model/Space";
import type { SpacesWatcher } from "../Model/SpacesWatcher";
import { eventProcessor } from "../Model/EventProcessorInit";
import { gaugeManager } from "./GaugeManager";
import { clientEventsEmitter } from "./ClientEventsEmitter";
import { getMapStorageClient } from "./MapStorageClient";
import { emitError } from "./MessageHelpers";
import { cpuTracker } from "./CpuTracker";

const debug = Debug("socketmanager");

function emitZoneMessage(subMessage: SubToPusherRoomMessage, socket: RoomSocket): void {
    const batchMessage: BatchToPusherRoomMessage = {
        payload: [subMessage],
    };
    socket.write(batchMessage);
}

export class SocketManager {
    private static toZoneMessage(
        zonePosition: ZonePosition,
        zonePayload: ZoneMessage
    ): SubToPusherRoomMessage {
        return {
            $case: "zoneMessage",
            zoneMessage: {
                x: zonePosition.x,
                y: zonePosition.y,
                ...(zonePayload as any),
            },
        } as any;
    }
    
    private resolvedRooms = new Map<string, GameRoom>();
    private roomsPromises = new Map<string, PromiseLike<GameRoom>>();
    private spaces = new Map<string, Space>();

    /**
     * FIXED: handleUpdateMapToNewestMessage now uses Promise (1 argument) instead of Callback (2 arguments)
     */
    public async handleJoinRoom(
        socket: UserSocket,
        joinRoomMessage: JoinRoomMessage
    ): Promise<{ room: GameRoom; user: User }> {
        const { room, user } = await this.joinRoom(socket, joinRoomMessage);
        const lastCommandId = joinRoomMessage.lastCommandId;
        let commandsToApply: EditMapCommandMessage[] | undefined = undefined;

        if (room.wamUrl) {
            const updateMapToNewestWithKeyMessage: UpdateMapToNewestWithKeyMessage = {
                mapKey: room.wamUrl,
                updateMapToNewestMessage: {
                    commandId: lastCommandId,
                },
            };

            try {
                // FIXED: Arguments count mismatch fix
                const message = await getMapStorageClient().handleUpdateMapToNewestMessage(updateMapToNewestWithKeyMessage);
                commandsToApply = message.editMapCommands;
            } catch (err) {
                emitError(user.socket, err);
                throw err;
            }
        }

        if (!socket.writable) {
            console.warn("Socket was aborted");
            return { room, user };
        }

        let editMapCommandsArrayMessage: EditMapCommandsArrayMessage | undefined = undefined;
        if (commandsToApply) {
            editMapCommandsArrayMessage = {
                editMapCommands: commandsToApply,
            };
        }

        const itemStateMessage: ItemStateMessage[] = [];
        for (const [itemId, item] of room.getItemsState().entries()) {
            itemStateMessage.push({
                itemId: itemId,
                stateJson: JSON.stringify(item),
            });
        }

        const variables = await room.getVariablesForTags(user.tags);
        const variablesMessage: VariableMessage[] = [];
        for (const [name, value] of variables.entries()) {
            variablesMessage.push({ name, value });
        }

        const playerVariables = user.getVariables().getVariables();
        const playerVariablesMessage: VariableMessage[] = [];
        for (const [name, value] of playerVariables.entries()) {
            playerVariablesMessage.push({ name, value: value.value });
        }

        const roomJoinedMessage: Partial<RoomJoinedMessage> = {
            tag: joinRoomMessage.tag,
            userRoomToken: joinRoomMessage.userRoomToken,
            characterTextures: joinRoomMessage.characterTextures,
            companionTexture: joinRoomMessage.companionTexture,
            canEdit: joinRoomMessage.canEdit,
            editMapCommandsArrayMessage,
            item: itemStateMessage,
            variable: variablesMessage,
            currentUserId: user.id,
            activatedInviteUser: user.activatedInviteUser != undefined ? user.activatedInviteUser : true,
            applications: user.applications ?? [],
            playerVariable: playerVariablesMessage,
            megaphoneSettings: {
                enabled: WAMSettingsUtils.canUseMegaphone(room.wamSettings, user.tags),
                url: WAMSettingsUtils.getMegaphoneUrl(
                    room.wamSettings,
                    room.roomGroup ?? new URL(room.roomUrl).host,
                    room.roomUrl
                ),
            },
        };

        user.write({
            $case: "roomJoinedMessage",
            roomJoinedMessage: RoomJoinedMessage.fromPartial(roomJoinedMessage),
        } as any);

        return { room, user };
    }

    handleUserMovesMessage(room: GameRoom, user: User, userMoves: UserMovesMessage) {
        const position = userMoves.position;
        if (cpuTracker.isOverHeating() && userMoves.position?.moving === true) {
            return;
        }
        if (position === undefined) throw new Error("Position not found in message");
        const viewport = userMoves.viewport;
        if (viewport === undefined) throw new Error("Viewport not found in message");

        room.updatePosition(user, ProtobufUtils.toPointInterface(position));
    }

    handleSetPlayerDetails(room: GameRoom, user: User, playerDetailsMessage: SetPlayerDetailsMessage) {
        room.updatePlayerDetails(user, playerDetailsMessage);
    }

    handleItemEvent(room: GameRoom, user: User, itemEventMessage: ItemEventMessage) {
        const itemEvent = ProtobufUtils.toItemEvent(itemEventMessage);
        for (const user of room.getUsers().values()) {
            user.emitInBatch({
                $case: "itemEventMessage",
                itemEventMessage,
            } as any);
        }
        room.setItemState(itemEvent.itemId, itemEvent.state);
    }

    handleVariableEvent(room: GameRoom, user: User, variableMessage: VariableMessage): Promise<void> {
        return room.setVariable(variableMessage.name, variableMessage.value, user);
    }

    async readVariable(roomUrl: string, variable: string): Promise<string | undefined> {
        const room = await this.getOrCreateRoom(roomUrl);
        const variables = await room.getVariablesForTags(undefined);
        return variables.get(variable);
    }

    async saveVariable(roomUrl: string, variable: string, newValue: string): Promise<void> {
        const room = await this.getOrCreateRoom(roomUrl);
        await room.setVariable(variable, newValue, "RoomApi");
    }

    leaveRoom(room: GameRoom, user: User) {
        try {
            room.leave(user);
            this.cleanupRoomIfEmpty(room);
        } finally {
            clientEventsEmitter.clientLeaveSubject.next({ clientUUid: user.uuid, roomId: room.roomUrl });
        }
    }

    async getOrCreateRoom(roomId: string): Promise<GameRoom> {
        let roomPromise = this.roomsPromises.get(roomId);
        if (roomPromise === undefined) {
            roomPromise = GameRoom.create(
                roomId,
                (user: User, group: Group) => this.joinWebRtcRoom(user, group),
                (user: User, group: Group) => this.disConnectedUser(user, group),
                MINIMUM_DISTANCE,
                GROUP_RADIUS,
                (thing: Movable, currentZone: ZonePosition, fromZone: Zone | null, listener: RoomSocket) => this.onZoneEnter(thing, currentZone, fromZone, listener),
                (thing: Movable, currentZone: ZonePosition, position: PositionInterface, listener: RoomSocket) => this.onClientMove(thing, currentZone, position, listener),
                (thing: Movable, currentZone: ZonePosition, newZone: Zone | null, listener: RoomSocket) => this.onClientLeave(thing, currentZone, newZone, listener),
                (emoteEventMessage: EmoteEventMessage, currentZone: ZonePosition, listener: RoomSocket) => this.onEmote(emoteEventMessage, currentZone, listener),
                (currentZone: ZonePosition, groupId: number, listener: RoomSocket) => {
                    this.onLockGroup(currentZone, groupId, listener, roomPromise).catch((e) => {
                        console.error("An error happened while handling a lock group event:", e);
                        Sentry.captureException(e);
                    });
                },
                (currentZone: ZonePosition, playerDetailsUpdatedMessage: PlayerDetailsUpdatedMessage, listener: RoomSocket) => this.onPlayerDetailsUpdated(currentZone, playerDetailsUpdatedMessage, listener),
                (currentZone: ZonePosition, group: Group, listener: RoomSocket) => this.onUserEntersOrLeavesBubble(currentZone, group, listener)
            )
            .then((gameRoom) => {
                gaugeManager.incNbRoomGauge();
                this.resolvedRooms.set(roomId, gameRoom);
                return gameRoom;
            })
            .catch((e) => {
                this.roomsPromises.delete(roomId);
                throw e;
            });
            this.roomsPromises.set(roomId, roomPromise);
        }
        return roomPromise;
    }

    private async joinRoom(
        socket: UserSocket,
        joinRoomMessage: JoinRoomMessage
    ): Promise<{ room: GameRoom; user: User }> {
        const roomId = joinRoomMessage.roomId;
        const room = await this.getOrCreateRoom(roomId);
        const user = await room.join(socket, joinRoomMessage);
        clientEventsEmitter.clientJoinSubject.next({ clientUUid: user.uuid, roomId: roomId });
        return { room, user };
    }

    private onZoneEnter(thing: Movable, currentZone: ZonePosition, fromZone: Zone | null, listener: RoomSocket) {
        if (thing instanceof User) {
            const subMessage = SocketManager.toUserJoinedZoneMessage(thing, currentZone, fromZone);
            emitZoneMessage(subMessage, listener);
        } else if (thing instanceof Group) {
            this.emitCreateUpdateGroupEvent(listener, currentZone, fromZone, thing);
        }
    }

    private static toUserJoinedZoneMessage(
        user: User,
        currentZone: ZonePosition,
        fromZone?: Zone | null
    ): SubToPusherRoomMessage {
        if (!Number.isInteger(user.id)) throw new Error(`userId is not an integer ${user.id}`);
        const userJoinedZoneMessage: any = {
            userId: user.id,
            userUuid: user.uuid,
            name: user.name,
            availabilityStatus: user.getAvailabilityStatus(),
            characterTextures: user.characterTextures,
            position: ProtobufUtils.toPositionMessage(user.getPosition()),
            chatID: user.chatID,
        };
        if (fromZone) userJoinedZoneMessage.fromZone = SocketManager.toProtoZone(fromZone);
        if (user.visitCardUrl) userJoinedZoneMessage.visitCardUrl = user.visitCardUrl;
        userJoinedZoneMessage.companionTexture = user.companionTexture;
        const outlineColor = user.getOutlineColor();
        if (outlineColor === undefined) {
            userJoinedZoneMessage.hasOutline = false;
        } else {
            userJoinedZoneMessage.hasOutline = true;
            userJoinedZoneMessage.outlineColor = outlineColor;
        }
        userJoinedZoneMessage.variables = {};
        for (const entry of user.getVariables().getVariables().entries()) {
            if (entry[1].isPublic) userJoinedZoneMessage.variables[entry[0]] = entry[1].value;
        }
        userJoinedZoneMessage.sayMessage = user.getSayMessage();

        return SocketManager.toZoneMessage(currentZone, {
            $case: "userJoinedZoneMessage",
            userJoinedZoneMessage: UserJoinedZoneMessage.fromPartial(userJoinedZoneMessage),
        } as any);
    }

    private onClientMove(thing: Movable, currentZone: ZonePosition, position: PositionInterface, listener: RoomSocket): void {
        if (thing instanceof User) {
            const posMsg = ProtobufUtils.toPositionMessage(thing.getPosition());
            emitZoneMessage(
                SocketManager.toZoneMessage(currentZone, {
                    $case: "userMovedMessage",
                    userMovedMessage: { userId: thing.id, position: posMsg },
                } as any),
                listener
            );
        } else if (thing instanceof Group) {
            this.emitCreateUpdateGroupEvent(listener, currentZone, null, thing);
        }
    }

    private onClientLeave(thing: Movable, currentZone: ZonePosition, newZone: Zone | null, listener: RoomSocket) {
        if (thing instanceof User) {
            this.emitUserLeftEvent(listener, currentZone, thing.id, newZone);
        } else if (thing instanceof Group) {
            this.emitDeleteGroupEvent(listener, currentZone, thing.getId(), newZone);
        }
    }

    private onUserEntersOrLeavesBubble(currentZone: ZonePosition, group: Group, client: RoomSocket) {
        emitZoneMessage(
            SocketManager.toZoneMessage(currentZone, {
                $case: "groupUsersUpdateMessage",
                groupUsersUpdateMessage: { groupId: group.getId(), userIds: group.getUsers().map((user) => user.id) },
            } as any),
            client
        );
    }

    private onEmote(emoteEventMessage: EmoteEventMessage, currentZone: ZonePosition, client: RoomSocket) {
        emitZoneMessage(
            SocketManager.toZoneMessage(currentZone, {
                $case: "emoteEventMessage",
                emoteEventMessage,
            } as any),
            client
        );
    }

    private async onLockGroup(currentZone: ZonePosition, groupId: number, client: RoomSocket, roomPromise: PromiseLike<GameRoom> | undefined): Promise<void> {
        if (!roomPromise) return;
        const group = (await roomPromise).getGroupById(groupId);
        if (!group) return;
        this.emitCreateUpdateGroupEvent(client, currentZone, null, group);
    }

    private onPlayerDetailsUpdated(currentZone: ZonePosition, playerDetailsUpdatedMessage: PlayerDetailsUpdatedMessage, client: RoomSocket) {
        emitZoneMessage(
            SocketManager.toZoneMessage(currentZone, {
                $case: "playerDetailsUpdatedMessage",
                playerDetailsUpdatedMessage,
            } as any),
            client
        );
    }

    private emitCreateUpdateGroupEvent(client: RoomSocket, currentZone: ZonePosition, fromZone: Zone | null, group: Group): void {
        const position = group.getPosition();
        emitZoneMessage(
            SocketManager.toZoneMessage(currentZone, {
                $case: "groupUpdateZoneMessage",
                groupUpdateZoneMessage: {
                    groupId: group.getId(),
                    position: { x: Math.floor(position.x), y: Math.floor(position.y) },
                    groupSize: group.getSize,
                    fromZone: SocketManager.toProtoZone(fromZone),
                    locked: group.isLocked(),
                    userIds: group.getUsers().map((user) => user.id),
                },
            } as any),
            client
        );
    }

    private emitDeleteGroupEvent(client: RoomSocket, currentZone: ZonePosition, groupId: number, newZone: Zone | null): void {
        emitZoneMessage(
            SocketManager.toZoneMessage(currentZone, {
                $case: "groupLeftZoneMessage",
                groupLeftZoneMessage: { groupId, toZone: SocketManager.toProtoZone(newZone) },
            } as any),
            client
        );
    }

    private emitUserLeftEvent(client: RoomSocket, currentZone: ZonePosition, userId: number, newZone: Zone | null): void {
        emitZoneMessage(
            SocketManager.toZoneMessage(currentZone, {
                $case: "userLeftZoneMessage",
                userLeftZoneMessage: { userId, toZone: SocketManager.toProtoZone(newZone) },
            } as any),
            client
        );
    }

    private static toProtoZone(zone: Zone | null): ProtoZone | undefined {
        return zone !== null ? { x: zone.x, y: zone.y } : undefined;
    }

    private joinWebRtcRoom(user: User, group: Group) {
        user.write({
            $case: "joinSpaceRequestMessage",
            joinSpaceRequestMessage: {
                spaceName: group.spaceName,
                propertiesToSync: ["cameraState", "microphoneState", "screenSharingState"],
            },
        } as any);
    }

    private disConnectedUser(user: User, group: Group) {
        user.write({
            $case: "leaveSpaceRequestMessage",
            leaveSpaceRequestMessage: { spaceName: group.spaceName },
        } as any);
    }

    public getWorlds(): Map<string, PromiseLike<GameRoom>> {
        return this.roomsPromises;
    }

    public async handleQueryMessage(gameRoom: GameRoom, user: User, queryMessage: QueryMessage): Promise<void> {
        const query = queryMessage as any;
        if (!query.$case) {
            console.error("QueryMessage has no case");
            return;
        }

        const answerMessage: any = { id: queryMessage.id };
        const abortController = new AbortController();
        user.queryMessageAbortControllers.set(queryMessage.id, abortController);

        try {
            switch (query.$case) {
                case "jitsiJwtQuery": {
                    const answer = await this.handleQueryJitsiJwtMessage(gameRoom, user, query.jitsiJwtQuery);
                    answerMessage.$case = "jitsiJwtAnswer";
                    answerMessage.jitsiJwtAnswer = answer;
                    break;
                }
                case "joinBBBMeetingQuery": {
                    const answer = await this.handleJoinBBBMeetingMessage(gameRoom, user, query.joinBBBMeetingQuery);
                    answerMessage.$case = "joinBBBMeetingAnswer";
                    answerMessage.joinBBBMeetingAnswer = answer;
                    break;
                }
                case "sendEventQuery": {
                    this.handleSendEventQuery(gameRoom, user, query.sendEventQuery);
                    answerMessage.$case = "sendEventAnswer";
                    answerMessage.sendEventAnswer = {};
                    break;
                }
                default: break;
            }
        } catch (e) {
            const error = asError(e);
            answerMessage.$case = "error";
            answerMessage.error = { message: error.message };
        } finally {
            user.queryMessageAbortControllers.delete(queryMessage.id);
        }

        user.write({
            $case: "answerMessage",
            answerMessage: AnswerMessage.fromPartial(answerMessage),
        } as any);
    }

    public handleAbortQueryMessage(room: GameRoom, user: User, abortQueryMessage: AbortQueryMessage) {
        const controller = user.queryMessageAbortControllers.get(abortQueryMessage.id);
        if (controller) controller.abort();
    }

    public async handleQueryJitsiJwtMessage(gameRoom: GameRoom, user: User, queryJitsiJwtMessage: JitsiJwtQuery): Promise<JitsiJwtAnswer> {
        const jitsiRoom = queryJitsiJwtMessage.jitsiRoom;
        const jitsiSettings = gameRoom.getJitsiSettings();
        if (jitsiSettings === undefined || !jitsiSettings.secret) throw new Error("Jitsi secret not set.");

        let isAdmin = user.tags.includes("admin");
        if (!isAdmin) {
            const moderatorTag = await gameRoom.getModeratorTagForJitsiRoom(jitsiRoom);
            if (moderatorTag && user.tags.includes(moderatorTag)) isAdmin = true;
        }

        const jwt = Jwt.sign({ aud: "jitsi", context: { user: { id: user.id, name: user.name }, features: { livestreaming: isAdmin, recording: isAdmin } }, iss: jitsiSettings.iss, sub: jitsiSettings.url, room: jitsiRoom, moderator: isAdmin }, jitsiSettings.secret, { expiresIn: "1d", algorithm: "HS256", header: { alg: "HS256", typ: "JWT" } });
        return { jwt, url: jitsiSettings.url };
    }

    public async handleJoinBBBMeetingMessage(gameRoom: GameRoom, user: User, joinBBBMeetingQuery: JoinBBBMeetingQuery): Promise<JoinBBBMeetingAnswer> {
        const { meetingId, localMeetingId, meetingName } = joinBBBMeetingQuery;
        const bbbSettings = gameRoom.getBbbSettings();
        if (bbbSettings === undefined || !bbbSettings.secret) throw new Error("BBB settings/secret not set.");

        let isAdmin = user.tags.includes("admin");
        if (!isAdmin) {
            const moderatorTag = await gameRoom.getModeratorTagForBbbMeeting(localMeetingId);
            if (moderatorTag === undefined || (moderatorTag && user.tags.includes(moderatorTag))) isAdmin = true;
        }

        const api = BigbluebuttonJs.api(bbbSettings.url, bbbSettings.secret);
        const maxPWLen = 50;
        const attendeePW = crypto.createHmac("sha256", bbbSettings.secret).update(`attendee-${meetingId}`).digest("hex").slice(0, maxPWLen);
        const moderatorPW = crypto.createHmac("sha256", bbbSettings.secret).update(`moderator-${meetingId}`).digest("hex").slice(0, maxPWLen);

        await BigbluebuttonJs.http(api.administration.create(meetingName, meetingId, { attendeePW, moderatorPW, record: true }));
        const clientURL = api.administration.join(user.name, meetingId, isAdmin ? moderatorPW : attendeePW, { userID: user.id, joinViaHtml5: true });

        return { meetingId, clientURL };
    }

    public handleSendUserMessage(user: User, sendUserMessageToSend: SendUserMessage) {
        user.write({ $case: "sendUserMessage", sendUserMessage: sendUserMessageToSend } as any);
    }

    public handleBanUserMessage(room: GameRoom, user: User, banUserMessageToSend: BanUserMessage) {
        user.write({ $case: "sendUserMessage", sendUserMessage: banUserMessageToSend } as any);
        setTimeout(() => { room.leave(user); user.socket.end(); }, 10000);
    }

    public async addZoneListener(call: RoomSocket, roomId: string, x: number, y: number): Promise<void> {
        const room = await this.roomsPromises.get(roomId);
        if (!room) throw new Error("Room not found");
        const things = room.addZoneListener(call, x, y);
        const batch: any = { payload: [] };

        for (const thing of things) {
            if (thing instanceof User) {
                batch.payload.push(SocketManager.toUserJoinedZoneMessage(thing, { x, y }));
            } else if (thing instanceof Group) {
                batch.payload.push(SocketManager.toZoneMessage({ x, y }, { $case: "groupUpdateZoneMessage", groupUpdateZoneMessage: { groupId: thing.getId(), position: ProtobufUtils.toPointMessage(thing.getPosition()), groupSize: thing.getSize, fromZone: undefined, locked: thing.isLocked(), userIds: thing.getUsers().map(u => u.id) } } as any));
            }
        }
        call.write(batch);
    }

    async removeZoneListener(call: RoomSocket, roomId: string, x: number, y: number): Promise<void> {
        const room = await this.roomsPromises.get(roomId);
        if (room) { room.removeZoneListener(call, x, y); this.cleanupRoomIfEmpty(room); }
    }

    async addRoomListener(call: RoomSocket, roomId: string) {
        const room = await this.getOrCreateRoom(roomId);
        room.addRoomListener(call);
    }

    async removeRoomListener(call: RoomSocket, roomId: string) {
        const room = await this.roomsPromises.get(roomId);
        if (room) room.removeRoomListener(call);
    }

    async addVariableListener(call: VariableSocket) {
        const room = await this.getOrCreateRoom(call.request.room);
        room.addVariableListener(call);
    }

    async removeVariableListener(call: VariableSocket) {
        const room = await this.roomsPromises.get(call.request.room);
        if (room) { room.removeVariableListener(call); this.cleanupRoomIfEmpty(room); }
    }

    public async handleJoinAdminRoom(admin: Admin, roomId: string): Promise<GameRoom> {
        const room = await this.getOrCreateRoom(roomId);
        room.adminJoin(admin);
        return room;
    }

    public leaveAdminRoom(room: GameRoom, admin: Admin) {
        room.adminLeave(admin);
        this.cleanupRoomIfEmpty(room);
    }

    private cleanupRoomIfEmpty(room: GameRoom): void {
        if (room.isEmpty()) {
            this.roomsPromises.delete(room.roomUrl);
            if (this.resolvedRooms.delete(room.roomUrl)) gaugeManager.decNbRoomGauge();
        }
    }

    public async sendAdminMessage(roomId: string, recipientUuid: string, message: string, type: string): Promise<void> {
        const room = await this.roomsPromises.get(roomId);
        if (!room) return;
        const recipients = room.getUsersByUuid(recipientUuid);
        for (const recipient of recipients) recipient.write({ $case: "sendUserMessage", sendUserMessage: { message, type } } as any);
    }

    public async banUser(roomId: string, recipientUuid: string, message: string): Promise<void> {
        const room = await this.roomsPromises.get(roomId);
        if (!room) return;
        const recipients = room.getUsersByUuid(recipientUuid);
        for (const recipient of recipients) { room.leave(recipient); recipient.write({ $case: "banUserMessage", banUserMessage: { message, type: "banned" } } as any); recipient.socket.end(); }
    }

    async sendAdminRoomMessage(roomId: string, message: string, type: string) {
        const room = await this.roomsPromises.get(roomId);
        if (!room) return;
        room.getUsers().forEach(r => r.write({ $case: "sendUserMessage", sendUserMessage: { message, type } } as any));
    }

    async dispatchWorldFullWarning(roomId: string): Promise<void> {
        const room = await this.roomsPromises.get(roomId);
        if (!room) return;
        room.getUsers().forEach(r => r.write({ $case: "worldFullWarningMessage", worldFullWarningMessage: {} } as any));
    }

    async dispatchRoomRefresh(roomId: string): Promise<void> {
        const room = await this.roomsPromises.get(roomId);
        if (!room) return;
        const versionNumber = await room.incrementVersion();
        room.getUsers().forEach(r => r.write({ $case: "refreshRoomMessage", refreshRoomMessage: { roomId, versionNumber } } as any));
    }

    handleEmoteEventMessage(room: GameRoom, user: User, emotePromptMessage: EmotePromptMessage) {
        room.emitEmoteEvent(user, { emote: emotePromptMessage.emote, actorUserId: user.id });
    }

    handleFollowRequestMessage(room: GameRoom, user: User, message: FollowRequestMessage) {
        room.sendToOthersInGroupIncludingUser(user, { $case: "followRequestMessage", followRequestMessage: message } as any);
    }

    handleFollowConfirmationMessage(room: GameRoom, user: User, message: FollowConfirmationMessage) {
        const leader = room.getUserById(message.leader);
        if (!leader) return;
        if (user?.group?.leader && user?.group?.leader !== leader) user.group.leader.stopLeading();
        leader.addFollower(user);
    }

    handleFollowAbortMessage(room: GameRoom, user: User, message: FollowAbortMessage) {
        const leader = room.getUserById(message.leader);
        if (user.id === message.leader) leader?.stopLeading(); else leader?.delFollower(user);
    }

    handleLockGroupPromptMessage(room: GameRoom, user: User, message: LockGroupPromptMessage) {
        const group = user.group;
        if (!group) return;
        group.lock(message.lock);
        room.emitLockGroupEvent(user, group.getId());
    }

    /**
     * FIXED: Arguments count mismatch fix
     */
    async handleUpdateMapToNewestMessage(room: GameRoom, user: User, message: UpdateMapToNewestWithKeyMessage) {
        try {
            const msg = await getMapStorageClient().handleUpdateMapToNewestMessage(message);
            msg.editMapCommands.forEach(c => user.emitInBatch({ $case: "editMapCommandMessage", editMapCommandMessage: c } as any));
        } catch (err) {
            emitError(user.socket, err);
        }
    }

    getAllRooms(): RoomsList {
        const roomsList: RoomDescription[] = [];
        for (const room of this.resolvedRooms.values()) {
            roomsList.push({ roomId: room.roomUrl, nbUsers: room.getUsers().size });
        }
        return { roomDescription: roomsList };
    }

    handleAskPositionMessage(room: GameRoom, user: User, askPositionMessage: AskPositionMessage) {
        if (!room) return;
        const userToJoin = room.getUserByUuid(askPositionMessage.userIdentifier);
        const position = userToJoin?.getPosition();
        if (position && askPositionMessage.askType === AskPositionMessage_AskType.MOVE) {
            user.write({ $case: "moveToPositionMessage", moveToPositionMessage: { position: ProtobufUtils.toPositionMessage(position) } } as any);
        } else if (userToJoin && position && askPositionMessage.askType === AskPositionMessage_AskType.LOCATE) {
            user.write({ $case: "locatePositionMessage", locatePositionMessage: { position: ProtobufUtils.toPositionMessage(position), userId: userToJoin.id } } as any);
        }
    }

    handleJoinSpaceMessage(pusher: SpacesWatcher, joinSpaceMessage: JoinSpaceMessage) {
        let space = this.spaces.get(joinSpaceMessage.spaceName);
        if (!space) {
            if (joinSpaceMessage.filterType === FilterType.UNRECOGNIZED) throw new Error("Unrecognized filter");
            space = new Space(joinSpaceMessage.spaceName, joinSpaceMessage.filterType, eventProcessor, joinSpaceMessage.propertiesToSync, joinSpaceMessage.world);
            this.spaces.set(joinSpaceMessage.spaceName, space);
            clientEventsEmitter.newSpaceSubject.next(space);
        }
        pusher.watchSpace(space.name);
        space.addWatcher(pusher);
    }

    handleLeaveSpaceMessage(pusher: SpacesWatcher, leaveSpaceMessage: LeaveSpaceMessage) {
        const space = this.spaces.get(leaveSpaceMessage.spaceName);
        if (space) this.removeSpaceWatcher(pusher, space);
    }

    handleUnwatchAllSpaces(pusher: SpacesWatcher) {
        pusher.spacesWatched.forEach(n => { const s = this.spaces.get(n); if (s) this.removeSpaceWatcher(pusher, s); });
    }

    private removeSpaceWatcher(watcher: SpacesWatcher, space: Space) {
        watcher.unwatchSpace(space.name);
        space.removeWatcher(watcher);
        if (space.canBeDeleted()) { this.spaces.delete(space.name); clientEventsEmitter.deleteSpaceSubject.next(space); }
    }

    handleUpdateSpaceUserMessage(pusher: SpacesWatcher, msg: UpdateSpaceUserMessage) {
        const space = this.spaces.get(msg.spaceName);
        if (space && msg.user && msg.updateMask) space.updateUser(pusher, msg.user, msg.updateMask);
    }

    handleUpdateSpaceMetadataMessage(pusher: SpacesWatcher, msg: UpdateSpaceMetadataMessage) {
        const space = this.spaces.get(msg.spaceName);
        if (space) space.updateMetadata(pusher, JSON.parse(msg.metadata));
    }

    handleKickSpaceUserMessage(pusher: SpacesWatcher, msg: KickOffMessage) {
        const space = this.spaces.get(msg.spaceName);
        if (space) pusher.write({ $case: "kickOffMessage", kickOffMessage: { spaceName: msg.spaceName, userId: msg.userId } } as any);
    }

    handleSyncSpaceUsersMessage(pusher: SpacesWatcher, msg: SyncSpaceUsersMessage) {
        const space = this.spaces.get(msg.spaceName);
        if (space) space.syncUsersFromPusher(pusher, msg.users);
    }

    handlePublicEvent(pusher: SpacesWatcher, publicEvent: PublicEvent) {
        const space = this.spaces.get(publicEvent.spaceName);
        if (space) space.dispatchPublicEvent(publicEvent);
    }

    handlePrivateEvent(pusher: SpacesWatcher, privateEvent: PrivateEvent) {
        const space = this.spaces.get(privateEvent.spaceName);
        if (space) space.dispatchPrivateEvent(privateEvent);
    }

    private handleSendEventQuery(gameRoom: GameRoom, user: User, sendEventQuery: SendEventQuery) {
        gameRoom.dispatchEvent(sendEventQuery.name, sendEventQuery.data, user.id, sendEventQuery.targetUserIds);
    }

    async dispatchEvent(roomUrl: string, name: string, value: unknown, targetUserIds: number[]): Promise<void> {
        const room = await this.roomsPromises.get(roomUrl);
        if (room) room.dispatchEvent(name, value, "RoomApi", targetUserIds);
    }

    async addEventListener(call: EventSocket) {
        const room = await this.getOrCreateRoom(call.request.room);
        room.addEventListener(call);
    }

    async removeEventListener(call: EventSocket) {
        const room = await this.roomsPromises.get(call.request.room);
        if (room) { room.removeEventListener(call); this.cleanupRoomIfEmpty(room); }
    }

    dispatchGlobalEvent(name: string, value: unknown) {
        for (const room of this.resolvedRooms.values()) room.dispatchEvent(name, value, "RoomApi", []);
    }

    handleKickOffUserMessage(user: User, userKickedUuid: string) {
        const group = user.group;
        if (!group || !user.tags.includes("admin")) return;
        const kiked = group.getUsers().filter(u => u.uuid === userKickedUuid);
        kiked.forEach(u => group.leave(u));
        group.setOutOfBounds(true);
    }

    async handleExternalModuleMessage(msg: ExternalModuleMessage) {
        if (!msg.roomId || !msg.recipientUuid) return;
        const room = await this.roomsPromises.get(msg.roomId);
        if (!room) return;
        const recipients = room.getUsersByUuid(msg.recipientUuid);
        recipients.forEach(r => r.socket.write({ $case: "externalModuleMessage", externalModuleMessage: msg } as any));
    }

    closeSpaceConnection(spaceName: string) {
        const space = this.spaces.get(spaceName);
        if (space) { space.closeAllWatcherConnections(); this.spaces.delete(spaceName); clientEventsEmitter.deleteSpaceSubject.next(space); }
    }

    /**
     * FIXED: Flattened spaceAnswerMessage and Property 'query' does not exist fix
     */
    handleSpaceQueryMessage(pusher: SpacesWatcher, spaceQueryMessage: SpaceQueryMessage) {
        const space = this.spaces.get(spaceQueryMessage.spaceName);
        
        // FIX: Cast as any to access flattened $case and query fields
        const msg = spaceQueryMessage as any;
        if (!space || !msg.$case) return;

        try {
            const answer = space.handleQuery(pusher, msg);
            pusher.write({
                $case: "spaceAnswerMessage",
                spaceAnswerMessage: {
                    id: spaceQueryMessage.id,
                    answer: answer.answer,
                    spaceName: spaceQueryMessage.spaceName,
                },
            } as any);
        } catch (e) {
            Sentry.captureException("Error space query");
        }
    }

    handleAddSpaceUserToNotifyMessage(pusher: SpacesWatcher, msg: AddSpaceUserToNotifyMessage) {
        const space = this.spaces.get(msg.spaceName);
        if (space && msg.user) space.addUserToNotify(pusher, msg.user);
    }

    handleDeleteSpaceUserToNotifyMessage(pusher: SpacesWatcher, msg: DeleteSpaceUserToNotifyMessage) {
        const space = this.spaces.get(msg.spaceName);
        if (space && msg.user) space.deleteUserToNotify(pusher, msg.user);
    }
}

export const socketManager = new SocketManager();