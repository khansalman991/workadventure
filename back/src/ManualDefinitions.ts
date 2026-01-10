import * as grpc from "@grpc/grpc-js";
import {
    PusherToBackMessage, ServerToClientMessage, PusherToBackRoomMessage, BatchToPusherRoomMessage,
    AdminPusherToBackMessage, ServerToAdminClientMessage, AdminMessage, AdminGlobalMessage, BanMessage,
    AdminRoomMessage, WorldFullWarningToRoomMessage, RefreshRoomPromptMessage, RoomsList, PingMessage,
    VariableRequest, SaveVariableRequest, DispatchEventRequest, EventRequest, EventResponse,
    MapStorageClearAfterUploadMessage, DispatchGlobalEventRequest, ExternalModuleMessage,
    PusherToBackSpaceMessage, BackToPusherSpaceMessage
} from "@workadventure/messages";
import { Empty } from "@workadventure/messages/src/ts-proto-generated/google/protobuf/empty";
import { Value } from "@workadventure/messages/src/ts-proto-generated/google/protobuf/struct";

// Helper to create gRPC methods
const makeHandler = (reqType: any, resType: any, streamReq: boolean, streamRes: boolean) => ({
    path: "", // Path is set in the Service Definition
    requestStream: streamReq,
    responseStream: streamRes,
    requestSerialize: (value: any) => Buffer.from(reqType.encode(value).finish()),
    requestDeserialize: (value: Buffer) => reqType.decode(value),
    responseSerialize: (value: any) => Buffer.from(resType.encode(value).finish()),
    responseDeserialize: (value: Buffer) => resType.decode(value),
});

// 1. RoomManager Definition
export const RoomManagerDefinition = {
    joinRoom: { ...makeHandler(PusherToBackMessage, ServerToClientMessage, true, true), path: "/RoomManager/joinRoom" },
    listenRoom: { ...makeHandler(PusherToBackRoomMessage, BatchToPusherRoomMessage, true, true), path: "/RoomManager/listenRoom" },
    adminRoom: { ...makeHandler(AdminPusherToBackMessage, ServerToAdminClientMessage, true, true), path: "/RoomManager/adminRoom" },
    sendAdminMessage: { ...makeHandler(AdminMessage, Empty, false, false), path: "/RoomManager/sendAdminMessage" },
    sendGlobalAdminMessage: { ...makeHandler(AdminGlobalMessage, Empty, false, false), path: "/RoomManager/sendGlobalAdminMessage" },
    ban: { ...makeHandler(BanMessage, Empty, false, false), path: "/RoomManager/ban" },
    sendAdminMessageToRoom: { ...makeHandler(AdminRoomMessage, Empty, false, false), path: "/RoomManager/sendAdminMessageToRoom" },
    sendWorldFullWarningToRoom: { ...makeHandler(WorldFullWarningToRoomMessage, Empty, false, false), path: "/RoomManager/sendWorldFullWarningToRoom" },
    sendRefreshRoomPrompt: { ...makeHandler(RefreshRoomPromptMessage, Empty, false, false), path: "/RoomManager/sendRefreshRoomPrompt" },
    getRooms: { ...makeHandler(Empty, RoomsList, false, false), path: "/RoomManager/getRooms" },
    ping: { ...makeHandler(PingMessage, PingMessage, false, false), path: "/RoomManager/ping" },
    readVariable: { ...makeHandler(VariableRequest, Value, false, false), path: "/RoomManager/readVariable" },
    listenVariable: { ...makeHandler(VariableRequest, Value, false, true), path: "/RoomManager/listenVariable" },
    saveVariable: { ...makeHandler(SaveVariableRequest, Empty, false, false), path: "/RoomManager/saveVariable" },
    dispatchEvent: { ...makeHandler(DispatchEventRequest, Empty, false, false), path: "/RoomManager/dispatchEvent" },
    listenEvent: { ...makeHandler(EventRequest, EventResponse, false, true), path: "/RoomManager/listenEvent" },
    handleMapStorageUploadMapDetected: { ...makeHandler(MapStorageClearAfterUploadMessage, Empty, false, false), path: "/RoomManager/handleMapStorageUploadMapDetected" },
    dispatchGlobalEvent: { ...makeHandler(DispatchGlobalEventRequest, Empty, false, false), path: "/RoomManager/dispatchGlobalEvent" },
    dispatchExternalModuleMessage: { ...makeHandler(ExternalModuleMessage, Empty, false, false), path: "/RoomManager/dispatchExternalModuleMessage" },
} as const;

// 2. SpaceManager Definition
export const SpaceManagerDefinition = {
    watchSpace: { ...makeHandler(PusherToBackSpaceMessage, BackToPusherSpaceMessage, true, true), path: "/SpaceManager/watchSpace" },
} as const;