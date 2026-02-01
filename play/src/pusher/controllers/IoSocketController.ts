import { z } from "zod";
import type { AnswerMessage, CompanionDetail, ErrorApiData, SubMessage, WokaDetail } from "@workadventure/messages";
import {
    apiVersionHash,
    ClientToServerMessage,
    noUndefined,
    ServerToClientMessage as ServerToClientMessageTsProto,
    ServerToClientMessage,
} from "@workadventure/messages";
import { JsonWebTokenError } from "jsonwebtoken";
import * as Sentry from "@sentry/node";
import type { TemplatedApp, WebSocket } from "uWebSockets.js";
import * as catchUnknown from "catch-unknown";
const asError = catchUnknown.asError;
import Debug from "debug";
import { AxiosError } from "axios";
import { AbortError } from "@workadventure/shared-utils/src/Abort/AbortError";
import type { FetchMemberDataByUuidResponse } from "../services/AdminApi";
import type { AdminSocketTokenData } from "../services/JWTTokenManager";
import { jwtTokenManager, tokenInvalidException } from "../services/JWTTokenManager";
import type { Socket, SocketUpgradeFailed } from "../services/SocketManager";
import { socketManager } from "../services/SocketManager";
import { ADMIN_SOCKETS_TOKEN, DISABLE_ANONYMOUS, SOCKET_IDLE_TIMER } from "../enums/EnvironmentVariable";
import type { AdminSocketData } from "../models/Websocket/AdminSocketData";
import type { AdminMessageInterface } from "../models/Websocket/Admin/AdminMessages";
import { isAdminMessageInterface } from "../models/Websocket/Admin/AdminMessages";
import { adminService } from "../services/AdminService";
import { validateWebsocketQuery } from "../services/QueryValidator";
import type { SocketData, SpaceName } from "../models/Websocket/SocketData";
import { emitInBatch } from "../services/IoSocketHelpers";
import { ClientAbortError } from "../models/ClientAbortError";

const debug = Debug("pusher:requests");

type UpgradeFailedInvalidData = {
    rejected: true;
    reason: "tokenInvalid" | "invalidVersion" | null;
    message: string;
    roomId: string;
};

type UpgradeFailedErrorData = {
    rejected: true;
    reason: "error";
    error: ErrorApiData;
};

type UpgradeFailedInvalidTexture = {
    rejected: true;
    reason: "invalidTexture";
    entityType: "character" | "companion";
};

export type UpgradeFailedData = UpgradeFailedErrorData | UpgradeFailedInvalidData | UpgradeFailedInvalidTexture;

export class IoSocketController {
    constructor(private readonly app: TemplatedApp) {
        // Global handler for unhandled Promises
        // The listener never needs to be removed, because we are in a singleton that is never destroyed.
        // eslint-disable-next-line listeners/no-missing-remove-event-listener,listeners/no-inline-function-event-listener
        process.on("unhandledRejection", (reason, promise) => {
            console.error("Unhandled Rejection at:", promise, "reason:", reason);
            Sentry.captureException(reason);
        });

        this.ioConnection();
        if (ADMIN_SOCKETS_TOKEN) {
            this.adminRoomSocket();
        }
    }

