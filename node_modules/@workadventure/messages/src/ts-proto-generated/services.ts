/* eslint-disable */
import { BinaryReader } from "@bufbuild/protobuf/wire";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

// Relative imports for local Protobuf dependencies
import { Empty } from "./google/protobuf/empty";
import { Value } from "./google/protobuf/struct";
import {
  AdminGlobalMessage,
  AdminMessage,
  AdminPusherToBackMessage,
  AdminRoomMessage,
  BackToPusherSpaceMessage,
  BanMessage,
  BatchToPusherRoomMessage,
  DispatchEventRequest,
  DispatchGlobalEventRequest,
  EditMapCommandMessage,
  EditMapCommandsArrayMessage,
  EditMapCommandWithKeyMessage,
  EventRequest,
  EventResponse,
  ExternalModuleMessage,
  MapStorageClearAfterUploadMessage,
  PingMessage,
  PusherToBackMessage,
  PusherToBackRoomMessage,
  PusherToBackSpaceMessage,
  RefreshRoomPromptMessage,
  RoomsList,
  SaveVariableRequest,
  ServerToAdminClientMessage,
  ServerToClientMessage,
  UpdateMapToNewestWithKeyMessage,
  VariableRequest,
  WorldFullWarningToRoomMessage,
} from "./messages";

export const protobufPackage = "";

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

export const RoomManagerServiceName = "RoomManager";
export class RoomManagerClientImpl implements RoomManager {
  private readonly rpc: Rpc;
  private readonly service: string;
  constructor(rpc: Rpc, opts?: { service?: string }) {
    this.service = opts?.service || RoomManagerServiceName;
    this.rpc = rpc;
  }

  joinRoom(request: Observable<PusherToBackMessage>): Observable<ServerToClientMessage> {
    const data = request.pipe(map((req) => PusherToBackMessage.encode(req).finish()));
    const result = this.rpc.bidirectionalStreamingRequest(this.service, "joinRoom", data);
    return result.pipe(map((data) => ServerToClientMessage.decode(new BinaryReader(data) as any)));
  }

  listenRoom(request: Observable<PusherToBackRoomMessage>): Observable<BatchToPusherRoomMessage> {
    const data = request.pipe(map((req) => PusherToBackRoomMessage.encode(req).finish()));
    const result = this.rpc.bidirectionalStreamingRequest(this.service, "listenRoom", data);
    return result.pipe(map((data) => BatchToPusherRoomMessage.decode(new BinaryReader(data) as any)));
  }

  adminRoom(request: Observable<AdminPusherToBackMessage>): Observable<ServerToAdminClientMessage> {
    const data = request.pipe(map((req) => AdminPusherToBackMessage.encode(req).finish()));
    const result = this.rpc.bidirectionalStreamingRequest(this.service, "adminRoom", data);
    return result.pipe(map((data) => ServerToAdminClientMessage.decode(new BinaryReader(data) as any)));
  }

  sendAdminMessage(request: AdminMessage): Promise<Empty> {
    const data = AdminMessage.encode(request).finish();
    return this.rpc.request(this.service, "sendAdminMessage", data).then((d) => Empty.decode(new BinaryReader(d) as any));
  }

  sendGlobalAdminMessage(request: AdminGlobalMessage): Promise<Empty> {
    const data = AdminGlobalMessage.encode(request).finish();
    return this.rpc.request(this.service, "sendGlobalAdminMessage", data).then((d) => Empty.decode(new BinaryReader(d) as any));
  }

  ban(request: BanMessage): Promise<Empty> {
    const data = BanMessage.encode(request).finish();
    return this.rpc.request(this.service, "ban", data).then((d) => Empty.decode(new BinaryReader(d) as any));
  }

  sendAdminMessageToRoom(request: AdminRoomMessage): Promise<Empty> {
    const data = AdminRoomMessage.encode(request).finish();
    return this.rpc.request(this.service, "sendAdminMessageToRoom", data).then((d) => Empty.decode(new BinaryReader(d) as any));
  }

  sendWorldFullWarningToRoom(request: WorldFullWarningToRoomMessage): Promise<Empty> {
    const data = WorldFullWarningToRoomMessage.encode(request).finish();
    return this.rpc.request(this.service, "sendWorldFullWarningToRoom", data).then((d) => Empty.decode(new BinaryReader(d) as any));
  }

  sendRefreshRoomPrompt(request: RefreshRoomPromptMessage): Promise<Empty> {
    const data = RefreshRoomPromptMessage.encode(request).finish();
    return this.rpc.request(this.service, "sendRefreshRoomPrompt", data).then((d) => Empty.decode(new BinaryReader(d) as any));
  }

  getRooms(request: Empty): Promise<RoomsList> {
    const data = Empty.encode(request).finish();
    return this.rpc.request(this.service, "getRooms", data).then((d) => RoomsList.decode(new BinaryReader(d) as any));
  }

  ping(request: PingMessage): Promise<PingMessage> {
    const data = PingMessage.encode(request).finish();
    return this.rpc.request(this.service, "ping", data).then((d) => PingMessage.decode(new BinaryReader(d) as any));
  }

  readVariable(request: VariableRequest): Promise<Value> {
    const data = VariableRequest.encode(request).finish();
    return this.rpc.request(this.service, "readVariable", data).then((d) => Value.decode(new BinaryReader(d) as any));
  }

