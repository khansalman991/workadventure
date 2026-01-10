import { BinaryReader, BinaryWriter } from "@bufbuild/protobuf/wire";
import { Observable } from "rxjs";
import { Empty } from "./google/protobuf/empty";
import { Value } from "./google/protobuf/struct";
export declare const protobufPackage = "roomApi";
export interface VariableRequest {
    room: string;
    name: string;
}
export interface SaveVariableRequest {
    room: string;
    name: string;
    value: any | undefined;
}
export interface EventRequest {
    room: string;
    name: string;
}
export interface EventResponse {
    data: any | undefined;
    senderId?: number | undefined;
}
export interface DispatchEventRequest {
    room: string;
    name: string;
    data: any | undefined;
    targetUserIds: number[];
}
export declare const VariableRequest: MessageFns<VariableRequest>;
export declare const SaveVariableRequest: MessageFns<SaveVariableRequest>;
export declare const EventRequest: MessageFns<EventRequest>;
export declare const EventResponse: MessageFns<EventResponse>;
export declare const DispatchEventRequest: MessageFns<DispatchEventRequest>;
export interface RoomApi {
    /** Get the current value of the given variable */
    readVariable(request: VariableRequest): Promise<Value>;
    /** Listen to value updates for a given variable */
    listenVariable(request: VariableRequest): Observable<Value>;
    /** Set the value of the given variable */
    saveVariable(request: SaveVariableRequest): Promise<Empty>;
    /** Dispatch an event to all users in the room */
    broadcastEvent(request: DispatchEventRequest): Promise<Empty>;
    /** Listen to events dispatched in the room */
    listenToEvent(request: EventRequest): Observable<EventResponse>;
}
export declare const RoomApiServiceName = "roomApi.RoomApi";
export declare class RoomApiClientImpl implements RoomApi {
    private readonly rpc;
    private readonly service;
    constructor(rpc: Rpc, opts?: {
        service?: string;
    });
    readVariable(request: VariableRequest): Promise<Value>;
    listenVariable(request: VariableRequest): Observable<Value>;
    saveVariable(request: SaveVariableRequest): Promise<Empty>;
    broadcastEvent(request: DispatchEventRequest): Promise<Empty>;
    listenToEvent(request: EventRequest): Observable<EventResponse>;
}
interface Rpc {
    request(service: string, method: string, data: Uint8Array): Promise<Uint8Array>;
    clientStreamingRequest(service: string, method: string, data: Observable<Uint8Array>): Promise<Uint8Array>;
    serverStreamingRequest(service: string, method: string, data: Uint8Array): Observable<Uint8Array>;
    bidirectionalStreamingRequest(service: string, method: string, data: Observable<Uint8Array>): Observable<Uint8Array>;
}
type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;
export type DeepPartial<T> = T extends Builtin ? T : T extends globalThis.Array<infer U> ? globalThis.Array<DeepPartial<U>> : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>> : T extends {} ? {
    [K in keyof T]?: DeepPartial<T[K]>;
} : Partial<T>;
type KeysOfUnion<T> = T extends T ? keyof T : never;
export type Exact<P, I extends P> = P extends Builtin ? P : P & {
    [K in keyof P]: Exact<P[K], I[K]>;
} & {
    [K in Exclude<keyof I, KeysOfUnion<P>>]: never;
};
export interface MessageFns<T> {
    encode(message: T, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): T;
    fromJSON(object: any): T;
    toJSON(message: T): unknown;
    create<I extends Exact<DeepPartial<T>, I>>(base?: I): T;
    fromPartial<I extends Exact<DeepPartial<T>, I>>(object: I): T;
}
export {};
