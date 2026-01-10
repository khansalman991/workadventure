import {
    PingMessage, EditMapCommandWithKeyMessage, EditMapCommandMessage,
    UpdateMapToNewestWithKeyMessage, EditMapCommandsArrayMessage,
    MapStorageClearAfterUploadMessage
} from "@workadventure/messages";
import { Empty } from "@workadventure/messages/src/ts-proto-generated/google/protobuf/empty";

const makeHandler = (reqType: any, resType: any, streamReq: boolean, streamRes: boolean) => ({
    path: "", 
    requestStream: streamReq,
    responseStream: streamRes,
    requestSerialize: (value: any) => Buffer.from(reqType.encode(value).finish()),
    requestDeserialize: (value: Buffer) => reqType.decode(value),
    responseSerialize: (value: any) => Buffer.from(resType.encode(value).finish()),
    responseDeserialize: (value: Buffer) => resType.decode(value),
});

export const MapStorageDefinition = {
    ping: { ...makeHandler(PingMessage, PingMessage, false, false), path: "/MapStorage/ping" },
    handleEditMapCommandWithKeyMessage: { ...makeHandler(EditMapCommandWithKeyMessage, EditMapCommandMessage, false, false), path: "/MapStorage/handleEditMapCommandWithKeyMessage" },
    handleUpdateMapToNewestMessage: { ...makeHandler(UpdateMapToNewestWithKeyMessage, EditMapCommandsArrayMessage, false, false), path: "/MapStorage/handleUpdateMapToNewestMessage" },
    handleClearAfterUpload: { ...makeHandler(MapStorageClearAfterUploadMessage, Empty, false, false), path: "/MapStorage/handleClearAfterUpload" },
} as const;