  listenVariable(request: VariableRequest): Observable<Value> {
    const data = VariableRequest.encode(request).finish();
    const result = this.rpc.serverStreamingRequest(this.service, "listenVariable", data);
    return result.pipe(map((d) => Value.decode(new BinaryReader(d) as any)));
  }

  saveVariable(request: SaveVariableRequest): Promise<Empty> {
    const data = SaveVariableRequest.encode(request).finish();
    return this.rpc.request(this.service, "saveVariable", data).then((d) => Empty.decode(new BinaryReader(d) as any));
  }

  dispatchEvent(request: DispatchEventRequest): Promise<Empty> {
    const data = DispatchEventRequest.encode(request).finish();
    return this.rpc.request(this.service, "dispatchEvent", data).then((d) => Empty.decode(new BinaryReader(d) as any));
  }

  listenEvent(request: EventRequest): Observable<EventResponse> {
    const data = EventRequest.encode(request).finish();
    const result = this.rpc.serverStreamingRequest(this.service, "listenEvent", data);
    return result.pipe(map((d) => EventResponse.decode(new BinaryReader(d) as any)));
  }

  handleMapStorageUploadMapDetected(request: MapStorageClearAfterUploadMessage): Promise<Empty> {
    const data = MapStorageClearAfterUploadMessage.encode(request).finish();
    return this.rpc.request(this.service, "handleMapStorageUploadMapDetected", data).then((d) => Empty.decode(new BinaryReader(d) as any));
  }

  dispatchGlobalEvent(request: DispatchGlobalEventRequest): Promise<Empty> {
    const data = DispatchGlobalEventRequest.encode(request).finish();
    return this.rpc.request(this.service, "dispatchGlobalEvent", data).then((d) => Empty.decode(new BinaryReader(d) as any));
  }

  dispatchExternalModuleMessage(request: ExternalModuleMessage): Promise<Empty> {
    const data = ExternalModuleMessage.encode(request).finish();
    return this.rpc.request(this.service, "dispatchExternalModuleMessage", data).then((d) => Empty.decode(new BinaryReader(d) as any));
  }
}

export interface SpaceManager {
  watchSpace(request: Observable<PusherToBackSpaceMessage>): Observable<BackToPusherSpaceMessage>;
}

export const SpaceManagerServiceName = "SpaceManager";
export class SpaceManagerClientImpl implements SpaceManager {
  private readonly rpc: Rpc;
  private readonly service: string;
  constructor(rpc: Rpc, opts?: { service?: string }) {
    this.service = opts?.service || SpaceManagerServiceName;
    this.rpc = rpc;
  }
  watchSpace(request: Observable<PusherToBackSpaceMessage>): Observable<BackToPusherSpaceMessage> {
    const data = request.pipe(map((req) => PusherToBackSpaceMessage.encode(req).finish()));
    const result = this.rpc.bidirectionalStreamingRequest(this.service, "watchSpace", data);
    return result.pipe(map((d) => BackToPusherSpaceMessage.decode(new BinaryReader(d) as any)));
  }
}

export interface MapStorage {
  ping(request: PingMessage): Promise<PingMessage>;
  handleEditMapCommandWithKeyMessage(request: EditMapCommandWithKeyMessage): Promise<EditMapCommandMessage>;
  handleUpdateMapToNewestMessage(request: UpdateMapToNewestWithKeyMessage): Promise<EditMapCommandsArrayMessage>;
  handleClearAfterUpload(request: MapStorageClearAfterUploadMessage): Promise<Empty>;
}

export const MapStorageServiceName = "MapStorage";
export class MapStorageClientImpl implements MapStorage {
  private readonly rpc: Rpc;
  private readonly service: string;
  constructor(rpc: Rpc, opts?: { service?: string }) {
    this.service = opts?.service || MapStorageServiceName;
    this.rpc = rpc;
  }
  ping(request: PingMessage): Promise<PingMessage> {
    const data = PingMessage.encode(request).finish();
    return this.rpc.request(this.service, "ping", data).then((d) => PingMessage.decode(new BinaryReader(d) as any));
  }

  handleEditMapCommandWithKeyMessage(request: EditMapCommandWithKeyMessage): Promise<EditMapCommandMessage> {
    const data = EditMapCommandWithKeyMessage.encode(request).finish();
    return this.rpc.request(this.service, "handleEditMapCommandWithKeyMessage", data).then((d) => EditMapCommandMessage.decode(new BinaryReader(d) as any));
  }

  handleUpdateMapToNewestMessage(request: UpdateMapToNewestWithKeyMessage): Promise<EditMapCommandsArrayMessage> {
    const data = UpdateMapToNewestWithKeyMessage.encode(request).finish();
    return this.rpc.request(this.service, "handleUpdateMapToNewestMessage", data).then((d) => EditMapCommandsArrayMessage.decode(new BinaryReader(d) as any));
  }

  handleClearAfterUpload(request: MapStorageClearAfterUploadMessage): Promise<Empty> {
    const data = MapStorageClearAfterUploadMessage.encode(request).finish();
    return this.rpc.request(this.service, "handleClearAfterUpload", data).then((d) => Empty.decode(new BinaryReader(d) as any));
  }
}

interface Rpc {
  request(service: string, method: string, data: Uint8Array): Promise<Uint8Array>;
  clientStreamingRequest(service: string, method: string, data: Observable<Uint8Array>): Promise<Uint8Array>;
  serverStreamingRequest(service: string, method: string, data: Uint8Array): Observable<Uint8Array>;
  bidirectionalStreamingRequest(service: string, method: string, data: Observable<Uint8Array>): Observable<Uint8Array>;
}