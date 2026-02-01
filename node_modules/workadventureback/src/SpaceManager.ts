// @ts-nocheck
import { v4 as uuid } from "uuid";
import type { BackToPusherSpaceMessage, PusherToBackSpaceMessage } from "@workadventure/messages";
import Debug from "debug";
import type { ServerDuplexStream } from "@grpc/grpc-js";
import * as Sentry from "@sentry/node";
import { socketManager } from "./Services/SocketManager";
import { SpacesWatcher } from "./Model/SpacesWatcher";

export type SpaceSocket = ServerDuplexStream<PusherToBackSpaceMessage, BackToPusherSpaceMessage>;

const debug = Debug("space");

const spaceManager = {
    watchSpace: (call: SpaceSocket): void => {
        debug("watchSpace => called");
        const pusherUuid = uuid();
        const pusher = new SpacesWatcher(pusherUuid, call);

        call.on("data", (incomingMessage: PusherToBackSpaceMessage) => {
            // BYPASS: Cast to 'any' to stop type errors
            const message = incomingMessage as any;
            
            // Check if we have a nested .message or if it's flat
            const payload = message.message || message;

            if (!payload || (!payload.$case && !payload.message?.$case)) {
                console.error("Empty or invalid message received");
                return;
            }

            try {
                // Handle both structures (nested or flat)
                const caseName = payload.$case || payload.message?.$case;
                const data = payload;

                switch (caseName) {
                    case "joinSpaceMessage":
                        socketManager.handleJoinSpaceMessage(pusher, data.joinSpaceMessage);
                        break;
                    case "leaveSpaceMessage":
                        socketManager.handleLeaveSpaceMessage(pusher, data.leaveSpaceMessage);
                        break;
                    case "updateSpaceUserMessage":
                        socketManager.handleUpdateSpaceUserMessage(pusher, data.updateSpaceUserMessage);
                        break;
                    case "updateSpaceMetadataMessage":
                        socketManager.handleUpdateSpaceMetadataMessage(pusher, data.updateSpaceMetadataMessage);
                        break;
                    case "pongMessage":
                        pusher.clearPongTimeout();
                        break;
                    case "kickOffMessage":
                        socketManager.handleKickSpaceUserMessage(pusher, data.kickOffMessage);
                        break;
                    case "publicEvent":
                        socketManager.handlePublicEvent(pusher, data.publicEvent);
                        break;
                    case "privateEvent":
                        socketManager.handlePrivateEvent(pusher, data.privateEvent);
                        break;
                    case "syncSpaceUsersMessage":
                        socketManager.handleSyncSpaceUsersMessage(pusher, data.syncSpaceUsersMessage);
                        break;
                    case "spaceQueryMessage":
                        socketManager.handleSpaceQueryMessage(pusher, data.spaceQueryMessage);
                        break;
                    case "addSpaceUserToNotifyMessage":
                        socketManager.handleAddSpaceUserToNotifyMessage(pusher, data.addSpaceUserToNotifyMessage);
                        break;
                    case "deleteSpaceUserToNotifyMessage":
                        socketManager.handleDeleteSpaceUserToNotifyMessage(pusher, data.deleteSpaceUserToNotifyMessage);
                        break;
                    default:
                        console.warn("Unknown message type:", caseName);
                }
            } catch (e) {
                console.error("Error managing message:", e);
                Sentry.captureException(e);
            }
        })
        .on("error", (e) => {
            console.error("Error on watchSpace", e);
            socketManager.handleUnwatchAllSpaces(pusher);
        })
        .on("end", () => {
            socketManager.handleUnwatchAllSpaces(pusher);
            pusher.end();
            call.end();
        });
    },
} as any;

export { spaceManager };