    adminRoomSocket(): void {
        this.app.ws<AdminSocketData>("/ws/admin/rooms", {
            upgrade: (res, req, context) => {
                const websocketKey = req.getHeader("sec-websocket-key");
                const websocketProtocol = req.getHeader("sec-websocket-protocol");
                const websocketExtensions = req.getHeader("sec-websocket-extensions");

                res.upgrade<AdminSocketData>(
                    {
                        adminConnections: new Map(),
                        disconnecting: false,
                    },
                    websocketKey,
                    websocketProtocol,
                    websocketExtensions,
                    context
                );
            },
            open: (ws) => {
                console.info(
                    "Admin socket connect to client on " + Buffer.from(ws.getRemoteAddressAsText()).toString()
                );
                ws.getUserData().disconnecting = false;
            },
            message: (ws, arrayBuffer): void => {
                try {
                    const message: AdminMessageInterface = JSON.parse(
                        new TextDecoder("utf-8").decode(new Uint8Array(arrayBuffer))
                    );

                    try {
                        isAdminMessageInterface.parse(message);
                    } catch (err) {
                        if (err instanceof z.ZodError) {
                            console.error(err.issues);
                            Sentry.captureException(err.issues);
                        }
                        Sentry.captureException(`Invalid message received. ${JSON.stringify(message)}`);
                        console.error("Invalid message received.", message);
                        ws.send(
                            JSON.stringify({
                                type: "Error",
                                data: {
                                    message: "Invalid message received! The connection has been closed.",
                                },
                            })
                        );
                        ws.end(1007, "Invalid message received!");
                        return;
                    }

                    const token = message.jwt;

                    let data: AdminSocketTokenData;

                    try {
                        data = jwtTokenManager.verifyAdminSocketToken(token);
                    } catch (e) {
                        console.error("Admin socket access refused for token: " + token, e);
                        ws.send(
                            JSON.stringify({
                                type: "Error",
                                data: {
                                    message: "Admin socket access refused! The connection has been closed.",
                                },
                            })
                        );
                        ws.end(1008, "Access refused");
                        return;
                    }

                    const authorizedRoomIds = data.authorizedRoomIds;

                    if (message.event === "listen") {
                        const notAuthorizedRoom = message.roomIds.filter(
                            (roomId) => !authorizedRoomIds.includes(roomId)
                        );

                        if (notAuthorizedRoom.length > 0) {
                            const errorMessage = `Admin socket refused for client on ${Buffer.from(
                                ws.getRemoteAddressAsText()
                            ).toString()} listening of : \n${JSON.stringify(notAuthorizedRoom)}`;
                            Sentry.captureException(errorMessage);
                            console.error(errorMessage);
                            ws.send(
                                JSON.stringify({
                                    type: "Error",
                                    data: {
                                        message: errorMessage,
                                    },
                                })
                            );
                            ws.end(1008, "Access refused");
                            return;
                        }

                        for (const roomId of message.roomIds) {
                            socketManager.handleAdminRoom(ws, roomId).catch((e) => {
                                console.error(e);
                                Sentry.captureException(e);
                            });
                        }
                    } else if (message.event === "user-message") {
                        const messageToEmit = message.message;
                        // Get roomIds of the world where we want broadcast the message
                        const roomIds = authorizedRoomIds.filter(
                            (authorizeRoomId) => authorizeRoomId.split("/")[5] === message.world
                        );

                        for (const roomId of roomIds) {
                            if (messageToEmit.type === "banned") {
                                socketManager
                                    .emitBan(messageToEmit.userUuid, messageToEmit.message, messageToEmit.type, roomId)
                                    .catch((error) => {
                                        Sentry.captureException(error);
                                        console.error(error);
                                    });
                            } else if (messageToEmit.type === "ban") {
                                socketManager
                                    .emitSendUserMessage(
                                        messageToEmit.userUuid,
                                        messageToEmit.message,
                                        messageToEmit.type,
                                        roomId
                                    )
                                    .catch((error) => {
                                        Sentry.captureException(error);
                                        console.error(error);
                                    });
                            }
                        }
                    }
                } catch (err) {
                    Sentry.captureException(err);
                    console.error(err);
                }
            },
            close: (ws) => {
                try {
                    ws.getUserData().disconnecting = true;
                    socketManager.leaveAdminRoom(ws);
                } catch (e) {
                    Sentry.captureException(`An error occurred on admin "disconnect" ${e}`);
                    console.error(`An error occurred on admin "disconnect" ${e}`);
                }
            },
        });
    }

