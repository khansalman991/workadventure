import { Observable } from "rxjs";
import { Empty } from "./google/protobuf/empty";
import { Value } from "./google/protobuf/struct";
import { AdminGlobalMessage, AdminMessage, AdminPusherToBackMessage, AdminRoomMessage, BackToPusherSpaceMessage, BanMessage, BatchToPusherRoomMessage, DispatchEventRequest, DispatchGlobalEventRequest, EditMapCommandMessage, EditMapCommandsArrayMessage, EditMapCommandWithKeyMessage, EventRequest, EventResponse, ExternalModuleMessage, MapStorageClearAfterUploadMessage, PingMessage, PusherToBackMessage, PusherToBackRoomMessage, PusherToBackSpaceMessage, RefreshRoomPromptMessage, RoomsList, SaveVariableRequest, ServerToAdminClientMessage, ServerToClientMessage, UpdateMapToNewestWithKeyMessage, VariableRequest, WorldFullWarningToRoomMessage } from "./messages";
export declare const protobufPackage = "";
/** Service handled by the "back". Pusher servers connect to this service. */
export interface RoomManager {
    joinRoom(request: Observable<PusherToBackMessage>): Observable<ServerToClientMessage>;
    listenRoom(request: Observable<PusherToBackRoomMessage>): Observable<BatchToPusherRoomMessage>;
    adminRoom(request: Observable<AdminPusherToBackMessage>): Observable<ServerToAdminClientMessage>;
    sendAdminMessage(request: AdminMessage): Promise<Empty>;
    sendGlobalAdminMessage(request: AdminGlobalMessage): Promise<Empty>;
    ban(request: BanMessage): Promise<Empty>;
    sendAdminMessageToRoom(request: AdminRoomMessage): Promise<Empty>;
    sendWorldFullWarningToRoom(request: WorldFullWarningToRoomMessage): Promise<Empty>;
    sendRefreshRoomPrompt(request: RefreshRoomPromptMessage): Promise<Empty>;
    getRooms(request: Empty): Promise<RoomsList>;
    ping(request: PingMessage): Promise<PingMessage>;
    readVariable(request: VariableRequest): Promise<Value>;
    listenVariable(request: VariableRequest): Observable<Value>;
    saveVariable(request: SaveVariableRequest): Promise<Empty>;
    dispatchEvent(request: DispatchEventRequest): Promise<Empty>;
    listenEvent(request: EventRequest): Observable<EventResponse>;
    handleMapStorageUploadMapDetected(request: MapStorageClearAfterUploadMessage): Promise<Empty>;
    dispatchGlobalEvent(request: DispatchGlobalEventRequest): Promise<Empty>;
    dispatchExternalModuleMessage(request: ExternalModuleMessage): Promise<Empty>;
}
export declare const RoomManagerServiceName = "RoomManager";
export declare class RoomManagerClientImpl implements RoomManager {
    private readonly rpc;
    private readonly service;
    constructor(rpc: Rpc, opts?: {
        service?: string;
    });
    joinRoom(request: Observable<PusherToBackMessage>): Observable<ServerToClientMessage>;
    listenRoom(request: Observable<PusherToBackRoomMessage>): Observable<BatchToPusherRoomMessage>;
    adminRoom(request: Observable<AdminPusherToBackMessage>): Observable<ServerToAdminClientMessage>;
    sendAdminMessage(request: AdminMessage): Promise<Empty>;
    sendGlobalAdminMessage(request: AdminGlobalMessage): Promise<Empty>;
    ban(request: BanMessage): Promise<Empty>;
    sendAdminMessageToRoom(request: AdminRoomMessage): Promise<Empty>;
    sendWorldFullWarningToRoom(request: WorldFullWarningToRoomMessage): Promise<Empty>;
    sendRefreshRoomPrompt(request: RefreshRoomPromptMessage): Promise<Empty>;
    getRooms(request: Empty): Promise<RoomsList>;
    ping(request: PingMessage): Promise<PingMessage>;
    readVariable(request: VariableRequest): Promise<Value>;
    listenVariable(request: VariableRequest): Observable<Value>;
    saveVariable(request: SaveVariableRequest): Promise<Empty>;
    dispatchEvent(request: DispatchEventRequest): Promise<Empty>;
    listenEvent(request: EventRequest): Observable<EventResponse>;
    handleMapStorageUploadMapDetected(request: MapStorageClearAfterUploadMessage): Promise<Empty>;
    dispatchGlobalEvent(request: DispatchGlobalEventRequest): Promise<Empty>;
    dispatchExternalModuleMessage(request: ExternalModuleMessage): Promise<Empty>;
}
export interface SpaceManager {
    watchSpace(request: Observable<PusherToBackSpaceMessage>): Observable<BackToPusherSpaceMessage>;
}
export declare const SpaceManagerServiceName = "SpaceManager";
export declare class SpaceManagerClientImpl implements SpaceManager {
    private readonly rpc;
    private readonly service;
    constructor(rpc: Rpc, opts?: {
        service?: string;
    });
    watchSpace(request: Observable<PusherToBackSpaceMessage>): Observable<BackToPusherSpaceMessage>;
}
export interface MapStorage {
    ping(request: PingMessage): Promise<PingMessage>;
    handleEditMapCommandWithKeyMessage(request: EditMapCommandWithKeyMessage): Promise<EditMapCommandMessage>;
    handleUpdateMapToNewestMessage(request: UpdateMapToNewestWithKeyMessage): Promise<EditMapCommandsArrayMessage>;
    handleClearAfterUpload(request: MapStorageClearAfterUploadMessage): Promise<Empty>;
}
export declare const MapStorageServiceName = "MapStorage";
export declare class MapStorageClientImpl implements MapStorage {
    private readonly rpc;
    private readonly service;
    constructor(rpc: Rpc, opts?: {
        service?: string;
    });
    ping(request: PingMessage): Promise<PingMessage>;
    handleEditMapCommandWithKeyMessage(request: EditMapCommandWithKeyMessage): Promise<EditMapCommandMessage>;
    handleUpdateMapToNewestMessage(request: UpdateMapToNewestWithKeyMessage): Promise<EditMapCommandsArrayMessage>;
    handleClearAfterUpload(request: MapStorageClearAfterUploadMessage): Promise<Empty>;
}
interface Rpc {
    request(service: string, method: string, data: Uint8Array): Promise<Uint8Array>;
    clientStreamingRequest(service: string, method: string, data: Observable<Uint8Array>): Promise<Uint8Array>;
    serverStreamingRequest(service: string, method: string, data: Uint8Array): Observable<Uint8Array>;
    bidirectionalStreamingRequest(service: string, method: string, data: Observable<Uint8Array>): Observable<Uint8Array>;
}
export {};
