import { clearInterval } from "timers";
import type {
    AdminGlobalMessage,
    AdminMessage,
    AdminPusherToBackMessage,
    AdminRoomMessage,
    BanMessage,
    BatchToPusherRoomMessage,
    EventRequest,
    EventResponse,
    PingMessage,
    PusherToBackMessage,
    PusherToBackRoomMessage,
    RefreshRoomPromptMessage,
    RoomsList,
    ServerToAdminClientMessage,
    ServerToClientMessage,
    VariableRequest,
    WorldFullWarningToRoomMessage,
} from "@workadventure/messages";
import type { RoomManager } from "@workadventure/messages/src/ts-proto-generated/services";
import type { sendUnaryData, ServerDuplexStream, ServerUnaryCall, ServerWritableStream } from "@grpc/grpc-js";
import Debug from "debug";
import type { Empty } from "@workadventure/messages/src/ts-proto-generated/google/protobuf/empty";
import * as Sentry from "@sentry/node";
import { socketManager } from "./Services/SocketManager";
import { emitError, emitErrorOnAdminSocket, emitErrorOnRoomSocket } from "./Services/MessageHelpers";
import type { User, UserSocket } from "./Model/User";
import type { GameRoom } from "./Model/GameRoom";
import { Admin } from "./Model/Admin";
import { getMapStorageClient } from "./Services/MapStorageClient";

const debug = Debug("roommanager");

export type AdminSocket = ServerDuplexStream<AdminPusherToBackMessage, ServerToAdminClientMessage>;
export type RoomSocket = ServerDuplexStream<PusherToBackRoomMessage, BatchToPusherRoomMessage>;
export type VariableSocket = ServerWritableStream<VariableRequest, unknown>;
export type EventSocket = ServerWritableStream<EventRequest, EventResponse>;

const PONG_TIMEOUT = 70000; 
const PING_INTERVAL = 80000;