    ioConnection(): void {
        this.app.ws<SocketData | UpgradeFailedData>("/ws/room", {
            /* Options */
            //compression: uWS.SHARED_COMPRESSOR,
            idleTimeout: SOCKET_IDLE_TIMER,
            maxPayloadLength: 16 * 1024 * 1024,
            maxBackpressure: 65536, // Maximum 64kB of data in the buffer.
            upgrade: (res, req, context) => {
                (async () => {
                    /* Keep track of abortions */
                    const upgradeAborted = { aborted: false };

                    res.onAborted(() => {
                        /* We can simply signal that we were aborted */
                        upgradeAborted.aborted = true;
                    });

                    const query = validateWebsocketQuery(
                        req,
                        res,
                        context,
                        z.object({
                            roomId: z.string(),
                            name: z.string(),
                            characterTextureIds: z.union([z.string(), z.string().array()]).optional(),
                            x: z.coerce.number(),
                            y: z.coerce.number(),
                            top: z.coerce.number(),
                            bottom: z.coerce.number(),
                            left: z.coerce.number(),
                            right: z.coerce.number(),
                            companionTextureId: z.string().optional(),
                            availabilityStatus: z.coerce.number(),
                            lastCommandId: z.string().optional(),
                            version: z.string(),
                            chatID: z.string(),
                            roomName: z.string(),
                            cameraState: z.string().transform((val) => val === "true"),
                            microphoneState: z.string().transform((val) => val === "true"),
                        })
                    );

                    if (query === undefined) {
                        return;
                    }

                    debug(
                        `FrontController => [${req.getMethod()}] ${req.getUrl()} — IP: ${req.getHeader(
                            "x-forwarded-for"
                        )} — Time: ${Date.now()}`
                    );

                    const websocketKey = req.getHeader("sec-websocket-key");
                    const websocketProtocol = req.getHeader("sec-websocket-protocol");
                    // We abuse the protocol header to pass the JWT token (to avoid sending it in the query string)
                    const token = websocketProtocol;
                    const websocketExtensions = req.getHeader("sec-websocket-extensions");
                    const ipAddress = req.getHeader("x-forwarded-for");
                    const locale = req.getHeader("accept-language");

                    const {
                        roomId,
                        x,
                        y,
                        top,
                        bottom,
                        left,
                        right,
                        name,
                        availabilityStatus,
                        lastCommandId,
                        version,
                        companionTextureId,
                        roomName,
                        cameraState,
                        microphoneState,
                    } = query;

                    const chatID = query.chatID ? query.chatID : undefined;

                    try {
                        if (version !== apiVersionHash) {
                            if (upgradeAborted.aborted) {
                                // If the response points to nowhere, don't attempt an upgrade
                                return;
                            }
                            return res.upgrade(
                                {
                                    rejected: true,
                                    reason: "error",
                                    error: {
                                        status: "error",
                                        type: "retry",
                                        title: "Please refresh",
                                        subtitle: "New version available",
                                        image: "/resources/icons/new_version.png",
                                        imageLogo: "/static/images/logo.png",
                                        code: "NEW_VERSION",
                                        details:
                                            "A new version of WorkAdventure is available. Please refresh your window",
                                        canRetryManual: true,
                                        buttonTitle: "Refresh",
                                        timeToRetry: 999999,
                                    },
                                } as any,
                                websocketKey,
                                websocketProtocol,
                                websocketExtensions,
                                context
                            );
                        }

                        const characterTextureIds: string[] =
                            query.characterTextureIds === undefined
                                ? []
                                : typeof query.characterTextureIds === "string"
                                ? [query.characterTextureIds]
                                : query.characterTextureIds;

                        const tokenData = token ? jwtTokenManager.verifyJWTToken(token) : null;

                        if (DISABLE_ANONYMOUS && !tokenData) {
                            throw new Error("Expecting token");
                        }

                        const userIdentifier = tokenData ? tokenData.identifier : "";
                        const isLogged = !!tokenData?.accessToken;

                        let memberTags: string[] = [];
                        let memberVisitCardUrl: string | null = null;
                        let memberUserRoomToken: string | undefined;
                        let userData: FetchMemberDataByUuidResponse = {
                            status: "ok",
                            email: userIdentifier,
                            userUuid: userIdentifier,
                            tags: tokenData?.tags ?? [],
                            visitCardUrl: null,
                            isCharacterTexturesValid: true,
                            characterTextures: [],
                            isCompanionTextureValid: true,
                            companionTexture: undefined,
                            messages: [],
                            userRoomToken: undefined,
                            activatedInviteUser: true,
                            canEdit: false,
                            world: "",
                            chatID,
                        };

                        let characterTextures: WokaDetail[];
                        let companionTexture: CompanionDetail | undefined;

                        try {
                            try {
                                userData = await adminService.fetchMemberDataByUuid(
                                    userIdentifier,
                                    tokenData?.accessToken,
                                    roomId,
                                    ipAddress,
                                    characterTextureIds,
                                    companionTextureId,
                                    locale,
                                    userData.tags,
                                    chatID
                                );

                                if (userData.status === "ok" && !userData.isCharacterTexturesValid) {
                                    return res.upgrade(
                                        {
                                            rejected: true,
                                            reason: "invalidTexture",
                                            entityType: "character",
                                        } as any,
                                        websocketKey,
                                        websocketProtocol,
                                        websocketExtensions,
                                        context
                                    );
                                }
                                if (userData.status === "ok" && !userData.isCompanionTextureValid) {
                                    return res.upgrade(
                                        {
                                            rejected: true,
                                            reason: "invalidTexture",
                                            entityType: "companion",
                                        } as any,
                                        websocketKey,
                                        websocketProtocol,
                                        websocketExtensions,
                                        context
                                    );
                                }

                                if (userData.status !== "ok") {
                                    if (upgradeAborted.aborted) {
                                        // If the response points to nowhere, don't attempt an upgrade
                                        return;
                                    }

                                    return res.upgrade(
                                        {
                                            rejected: true,
                                            reason: "error",
                                            error: userData,
                                        } as any,
                                        websocketKey,
                                        websocketProtocol,
                                        websocketExtensions,
                                        context
                                    );
                                }
                            } catch (err) {
                                if (upgradeAborted.aborted) {
                                    // If the response points to nowhere, don't attempt an upgrade
                                    return;
                                }
                                throw err;
                            }
                            memberTags = userData.tags;
                            memberVisitCardUrl = userData.visitCardUrl;
                            characterTextures = userData.characterTextures;
                            companionTexture = userData.companionTexture ?? undefined;
                            memberUserRoomToken = userData.userRoomToken;
                        } catch (e) {
                            console.info(
                                "access not granted for user " + (userIdentifier || "anonymous") + " and room " + roomId
                            );
                            Sentry.captureException(e);
                            console.error(e);
                            throw new Error("User cannot access this world", { cause: e });
                        }

                        if (upgradeAborted.aborted) {
                            console.info("Ouch! Client disconnected before we could upgrade it!");
                            /* You must not upgrade now */
                            return;
                        }

                        const socketData: SocketData = {
                            rejected: false,
                            disconnecting: false,
                            token: token && typeof token === "string" ? token : "",
                            roomId,
                            userId: undefined,
                            userUuid: userData.userUuid,
                            isLogged,
                            ipAddress,
                            name,
                            characterTextures,
                            companionTexture,
                            position: {
                                x: x,
                                y: y,
                                direction: "down",
                                moving: false,
                            },
                            viewport: {
                                top,
                                right,
                                bottom,
                                left,
                            },
                            availabilityStatus,
                            lastCommandId,
                            messages: [],
                            tags: memberTags,
                            visitCardUrl: memberVisitCardUrl,
                            userRoomToken: memberUserRoomToken,
                            activatedInviteUser: userData.activatedInviteUser ?? undefined,
                            applications: userData.applications,
                            canEdit: userData.canEdit ?? false,
                            spaceUserId: "",
                            emitInBatch: (payload: SubMessage): void => {},
                            batchedMessages: {
                                event: "",
                                payload: [],
                            },
                            batchTimeout: null,
                            backConnection: undefined,
                            listenedZones: new Set<string>(),
                            pusherRoom: undefined,
                            spaces: new Set<SpaceName>(),
                            joinSpacesPromise: new Map<SpaceName, Promise<void>>(),
                            chatID,
                            world: userData.world,
                            currentChatRoomArea: [],
                            roomName,
                            microphoneState,
                            cameraState,
                            queryAbortControllers: new Map<number, AbortController>(),
                            keepAliveInterval: undefined,
                        };

                        /* This immediately calls open handler, you must not use res after this call */
                        res.upgrade<SocketData>(
                            socketData,
                            /* Spell these correctly */
                            websocketKey,
                            websocketProtocol,
                            websocketExtensions,
                            context
                        );
                    } catch (e) {
                        if (e instanceof Error) {
                            if (!(e instanceof JsonWebTokenError)) {
                                Sentry.captureException(e);
                                console.error(e);
                            }
                            if (upgradeAborted.aborted) {
                                // If the response points to nowhere, don't attempt an upgrade
                                return;
                            }
                            res.upgrade(
                                {
                                    rejected: true,
                                    reason: e instanceof JsonWebTokenError ? tokenInvalidException : null,
                                    message: e.message,
                                    roomId,
                                } as any,
                                websocketKey,
                                websocketProtocol,
                                websocketExtensions,
                                context
                            );
                        } else {
                            if (upgradeAborted.aborted) {
                                // If the response points to nowhere, don't attempt an upgrade
                                return;
                            }
                            res.upgrade(
                                {
                                    rejected: true,
                                    reason: null,
                                    message: "500 Internal Server Error",
                                    roomId,
                                } as any,
                                websocketKey,
                                websocketProtocol,
                                websocketExtensions,
                                context
                            );
                        }
                    }
                })().catch((e) => {
                    Sentry.captureException(e);
                    console.error(e);
                });
            },
            /* Handlers */
            open: (ws) => {
                (async () => {
                    const socketData = ws.getUserData();
                    debug("WebSocket connection established");
                    if (socketData.rejected === true) {
                        const socket = ws as SocketUpgradeFailed;
                        // If there is a room in the error, let's check if we need to clean it.
                        if ("roomId" in socketData) {
                            socketManager.deleteRoomIfEmptyFromId(socketData.roomId);
                        }

                        if (socketData.reason === tokenInvalidException) {
                            socketManager.emitTokenExpiredMessage(socket);
                        } else if (socketData.reason === "error") {
                            socketManager.emitErrorScreenMessage(socket, socketData.error);
                        } else if (socketData.reason === "invalidTexture") {
                            if (socketData.entityType === "character") {
                                socketManager.emitInvalidCharacterTextureMessage(socket);
                            } else {
                                socketManager.emitInvalidCompanionTextureMessage(socket);
                            }
                        } else {
                            socketManager.emitConnectionErrorMessage(socket, socketData.message.toString());
                        }
                        ws.end(1000, "Error message sent");
                        return;
                    }

                    // Mandatory for typing hint
                    const socket = ws as Socket;

                    socketData.emitInBatch = (payload: SubMessage): void => {
                        emitInBatch(socket, payload);
                    };

                    await socketManager.handleJoinRoom(socket);

                    //get data information and show messages
                    if (socketData.messages && Array.isArray(socketData.messages)) {
                        socketData.messages.forEach((c: any) => {
                            const bytes = ServerToClientMessageTsProto.encode({
                                $case: "sendUserMessage",
                                sendUserMessage: {
                                    type: c.type,
                                    message: c.message,
                                },
                            } as any).finish();
                            if (!socketData.disconnecting) {
                                socket.send(bytes, true);
                            }
                        });
                    }

                    // additional ping/pong mechanism
                    socketData.keepAliveInterval = setInterval(() => {
                        if (!socketData.disconnecting) {
                            socket.ping();
                        }
                    }, 25000); // Every 25 seconds
                })().catch((e) => {
                    Sentry.captureException(e);
                    console.error(e);
                });
            },
            message: (ws, arrayBuffer): void => {
                const socket = ws as Socket;
                Sentry.withIsolationScope(() => {
                    Sentry.setTag("userUuid", socket.getUserData().userUuid);
                    Sentry.setTag("roomId", socket.getUserData().roomId);
                    Sentry.setTag("world", socket.getUserData().world);
                    (async () => {
                        const message = ClientToServerMessage.decode(new Uint8Array(arrayBuffer));
                        
                        /**
                         * FIXED: Flattened ClientToServerMessage access.
                         */
                        const msg = message as any;
                        if (!msg || !msg.$case) {
                            console.warn("Empty message received.");
                            return;
                        }

                        switch (msg.$case) {
                            case "viewportMessage": {
                                socketManager.handleViewport(socket, msg.viewportMessage!);
                                break;
                            }
                            case "userMovesMessage": {
                                socketManager.handleUserMovesMessage(socket, msg.userMovesMessage!);
                                break;
                            }
                            case "playGlobalMessage": {
                                await socketManager.emitPlayGlobalMessage(socket, msg.playGlobalMessage!);
                                break;
                            }
                            case "reportPlayerMessage": {
                                await socketManager.handleReportMessage(socket, msg.reportPlayerMessage!);
                                break;
                            }
                            case "addSpaceFilterMessage": {
                                if (msg.addSpaceFilterMessage!.spaceFilterMessage !== undefined)
                                    msg.addSpaceFilterMessage!.spaceFilterMessage.spaceName = `${
                                        socket.getUserData().world
                                    }.${msg.addSpaceFilterMessage!.spaceFilterMessage.spaceName}`;
                                await socketManager.handleAddSpaceFilterMessage(
                                    socket,
                                    noUndefined(msg.addSpaceFilterMessage!)
                                );
                                break;
                            }
                            case "removeSpaceFilterMessage": {
                                if (msg.removeSpaceFilterMessage!.spaceFilterMessage !== undefined)
                                    msg.removeSpaceFilterMessage!.spaceFilterMessage.spaceName = `${
                                        socket.getUserData().world
                                    }.${msg.removeSpaceFilterMessage!.spaceFilterMessage.spaceName}`;
                                socketManager.handleRemoveSpaceFilterMessage(
                                    socket,
                                    noUndefined(msg.removeSpaceFilterMessage!)
                                );
                                break;
                            }
                            case "setPlayerDetailsMessage": {
                                await socketManager.handleSetPlayerDetails(
                                    socket,
                                    msg.setPlayerDetailsMessage!
                                );
                                break;
                            }
                            case "updateSpaceMetadataMessage": {
                                const isMetadata = z
                                    .record(z.string(), z.unknown())
                                    .safeParse(JSON.parse(msg.updateSpaceMetadataMessage!.metadata));
                                if (!isMetadata.success) {
                                    Sentry.captureException(
                                        `Invalid metadata received. ${msg.updateSpaceMetadataMessage!.metadata}`
                                    );
                                    return;
                                }

                                msg.updateSpaceMetadataMessage!.spaceName = `${socket.getUserData().world}.${
                                    msg.updateSpaceMetadataMessage!.spaceName
                                }`;

                                socketManager.handleUpdateSpaceMetadata(
                                    socket,
                                    msg.updateSpaceMetadataMessage!.spaceName,
                                    isMetadata.data
                                );
                                break;
                            }
                            case "updateSpaceUserMessage": {
                                msg.updateSpaceUserMessage!.spaceName = `${socket.getUserData().world}.${
                                    msg.updateSpaceUserMessage!.spaceName
                                }`;

                                await socketManager.handleUpdateSpaceUser(
                                    socket,
                                    msg.updateSpaceUserMessage!
                                );
                                break;
                            }
                            case "updateChatIdMessage": {
                                await socketManager.handleUpdateChatId(
                                    socket,
                                    msg.updateChatIdMessage!.email,
                                    msg.updateChatIdMessage!.chatId
                                );
                                break;
                            }
                            case "leaveChatRoomAreaMessage": {
                                await socketManager.handleLeaveChatRoomArea(
                                    socket,
                                    msg.leaveChatRoomAreaMessage!.roomID
                                );
                                break;
                            }
                            case "queryMessage": {
                                try {
                                    const queryMsg = msg.queryMessage!;
                                    const answerMessage: any = {
                                        id: queryMsg.id,
                                    };
                                    const abortController = new AbortController();
                                    socket
                                        .getUserData()
                                        .queryAbortControllers.set(queryMsg.id, abortController);
                                    
                                    /**
                                     * FIXED: Property 'query' does not exist on type 'QueryMessage' fix.
                                     * Flattened the logic to access query data directly from queryMsg.
                                     */
                                    const qData = queryMsg as any;
                                    switch (qData.$case) {
                                        case "roomTagsQuery": {
                                            await socketManager.handleRoomTagsQuery(socket, queryMsg);
                                            break;
                                        }
                                        case "embeddableWebsiteQuery": {
                                            await socketManager.handleEmbeddableWebsiteQuery(socket, queryMsg);
                                            break;
                                        }
                                        case "roomsFromSameWorldQuery": {
                                            await socketManager.handleRoomsFromSameWorldQuery(socket, queryMsg);
                                            break;
                                        }
                                        case "searchMemberQuery": {
                                            const searchMemberAnswer = await socketManager.handleSearchMemberQuery(
                                                socket,
                                                qData.searchMemberQuery!
                                            );
                                            answerMessage.$case = "searchMemberAnswer";
                                            answerMessage.searchMemberAnswer = searchMemberAnswer;
                                            this.sendAnswerMessage(socket, answerMessage);
                                            break;
                                        }
                                        case "chatMembersQuery": {
                                            const chatMembersAnswer = await socketManager.handleChatMembersQuery(
                                                socket,
                                                qData.chatMembersQuery!
                                            );
                                            answerMessage.$case = "chatMembersAnswer";
                                            answerMessage.chatMembersAnswer = chatMembersAnswer;
                                            this.sendAnswerMessage(socket, answerMessage);
                                            break;
                                        }
                                        case "searchTagsQuery": {
                                            const searchTagsAnswer = await socketManager.handleSearchTagsQuery(
                                                socket,
                                                qData.searchTagsQuery!
                                            );
                                            answerMessage.$case = "searchTagsAnswer";
                                            answerMessage.searchTagsAnswer = searchTagsAnswer;
                                            this.sendAnswerMessage(socket, answerMessage);
                                            break;
                                        }
                                        case "iceServersQuery": {
                                            const iceServersAnswer = await socketManager.handleIceServersQuery(socket);
                                            answerMessage.$case = "iceServersAnswer";
                                            answerMessage.iceServersAnswer = iceServersAnswer;
                                            this.sendAnswerMessage(socket, answerMessage);
                                            break;
                                        }
                                        case "getMemberQuery": {
                                            const getMemberAnswer = await socketManager.handleGetMemberQuery(
                                                qData.getMemberQuery!
                                            );
                                            if (!getMemberAnswer) {
                                                answerMessage.$case = "error";
                                                answerMessage.error = { message: "User not found" };
                                            } else {
                                                answerMessage.$case = "getMemberAnswer";
                                                answerMessage.getMemberAnswer = getMemberAnswer;
                                            }
                                            this.sendAnswerMessage(socket, answerMessage);
                                            break;
                                        }
                                        case "enterChatRoomAreaQuery": {
                                            try {
                                                await socketManager.handleEnterChatRoomAreaQuery(
                                                    socket,
                                                    qData.enterChatRoomAreaQuery!.roomID
                                                );
                                                answerMessage.$case = "enterChatRoomAreaAnswer";
                                                answerMessage.enterChatRoomAreaAnswer = {};
                                            } catch (e) {
                                                answerMessage.$case = "error";
                                                answerMessage.error = { message: "Error entering chat area" };
                                            }
                                            this.sendAnswerMessage(socket, answerMessage);
                                            break;
                                        }
                                        case "oauthRefreshTokenQuery": {
                                            try {
                                                answerMessage.$case = "oauthRefreshTokenAnswer";
                                                answerMessage.oauthRefreshTokenAnswer = await socketManager.handleOauthRefreshTokenQuery(
                                                    qData.oauthRefreshTokenQuery!
                                                );
                                                this.sendAnswerMessage(socket, answerMessage);
                                            } catch (error) {
                                                const errObj: any = { id: queryMsg.id, $case: "error", error: { message: "Refresh failed" } };
                                                this.sendAnswerMessage(socket, errObj);
                                            }
                                            break;
                                        }
                                        case "joinSpaceQuery": {
                                            const localSpaceName = qData.joinSpaceQuery!.spaceName;
                                            qData.joinSpaceQuery!.spaceName = `${socket.getUserData().world}.${localSpaceName}`;
                                            await socketManager.handleJoinSpace(
                                                socket, qData.joinSpaceQuery!.spaceName, localSpaceName,
                                                qData.joinSpaceQuery!.filterType, qData.joinSpaceQuery!.propertiesToSync,
                                                { signal: abortController.signal }
                                            );
                                            answerMessage.$case = "joinSpaceAnswer";
                                            answerMessage.joinSpaceAnswer = { spaceUserId: socket.getUserData().spaceUserId };
                                            this.sendAnswerMessage(socket, answerMessage);
                                            break;
                                        }
                                        case "leaveSpaceQuery": {
                                            qData.leaveSpaceQuery!.spaceName = `${socket.getUserData().world}.${qData.leaveSpaceQuery!.spaceName}`;
                                            await socketManager.handleLeaveSpace(socket, qData.leaveSpaceQuery!.spaceName);
                                            answerMessage.$case = "leaveSpaceAnswer";
                                            answerMessage.leaveSpaceAnswer = {};
                                            this.sendAnswerMessage(socket, answerMessage);
                                            break;
                                        }
                                        case "mapStorageJwtQuery": {
                                            answerMessage.$case = "mapStorageJwtAnswer";
                                            answerMessage.mapStorageJwtAnswer = { jwt: await socketManager.handleMapStorageJwtQuery(socket) };
                                            this.sendAnswerMessage(socket, answerMessage);
                                            break;
                                        }
                                        default: {
                                            socket.getUserData().queryAbortControllers.delete(queryMsg.id);
                                            socketManager.forwardMessageToBack(socket, msg);
                                        }
                                    }
                                } catch (error) {
                                    const err = asError(error);
                                    if (!(err instanceof AbortError)) Sentry.captureException(err);
                                    this.sendAnswerMessage(socket, { id: (msg as any).queryMessage.id, $case: "error", error: { message: err.message } } as any);
                                }
                                break;
                            }
                            case "abortQueryMessage": {
                                const abortController = socket.getUserData().queryAbortControllers.get(msg.abortQueryMessage!.id);
                                if (abortController) {
                                    abortController.abort(new ClientAbortError());
                                } else {
                                    socketManager.forwardMessageToBack(socket, msg);
                                }
                                break;
                            }
                            case "itemEventMessage":
                            case "variableMessage":
                            case "emotePromptMessage":
                            case "followRequestMessage":
                            case "followConfirmationMessage":
                            case "followAbortMessage":
                            case "lockGroupPromptMessage":
                            case "pingMessage":
                            case "askPositionMessage":
                            case "editMapCommandMessage": {
                                socketManager.forwardMessageToBack(socket, msg);
                                break;
                            }
                            case "banPlayerMessage": {
                                await socketManager.handleBanPlayerMessage(socket, msg.banPlayerMessage!);
                                break;
                            }
                            case "publicEvent": {
                                msg.publicEvent!.spaceName = `${socket.getUserData().world}.${msg.publicEvent!.spaceName}`;
                                await socketManager.handlePublicEvent(socket, msg.publicEvent!);
                                break;
                            }
                            case "privateEvent": {
                                msg.privateEvent!.spaceName = `${socket.getUserData().world}.${msg.privateEvent!.spaceName}`;
                                await socketManager.handlePrivateEvent(socket, msg.privateEvent!);
                                break;
                            }
                            default: {
                                const _exhaustiveCheck: any = msg;
                            }
                        }
                    })().catch((e) => {
                        if (e instanceof ClientAbortError) return;
                        Sentry.captureException(e);
                        try {
                            if (!socket.getUserData().disconnecting) {
                                socket.send(ServerToClientMessage.encode({ $case: "errorMessage", errorMessage: { message: asError(e).message } } as any).finish(), true);
                            }
                        } catch (error) { Sentry.captureException(error); }
                    });
                });
            },
            drain: (ws) => {
                console.info("WebSocket backpressure: " + ws.getBufferedAmount());
            },
            close: (ws) => {
                const socketData = ws.getUserData();
                if (socketData.rejected === true) return;
                socketManager.cleanupSocket(ws as Socket);
            },
        });
    }

    private sendAnswerMessage(socket: WebSocket<SocketData>, answerMessage: any) {
        if (socket.getUserData().disconnecting) return;
        setTimeout(() => {
            socket.getUserData().queryAbortControllers.delete(answerMessage.id);
        }, 5000);
        
        /**
         * FIXED: Flattened AnswerMessage structure.
         * Properties like 'jitsiJwtAnswer' or 'error' are now direct siblings of '$case'.
         */
        socket.send(
            ServerToClientMessage.encode({
                $case: "answerMessage",
                answerMessage: answerMessage,
            } as any).finish(),
            true
        );
    }
}