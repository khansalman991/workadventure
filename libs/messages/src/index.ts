// 1. Core Messages
export * from "./ts-proto-generated/messages";

export * from "./protobuf-transformers/undefinedChecker";
export * from "./protobuf-transformers/transformers";

export * from "./JsonMessages/AdminApiData";
export * from "./JsonMessages/ApiVersion";
export * from "./JsonMessages/ApplicationDefinitionInterface";
export * from "./JsonMessages/CapabilitiesData";
export * from "./JsonMessages/CompanionTextures";
export * from "./JsonMessages/ChatData";
export * from "./JsonMessages/ErrorApiData";
export * from "./JsonMessages/MapDetailsData";
export * from "./JsonMessages/MetaTagFavicon";
export * from "./JsonMessages/MetaTagManifestIcon";
export * from "./JsonMessages/PlayerTextures";
export * from "./JsonMessages/RegisterData";
export * from "./JsonMessages/RoomRedirect";
export * from "./JsonMessages/OpidWokaNamePolicy";
export * from "./JsonMessages/MeResponse";
export * from "./JsonMessages/MeRequest";
export * from "./JsonMessages/MemberData";

// 2. Namespaced Exports (Services)
export * as Services from "./ts-proto-generated/services";
export * as RoomApi from "./ts-proto-generated/room-api";

// 3. Bridge Exports (For map-editor compatibility)
export {
    DeleteCustomEntityMessage,
    ModifyCustomEntityMessage,
    UploadEntityMessage,
    UploadFileMessage,
    ModifiyWAMMetadataMessage,
    UpdateWAMSettingsMessage,
    CustomEntityDirection
} from "./ts-proto-generated/messages";