"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MapStorageClientImpl = exports.MapStorageServiceName = exports.SpaceManagerClientImpl = exports.SpaceManagerServiceName = exports.RoomManagerClientImpl = exports.RoomManagerServiceName = exports.protobufPackage = void 0;
/* eslint-disable */
const wire_1 = require("@bufbuild/protobuf/wire");
const operators_1 = require("rxjs/operators");
// FIXED: Local relative imports
const empty_1 = require("./google/protobuf/empty");
const struct_1 = require("./google/protobuf/struct");
const messages_1 = require("./messages");
exports.protobufPackage = "";
exports.RoomManagerServiceName = "RoomManager";
class RoomManagerClientImpl {
    constructor(rpc, opts) {
        this.service = (opts === null || opts === void 0 ? void 0 : opts.service) || exports.RoomManagerServiceName;
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
    joinRoom(request) {
        const data = request.pipe((0, operators_1.map)((request) => messages_1.PusherToBackMessage.encode(request).finish()));
        const result = this.rpc.bidirectionalStreamingRequest(this.service, "joinRoom", data);
        // FIXED: Using any to bypass BinaryReader version mismatch
        return result.pipe((0, operators_1.map)((data) => messages_1.ServerToClientMessage.decode(new wire_1.BinaryReader(data))));
    }
    listenRoom(request) {
        const data = request.pipe((0, operators_1.map)((request) => messages_1.PusherToBackRoomMessage.encode(request).finish()));
        const result = this.rpc.bidirectionalStreamingRequest(this.service, "listenRoom", data);
        return result.pipe((0, operators_1.map)((data) => messages_1.BatchToPusherRoomMessage.decode(new wire_1.BinaryReader(data))));
    }
    adminRoom(request) {
        const data = request.pipe((0, operators_1.map)((request) => messages_1.AdminPusherToBackMessage.encode(request).finish()));
        const result = this.rpc.bidirectionalStreamingRequest(this.service, "adminRoom", data);
        return result.pipe((0, operators_1.map)((data) => messages_1.ServerToAdminClientMessage.decode(new wire_1.BinaryReader(data))));
    }
    sendAdminMessage(request) {
        const data = messages_1.AdminMessage.encode(request).finish();
        const promise = this.rpc.request(this.service, "sendAdminMessage", data);
        return promise.then((data) => empty_1.Empty.decode(new wire_1.BinaryReader(data)));
    }
    sendGlobalAdminMessage(request) {
        const data = messages_1.AdminGlobalMessage.encode(request).finish();
        const promise = this.rpc.request(this.service, "sendGlobalAdminMessage", data);
        return promise.then((data) => empty_1.Empty.decode(new wire_1.BinaryReader(data)));
    }
    ban(request) {
        const data = messages_1.BanMessage.encode(request).finish();
        const promise = this.rpc.request(this.service, "ban", data);
        return promise.then((data) => empty_1.Empty.decode(new wire_1.BinaryReader(data)));
    }
    sendAdminMessageToRoom(request) {
        const data = messages_1.AdminRoomMessage.encode(request).finish();
        const promise = this.rpc.request(this.service, "sendAdminMessageToRoom", data);
        return promise.then((data) => empty_1.Empty.decode(new wire_1.BinaryReader(data)));
    }
    sendWorldFullWarningToRoom(request) {
        const data = messages_1.WorldFullWarningToRoomMessage.encode(request).finish();
        const promise = this.rpc.request(this.service, "sendWorldFullWarningToRoom", data);
        return promise.then((data) => empty_1.Empty.decode(new wire_1.BinaryReader(data)));
    }
    sendRefreshRoomPrompt(request) {
        const data = messages_1.RefreshRoomPromptMessage.encode(request).finish();
        const promise = this.rpc.request(this.service, "sendRefreshRoomPrompt", data);
        return promise.then((data) => empty_1.Empty.decode(new wire_1.BinaryReader(data)));
    }
    getRooms(request) {
        const data = empty_1.Empty.encode(request).finish();
        const promise = this.rpc.request(this.service, "getRooms", data);
        return promise.then((data) => messages_1.RoomsList.decode(new wire_1.BinaryReader(data)));
    }
    ping(request) {
        const data = messages_1.PingMessage.encode(request).finish();
        const promise = this.rpc.request(this.service, "ping", data);
        return promise.then((data) => messages_1.PingMessage.decode(new wire_1.BinaryReader(data)));
    }
    readVariable(request) {
        const data = messages_1.VariableRequest.encode(request).finish();
        const promise = this.rpc.request(this.service, "readVariable", data);
        return promise.then((data) => struct_1.Value.decode(new wire_1.BinaryReader(data)));
    }
    listenVariable(request) {
        const data = messages_1.VariableRequest.encode(request).finish();
        const result = this.rpc.serverStreamingRequest(this.service, "listenVariable", data);
        return result.pipe((0, operators_1.map)((data) => struct_1.Value.decode(new wire_1.BinaryReader(data))));
    }
    saveVariable(request) {
        const data = messages_1.SaveVariableRequest.encode(request).finish();
        const promise = this.rpc.request(this.service, "saveVariable", data);
        return promise.then((data) => empty_1.Empty.decode(new wire_1.BinaryReader(data)));
    }
    dispatchEvent(request) {
        const data = messages_1.DispatchEventRequest.encode(request).finish();
        const promise = this.rpc.request(this.service, "dispatchEvent", data);
        return promise.then((data) => empty_1.Empty.decode(new wire_1.BinaryReader(data)));
    }
    listenEvent(request) {
        const data = messages_1.EventRequest.encode(request).finish();
        const result = this.rpc.serverStreamingRequest(this.service, "listenEvent", data);
        return result.pipe((0, operators_1.map)((data) => messages_1.EventResponse.decode(new wire_1.BinaryReader(data))));
    }
    handleMapStorageUploadMapDetected(request) {
        const data = messages_1.MapStorageClearAfterUploadMessage.encode(request).finish();
        const promise = this.rpc.request(this.service, "handleMapStorageUploadMapDetected", data);
        return promise.then((data) => empty_1.Empty.decode(new wire_1.BinaryReader(data)));
    }
    dispatchGlobalEvent(request) {
        const data = messages_1.DispatchGlobalEventRequest.encode(request).finish();
        const promise = this.rpc.request(this.service, "dispatchGlobalEvent", data);
        return promise.then((data) => empty_1.Empty.decode(new wire_1.BinaryReader(data)));
    }
    dispatchExternalModuleMessage(request) {
        const data = messages_1.ExternalModuleMessage.encode(request).finish();
        const promise = this.rpc.request(this.service, "dispatchExternalModuleMessage", data);
        return promise.then((data) => empty_1.Empty.decode(new wire_1.BinaryReader(data)));
    }
}
exports.RoomManagerClientImpl = RoomManagerClientImpl;
exports.SpaceManagerServiceName = "SpaceManager";
class SpaceManagerClientImpl {
    constructor(rpc, opts) {
        this.service = (opts === null || opts === void 0 ? void 0 : opts.service) || exports.SpaceManagerServiceName;
        this.rpc = rpc;
        this.watchSpace = this.watchSpace.bind(this);
    }
    watchSpace(request) {
        const data = request.pipe((0, operators_1.map)((request) => messages_1.PusherToBackSpaceMessage.encode(request).finish()));
        const result = this.rpc.bidirectionalStreamingRequest(this.service, "watchSpace", data);
        return result.pipe((0, operators_1.map)((data) => messages_1.BackToPusherSpaceMessage.decode(new wire_1.BinaryReader(data))));
    }
}
exports.SpaceManagerClientImpl = SpaceManagerClientImpl;
exports.MapStorageServiceName = "MapStorage";
class MapStorageClientImpl {
    constructor(rpc, opts) {
        this.service = (opts === null || opts === void 0 ? void 0 : opts.service) || exports.MapStorageServiceName;
        this.rpc = rpc;
        this.ping = this.ping.bind(this);
        this.handleEditMapCommandWithKeyMessage = this.handleEditMapCommandWithKeyMessage.bind(this);
        this.handleUpdateMapToNewestMessage = this.handleUpdateMapToNewestMessage.bind(this);
        this.handleClearAfterUpload = this.handleClearAfterUpload.bind(this);
    }
    ping(request) {
        const data = messages_1.PingMessage.encode(request).finish();
        const promise = this.rpc.request(this.service, "ping", data);
        return promise.then((data) => messages_1.PingMessage.decode(new wire_1.BinaryReader(data)));
    }
    handleEditMapCommandWithKeyMessage(request) {
        const data = messages_1.EditMapCommandWithKeyMessage.encode(request).finish();
        const promise = this.rpc.request(this.service, "handleEditMapCommandWithKeyMessage", data);
        return promise.then((data) => messages_1.EditMapCommandMessage.decode(new wire_1.BinaryReader(data)));
    }
    handleUpdateMapToNewestMessage(request) {
        const data = messages_1.UpdateMapToNewestWithKeyMessage.encode(request).finish();
        const promise = this.rpc.request(this.service, "handleUpdateMapToNewestMessage", data);
        return promise.then((data) => messages_1.EditMapCommandsArrayMessage.decode(new wire_1.BinaryReader(data)));
    }
    handleClearAfterUpload(request) {
        const data = messages_1.MapStorageClearAfterUploadMessage.encode(request).finish();
        const promise = this.rpc.request(this.service, "handleClearAfterUpload", data);
        return promise.then((data) => empty_1.Empty.decode(new wire_1.BinaryReader(data)));
    }
}
exports.MapStorageClientImpl = MapStorageClientImpl;
//# sourceMappingURL=services.js.map