const roomManager: RoomManager = {
    joinRoom: (call: any): any => {
        let room: GameRoom | null = null;
        let user: User | null = null;
        let pongTimeoutId: NodeJS.Timeout | undefined;

        call.on("data", (message: PusherToBackMessage) => {
            if (pongTimeoutId) {
                clearTimeout(pongTimeoutId);
                pongTimeoutId = undefined;
            }

            (async () => {
                const msg = message as any;
                if (!msg) return;

                try {
                    if (room === null || user === null) {
                        if (msg.$case === "joinRoomMessage") {
                            socketManager
                                .handleJoinRoom(call, msg.joinRoomMessage!)
                                .then(({ room: gameRoom, user: myUser }) => {
                                    if (call.writable) {
                                        room = gameRoom;
                                        user = myUser;
                                    } else {
                                        socketManager.leaveRoom(gameRoom, myUser);
                                    }
                                })
                                .catch((e) => {
                                    emitError(call, e);
                                });
                        } else if (msg.$case !== "pingMessage") {
                            throw new Error("First message must be JoinRoomMessage");
                        }
                    } else {
                        switch (msg.$case) {
                            case "userMovesMessage":
                                socketManager.handleUserMovesMessage(room, user, msg.userMovesMessage!);
                                break;
                            case "itemEventMessage":
                                socketManager.handleItemEvent(room, user, msg.itemEventMessage!);
                                break;
                            case "variableMessage":
                                await socketManager.handleVariableEvent(room, user, msg.variableMessage!);
                                break;
                            case "queryMessage":
                                await socketManager.handleQueryMessage(room, user, msg.queryMessage!);
                                break;
                            case "emotePromptMessage":
                                socketManager.handleEmoteEventMessage(room, user, msg.emotePromptMessage!);
                                break;
                            case "followRequestMessage":
                                socketManager.handleFollowRequestMessage(room, user, msg.followRequestMessage!);
                                break;
                            case "followConfirmationMessage":
                                socketManager.handleFollowConfirmationMessage(room, user, msg.followConfirmationMessage!);
                                break;
                            case "editMapCommandMessage":
                                room.forwardEditMapCommandMessage(user, msg.editMapCommandMessage!);
                                break;
                            case "sendUserMessage":
                                socketManager.handleSendUserMessage(user, msg.sendUserMessage!);
                                break;
                            case "banUserMessage":
                                socketManager.handleBanUserMessage(room, user, msg.banUserMessage!);
                                break;
                            case "setPlayerDetailsMessage":
                                socketManager.handleSetPlayerDetails(room, user, msg.setPlayerDetailsMessage!);
                                break;
                            case "askPositionMessage":
                                socketManager.handleAskPositionMessage(room, user, msg.askPositionMessage!);
                                break;
                        }
                    }
                } catch (e) {
                    Sentry.captureException(e);
                    call.end();
                }
            })().catch((e) => console.error(e));
        });

        const closeConnection = () => {
            if (user !== null && room !== null) socketManager.leaveRoom(room, user);
            if (pingIntervalId) clearInterval(pingIntervalId);
            call.end();
        };

        call.on("end", () => closeConnection());
        call.on("error", () => closeConnection());

        const pingIntervalId = setInterval(() => {
            call.write({
                $case: "batchMessage",
                batchMessage: { 
                    event: "", 
                    payload: [{ $case: "pingMessage", pingMessage: {} } as any] 
                }
            } as any);
        }, PING_INTERVAL);
    },

    listenRoom(call: any): any {
        let roomId: string | null = null;
        const subscribedZones = new Map<string, { x: number; y: number }>();
        let messageProcessingPromise = Promise.resolve();

        call.on("data", (message: PusherToBackRoomMessage) => {
            messageProcessingPromise = messageProcessingPromise.then(async () => {
                const msg = message as any;
                if (!msg) return;
                try {
                    switch (msg.$case) {
                        case "initRoomMessage":
                            if (msg.initRoomMessage) {
                                roomId = msg.initRoomMessage.roomId;
                                await socketManager.addRoomListener(call, roomId!);
                            }
                            break;
                        case "subscribeZoneMessage":
                            if (!roomId || !msg.subscribeZoneMessage) return;
                            const sub = msg.subscribeZoneMessage;
                            subscribedZones.set(`${sub.x},${sub.y}`, { x: sub.x, y: sub.y });
                            await socketManager.addZoneListener(call, roomId, sub.x, sub.y);
                            break;
                        case "unsubscribeZoneMessage":
                            if (!roomId || !msg.unsubscribeZoneMessage) return;
                            const unsub = msg.unsubscribeZoneMessage;
                            subscribedZones.delete(`${unsub.x},${unsub.y}`);
                            await socketManager.removeZoneListener(call, roomId, unsub.x, unsub.y);
                            break;
                    }
                } catch (e) {
                    emitErrorOnRoomSocket(call, e);
                }
            });
        });

        const cleanupAllZones = async () => {
            if (roomId !== null) {
                try {
                    await socketManager.removeRoomListener(call, roomId);
                } finally {
                    const id = roomId;
                    await Promise.all(
                        Array.from(subscribedZones.values()).map((z) =>
                            socketManager.removeZoneListener(call, id, z.x, z.y)
                        )
                    );
                }
            }
        };

        call.on("cancelled", () => cleanupAllZones().finally(() => call.end()));
        call.on("close", () => cleanupAllZones());
        call.on("error", () => cleanupAllZones().finally(() => call.end()));
    },

    adminRoom(call: any): any {
        const admin = new Admin(call);
        let room: GameRoom | null = null;

        call.on("data", (message: AdminPusherToBackMessage) => {
            const msg = message as any;
            if (!msg) return;
            try {
                if (room === null) {
                    if (msg.$case === "subscribeToRoom") {
                        socketManager.handleJoinAdminRoom(admin, msg.subscribeToRoom).then(r => room = r);
                    }
                }
            } catch (e) {
                emitErrorOnAdminSocket(call, e);
                call.end();
            }
        });

        call.on("end", () => {
            if (room !== null) socketManager.leaveAdminRoom(room, admin);
            call.end();
        });
    },

    async sendAdminMessage(request: AdminMessage): Promise<Empty> {
        await socketManager.sendAdminMessage(request.roomId, request.recipientUuid, request.message, request.type);
        return {};
    },

    async sendGlobalAdminMessage(request: AdminGlobalMessage): Promise<Empty> {
        return {};
    },

    async ban(request: BanMessage): Promise<Empty> {
        await socketManager.banUser(request.roomId, request.recipientUuid, request.message);
        return {};
    },

    async sendAdminMessageToRoom(request: AdminRoomMessage): Promise<Empty> {
        await socketManager.sendAdminRoomMessage(request.roomId, request.message, request.type);
        return {};
    },

    async sendWorldFullWarningToRoom(request: WorldFullWarningToRoomMessage): Promise<Empty> {
        await socketManager.dispatchWorldFullWarning(request.roomId);
        return {};
    },

    async sendRefreshRoomPrompt(request: RefreshRoomPromptMessage): Promise<Empty> {
        await socketManager.dispatchRoomRefresh(request.roomId);
        return {};
    },

    async getRooms(request: Empty): Promise<RoomsList> {
        return socketManager.getAllRooms();
    },

    async ping(request: PingMessage): Promise<PingMessage> {
        return request;
    },

    async readVariable(request: VariableRequest): Promise<any> {
        const v = await socketManager.readVariable(request.room, request.name);
        return v === undefined ? undefined : JSON.parse(v);
    },

    listenVariable(request: VariableRequest): any {
        // Implementation for streaming
    },

    async saveVariable(request: any): Promise<Empty> {
        await socketManager.saveVariable(request.room, request.name, JSON.stringify(request.value));
        return {};
    },

    /**
     * FIXED: handleClearAfterUpload is now a Promise call. 
     * Removed the callback and used async/await logic.
     */
    async handleMapStorageUploadMapDetected(request: any): Promise<Empty> {
        try {
            await getMapStorageClient().handleClearAfterUpload({ wamUrl: request.wamUrl } as any);
            
            socketManager.getWorlds().forEach(async (p: any) => {
                const r = await p;
                if (r.wamUrl === request.wamUrl) {
                    r.sendRefreshRoomMessageToUsers();
                }
            });
        } catch (e) {
            console.error("Error in handleClearAfterUpload:", e);
        }
        return {};
    },

    async dispatchEvent(request: any): Promise<Empty> {
        await socketManager.dispatchEvent(request.room, request.name, request.data, request.targetUserIds);
        return {};
    },

    listenEvent(request: EventRequest): any {
        // Implementation for streaming
    },

    async dispatchGlobalEvent(request: any): Promise<Empty> {
        socketManager.dispatchGlobalEvent(request.name, request.value);
        return {};
    },

    async dispatchExternalModuleMessage(request: any): Promise<Empty> {
        await socketManager.handleExternalModuleMessage(request);
        return {};
    },
};

export { roomManager };