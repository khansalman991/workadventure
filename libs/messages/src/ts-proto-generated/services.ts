/* eslint-disable */
import { BinaryReader } from "@bufbuild/protobuf/wire";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

// FIXED: Local relative imports
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
    this.joinRoom = this.joinRoom.bind(this);
    this.listenRoom = this.listenRoom.bind(this);
    this.adminRoom = this.adminRoom.bind(this);
    this.sendAdminMessage = this.sendAdminMessage.bind(this);
    this.sendGlobalAdminMessage = this.sendGlobalAdminMessage.bind(this);
    this.ban = this.ban.bind(this);
    this.sendAdminMessageToRoom = this.sendAdminMessageToRoom.bind(this);
    this.sendWorldFullWarningToRoom = this.sendWorldFullWarningToRoom.bind(this);
    this.sendRefreshRoomPrompt = this.sendRefreshRoomPrompt.bind(this);
    this.getRooms = this.getRooms.bind(this);
    this.ping = this.ping.bind(this);
    this.readVariable = this.readVariable.bind(this);
    this.listenVariable = this.listenVariable.bind(this);
    this.saveVariable = this.saveVariable.bind(this);
    this.dispatchEvent = this.dispatchEvent.bind(this);
    this.listenEvent = this.listenEvent.bind(this);
    this.handleMapStorageUploadMapDetected = this.handleMapStorageUploadMapDetected.bind(this);
    this.dispatchGlobalEvent = this.dispatchGlobalEvent.bind(this);
    this.dispatchExternalModuleMessage = this.dispatchExternalModuleMessage.bind(this);
  }

  joinRoom(request: Observable<PusherToBackMessage>): Observable<ServerToClientMessage> {
    const data = request.pipe(map((request) => PusherToBackMessage.encode(request).finish()));
    const result = this.rpc.bidirectionalStreamingRequest(this.service, "joinRoom", data);
    // FIXED: Using any to bypass BinaryReader version mismatch
    return result.pipe(map((data) => ServerToClientMessage.decode(new BinaryReader(data) as any)));
  }

  listenRoom(request: Observable<PusherToBackRoomMessage>): Observable<BatchToPusherRoomMessage> {
    const data = request.pipe(map((request) => PusherToBackRoomMessage.encode(request).finish()));
    const result = this.rpc.bidirectionalStreamingRequest(this.service, "listenRoom", data);
    return result.pipe(map((data) => BatchToPusherRoomMessage.decode(new BinaryReader(data) as any)));
  }

  adminRoom(request: Observable<AdminPusherToBackMessage>): Observable<ServerToAdminClientMessage> {
    const data = request.pipe(map((request) => AdminPusherToBackMessage.encode(request).finish()));
    const result = this.rpc.bidirectionalStreamingRequest(this.service, "adminRoom", data);
    return result.pipe(map((data) => ServerToAdminClientMessage.decode(new BinaryReader(data) as any)));
  }

  sendAdminMessage(request: AdminMessage): Promise<Empty> {
    const data = AdminMessage.encode(request).finish();
    const promise = this.rpc.request(this.service, "sendAdminMessage", data);
    return promise.then((data) => Empty.decode(new BinaryReader(data) as any));
  }

  sendGlobalAdminMessage(request: AdminGlobalMessage): Promise<Empty> {
    const data = AdminGlobalMessage.encode(request).finish();
    const promise = this.rpc.request(this.service, "sendGlobalAdminMessage", data);
    return promise.then((data) => Empty.decode(new BinaryReader(data) as any));
  }

  ban(request: BanMessage): Promise<Empty> {
    const data = BanMessage.encode(request).finish();
    const promise = this.rpc.request(this.service, "ban", data);
    return promise.then((data) => Empty.decode(new BinaryReader(data) as any));
  }

  sendAdminMessageToRoom(request: AdminRoomMessage): Promise<Empty> {
    const data = AdminRoomMessage.encode(request).finish();
    const promise = this.rpc.request(this.service, "sendAdminMessageToRoom", data);
    return promise.then((data) => Empty.decode(new BinaryReader(data) as any));
  }

  sendWorldFullWarningToRoom(request: WorldFullWarningToRoomMessage): Promise<Empty> {
    const data = WorldFullWarningToRoomMessage.encode(request).finish();
    const promise = this.rpc.request(this.service, "sendWorldFullWarningToRoom", data);
    return promise.then((data) => Empty.decode(new BinaryReader(data) as any));
  }

  sendRefreshRoomPrompt(request: RefreshRoomPromptMessage): Promise<Empty> {
    const data = RefreshRoomPromptMessage.encode(request).finish();
    const promise = this.rpc.request(this.service, "sendRefreshRoomPrompt", data);
    return promise.then((data) => Empty.decode(new BinaryReader(data) as any));
  }

  getRooms(request: Empty): Promise<RoomsList> {
    const data = Empty.encode(request).finish();
    const promise = this.rpc.request(this.service, "getRooms", data);
    return promise.then((data) => RoomsList.decode(new BinaryReader(data) as any));
  }

  ping(request: PingMessage): Promise<PingMessage> {
    const data = PingMessage.encode(request).finish();
    const promise = this.rpc.request(this.service, "ping", data);
    return promise.then((data) => PingMessage.decode(new BinaryReader(data) as any));
  }

  readVariable(request: VariableRequest): Promise<Value> {
    const data = VariableRequest.encode(request).finish();
    const promise = this.rpc.request(this.service, "readVariable", data);
    return promise.then((data) => Value.decode(new BinaryReader(data) as any));
  }

  listenVariable(request: VariableRequest): Observable<Value> {
    const data = VariableRequest.encode(request).finish();
    const result = this.rpc.serverStreamingRequest(this.service, "listenVariable", data);
    return result.pipe(map((data) => Value.decode(new BinaryReader(data) as any)));
  }

  saveVariable(request: SaveVariableRequest): Promise<Empty> {
    const data = SaveVariableRequest.encode(request).finish();
    const promise = this.rpc.request(this.service, "saveVariable", data);
    return promise.then((data) => Empty.decode(new BinaryReader(data) as any));
  }

  dispatchEvent(request: DispatchEventRequest): Promise<Empty> {
    const data = DispatchEventRequest.encode(request).finish();
    const promise = this.rpc.request(this.service, "dispatchEvent", data);
    return promise.then((data) => Empty.decode(new BinaryReader(data) as any));
  }

  listenEvent(request: EventRequest): Observable<EventResponse> {
    const data = EventRequest.encode(request).finish();
    const result = this.rpc.serverStreamingRequest(this.service, "listenEvent", data);
    return result.pipe(map((data) => EventResponse.decode(new BinaryReader(data) as any)));
  }

  handleMapStorageUploadMapDetected(request: MapStorageClearAfterUploadMessage): Promise<Empty> {
    const data = MapStorageClearAfterUploadMessage.encode(request).finish();
    const promise = this.rpc.request(this.service, "handleMapStorageUploadMapDetected", data);
    return promise.then((data) => Empty.decode(new BinaryReader(data) as any));
  }

  dispatchGlobalEvent(request: DispatchGlobalEventRequest): Promise<Empty> {
    const data = DispatchGlobalEventRequest.encode(request).finish();
    const promise = this.rpc.request(this.service, "dispatchGlobalEvent", data);
    return promise.then((data) => Empty.decode(new BinaryReader(data) as any));
  }

  dispatchExternalModuleMessage(request: ExternalModuleMessage): Promise<Empty> {
    const data = ExternalModuleMessage.encode(request).finish();
    const promise = this.rpc.request(this.service, "dispatchExternalModuleMessage", data);
    return promise.then((data) => Empty.decode(new BinaryReader(data) as any));
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
    this.watchSpace = this.watchSpace.bind(this);
  }
  watchSpace(request: Observable<PusherToBackSpaceMessage>): Observable<BackToPusherSpaceMessage> {
    const data = request.pipe(map((request) => PusherToBackSpaceMessage.encode(request).finish()));
    const result = this.rpc.bidirectionalStreamingRequest(this.service, "watchSpace", data);
    return result.pipe(map((data) => BackToPusherSpaceMessage.decode(new BinaryReader(data) as any)));
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
    this.ping = this.ping.bind(this);
    this.handleEditMapCommandWithKeyMessage = this.handleEditMapCommandWithKeyMessage.bind(this);
    this.handleUpdateMapToNewestMessage = this.handleUpdateMapToNewestMessage.bind(this);
    this.handleClearAfterUpload = this.handleClearAfterUpload.bind(this);
  }
  ping(request: PingMessage): Promise<PingMessage> {
    const data = PingMessage.encode(request).finish();
    const promise = this.rpc.request(this.service, "ping", data);
    return promise.then((data) => PingMessage.decode(new BinaryReader(data) as any));
  }

  handleEditMapCommandWithKeyMessage(request: EditMapCommandWithKeyMessage): Promise<EditMapCommandMessage> {
    const data = EditMapCommandWithKeyMessage.encode(request).finish();
    const promise = this.rpc.request(this.service, "handleEditMapCommandWithKeyMessage", data);
    return promise.then((data) => EditMapCommandMessage.decode(new BinaryReader(data) as any));
  }

  handleUpdateMapToNewestMessage(request: UpdateMapToNewestWithKeyMessage): Promise<EditMapCommandsArrayMessage> {
    const data = UpdateMapToNewestWithKeyMessage.encode(request).finish();
    const promise = this.rpc.request(this.service, "handleUpdateMapToNewestMessage", data);
    return promise.then((data) => EditMapCommandsArrayMessage.decode(new BinaryReader(data) as any));
  }

  handleClearAfterUpload(request: MapStorageClearAfterUploadMessage): Promise<Empty> {
    const data = MapStorageClearAfterUploadMessage.encode(request).finish();
    const promise = this.rpc.request(this.service, "handleClearAfterUpload", data);
    return promise.then((data) => Empty.decode(new BinaryReader(data) as any));
  }
}

interface Rpc {
  request(service: string, method: string, data: Uint8Array): Promise<Uint8Array>;
  clientStreamingRequest(service: string, method: string, data: Observable<Uint8Array>): Promise<Uint8Array>;
  serverStreamingRequest(service: string, method: string, data: Uint8Array): Observable<Uint8Array>;
  bidirectionalStreamingRequest(service: string, method: string, data: Observable<Uint8Array>): Observable<Uint8Array>;
}