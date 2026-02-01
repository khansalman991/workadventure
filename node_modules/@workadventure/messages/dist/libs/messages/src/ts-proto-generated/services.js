"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MapStorageClientImpl = exports.MapStorageServiceName = exports.SpaceManagerClientImpl = exports.SpaceManagerServiceName = exports.RoomManagerClientImpl = exports.RoomManagerServiceName = exports.protobufPackage = void 0;
/* eslint-disable */
const wire_1 = require("@bufbuild/protobuf/wire");
const operators_1 = require("rxjs/operators");
// Relative imports for local Protobuf dependencies
const empty_1 = require("./google/protobuf/empty");
const struct_1 = require("./google/protobuf/struct");
const messages_1 = require("./messages");
exports.protobufPackage = "";
exports.RoomManagerServiceName = "RoomManager";
class RoomManagerClientImpl {
    constructor(rpc, opts) {
        this.service = (opts === null || opts === void 0 ? void 0 : opts.service) || exports.RoomManagerServiceName;
        this.rpc = rpc;
    }
    joinRoom(request) {
        const data = request.pipe((0, operators_1.map)((req) => messages_1.PusherToBackMessage.encode(req).finish()));
        const result = this.rpc.bidirectionalStreamingRequest(this.service, "joinRoom", data);
        return result.pipe((0, operators_1.map)((data) => messages_1.ServerToClientMessage.decode(new wire_1.BinaryReader(data))));
    }
    listenRoom(request) {
        const data = request.pipe((0, operators_1.map)((req) => messages_1.PusherToBackRoomMessage.encode(req).finish()));
        const result = this.rpc.bidirectionalStreamingRequest(this.service, "listenRoom", data);
        return result.pipe((0, operators_1.map)((data) => messages_1.BatchToPusherRoomMessage.decode(new wire_1.BinaryReader(data))));
    }
    adminRoom(request) {
        const data = request.pipe((0, operators_1.map)((req) => messages_1.AdminPusherToBackMessage.encode(req).finish()));
        const result = this.rpc.bidirectionalStreamingRequest(this.service, "adminRoom", data);
        return result.pipe((0, operators_1.map)((data) => messages_1.ServerToAdminClientMessage.decode(new wire_1.BinaryReader(data))));
    }
    sendAdminMessage(request) {
        const data = messages_1.AdminMessage.encode(request).finish();
        return this.rpc.request(this.service, "sendAdminMessage", data).then((d) => empty_1.Empty.decode(new wire_1.BinaryReader(d)));
    }
    sendGlobalAdminMessage(request) {
        const data = messages_1.AdminGlobalMessage.encode(request).finish();
        return this.rpc.request(this.service, "sendGlobalAdminMessage", data).then((d) => empty_1.Empty.decode(new wire_1.BinaryReader(d)));
    }
    ban(request) {
        const data = messages_1.BanMessage.encode(request).finish();
        return this.rpc.request(this.service, "ban", data).then((d) => empty_1.Empty.decode(new wire_1.BinaryReader(d)));
    }
    sendAdminMessageToRoom(request) {
        const data = messages_1.AdminRoomMessage.encode(request).finish();
        return this.rpc.request(this.service, "sendAdminMessageToRoom", data).then((d) => empty_1.Empty.decode(new wire_1.BinaryReader(d)));
    }
    sendWorldFullWarningToRoom(request) {
        const data = messages_1.WorldFullWarningToRoomMessage.encode(request).finish();
        return this.rpc.request(this.service, "sendWorldFullWarningToRoom", data).then((d) => empty_1.Empty.decode(new wire_1.BinaryReader(d)));
    }
    sendRefreshRoomPrompt(request) {
        const data = messages_1.RefreshRoomPromptMessage.encode(request).finish();
        return this.rpc.request(this.service, "sendRefreshRoomPrompt", data).then((d) => empty_1.Empty.decode(new wire_1.BinaryReader(d)));
    }
    getRooms(request) {
        const data = empty_1.Empty.encode(request).finish();
        return this.rpc.request(this.service, "getRooms", data).then((d) => messages_1.RoomsList.decode(new wire_1.BinaryReader(d)));
    }
    ping(request) {
        const data = messages_1.PingMessage.encode(request).finish();
        return this.rpc.request(this.service, "ping", data).then((d) => messages_1.PingMessage.decode(new wire_1.BinaryReader(d)));
    }
    readVariable(request) {
        const data = messages_1.VariableRequest.encode(request).finish();
        return this.rpc.request(this.service, "readVariable", data).then((d) => struct_1.Value.decode(new wire_1.BinaryReader(d)));
    }
    listenVariable(request) {
        const data = messages_1.VariableRequest.encode(request).finish();
        const result = this.rpc.serverStreamingRequest(this.service, "listenVariable", data);
        return result.pipe((0, operators_1.map)((d) => struct_1.Value.decode(new wire_1.BinaryReader(d))));
    }
    saveVariable(request) {
        const data = messages_1.SaveVariableRequest.encode(request).finish();
        return this.rpc.request(this.service, "saveVariable", data).then((d) => empty_1.Empty.decode(new wire_1.BinaryReader(d)));
    }
    dispatchEvent(request) {
        const data = messages_1.DispatchEventRequest.encode(request).finish();
        return this.rpc.request(this.service, "dispatchEvent", data).then((d) => empty_1.Empty.decode(new wire_1.BinaryReader(d)));
    }
    listenEvent(request) {
        const data = messages_1.EventRequest.encode(request).finish();
        const result = this.rpc.serverStreamingRequest(this.service, "listenEvent", data);
        return result.pipe((0, operators_1.map)((d) => messages_1.EventResponse.decode(new wire_1.BinaryReader(d))));
    }
    handleMapStorageUploadMapDetected(request) {
        const data = messages_1.MapStorageClearAfterUploadMessage.encode(request).finish();
        return this.rpc.request(this.service, "handleMapStorageUploadMapDetected", data).then((d) => empty_1.Empty.decode(new wire_1.BinaryReader(d)));
    }
    dispatchGlobalEvent(request) {
        const data = messages_1.DispatchGlobalEventRequest.encode(request).finish();
        return this.rpc.request(this.service, "dispatchGlobalEvent", data).then((d) => empty_1.Empty.decode(new wire_1.BinaryReader(d)));
    }
    dispatchExternalModuleMessage(request) {
        const data = messages_1.ExternalModuleMessage.encode(request).finish();
        return this.rpc.request(this.service, "dispatchExternalModuleMessage", data).then((d) => empty_1.Empty.decode(new wire_1.BinaryReader(d)));
    }
}
exports.RoomManagerClientImpl = RoomManagerClientImpl;
exports.SpaceManagerServiceName = "SpaceManager";
class SpaceManagerClientImpl {
    constructor(rpc, opts) {
        this.service = (opts === null || opts === void 0 ? void 0 : opts.service) || exports.SpaceManagerServiceName;
        this.rpc = rpc;
    }
    watchSpace(request) {
        const data = request.pipe((0, operators_1.map)((req) => messages_1.PusherToBackSpaceMessage.encode(req).finish()));
        const result = this.rpc.bidirectionalStreamingRequest(this.service, "watchSpace", data);
        return result.pipe((0, operators_1.map)((d) => messages_1.BackToPusherSpaceMessage.decode(new wire_1.BinaryReader(d))));
    }
}
exports.SpaceManagerClientImpl = SpaceManagerClientImpl;
exports.MapStorageServiceName = "MapStorage";
class MapStorageClientImpl {
    constructor(rpc, opts) {
        this.service = (opts === null || opts === void 0 ? void 0 : opts.service) || exports.MapStorageServiceName;
        this.rpc = rpc;
    }
    ping(request) {
        const data = messages_1.PingMessage.encode(request).finish();
        return this.rpc.request(this.service, "ping", data).then((d) => messages_1.PingMessage.decode(new wire_1.BinaryReader(d)));
    }
    handleEditMapCommandWithKeyMessage(request) {
        const data = messages_1.EditMapCommandWithKeyMessage.encode(request).finish();
        return this.rpc.request(this.service, "handleEditMapCommandWithKeyMessage", data).then((d) => messages_1.EditMapCommandMessage.decode(new wire_1.BinaryReader(d)));
    }
    handleUpdateMapToNewestMessage(request) {
        const data = messages_1.UpdateMapToNewestWithKeyMessage.encode(request).finish();
        return this.rpc.request(this.service, "handleUpdateMapToNewestMessage", data).then((d) => messages_1.EditMapCommandsArrayMessage.decode(new wire_1.BinaryReader(d)));
    }
    handleClearAfterUpload(request) {
        const data = messages_1.MapStorageClearAfterUploadMessage.encode(request).finish();
        return this.rpc.request(this.service, "handleClearAfterUpload", data).then((d) => empty_1.Empty.decode(new wire_1.BinaryReader(d)));
    }
}
exports.MapStorageClientImpl = MapStorageClientImpl;
//# sourceMappingURL=services.js.map