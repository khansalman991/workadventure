"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomEntityDirection = exports.UpdateWAMSettingsMessage = exports.ModifiyWAMMetadataMessage = exports.UploadFileMessage = exports.UploadEntityMessage = exports.ModifyCustomEntityMessage = exports.DeleteCustomEntityMessage = exports.RoomApi = exports.Services = void 0;
// 1. Core Messages
__exportStar(require("./ts-proto-generated/messages"), exports);
__exportStar(require("./protobuf-transformers/undefinedChecker"), exports);
__exportStar(require("./protobuf-transformers/transformers"), exports);
__exportStar(require("./JsonMessages/AdminApiData"), exports);
__exportStar(require("./JsonMessages/ApiVersion"), exports);
__exportStar(require("./JsonMessages/ApplicationDefinitionInterface"), exports);
__exportStar(require("./JsonMessages/CapabilitiesData"), exports);
__exportStar(require("./JsonMessages/CompanionTextures"), exports);
__exportStar(require("./JsonMessages/ChatData"), exports);
__exportStar(require("./JsonMessages/ErrorApiData"), exports);
__exportStar(require("./JsonMessages/MapDetailsData"), exports);
__exportStar(require("./JsonMessages/MetaTagFavicon"), exports);
__exportStar(require("./JsonMessages/MetaTagManifestIcon"), exports);
__exportStar(require("./JsonMessages/PlayerTextures"), exports);
__exportStar(require("./JsonMessages/RegisterData"), exports);
__exportStar(require("./JsonMessages/RoomRedirect"), exports);
__exportStar(require("./JsonMessages/OpidWokaNamePolicy"), exports);
__exportStar(require("./JsonMessages/MeResponse"), exports);
__exportStar(require("./JsonMessages/MeRequest"), exports);
__exportStar(require("./JsonMessages/MemberData"), exports);
// 2. Namespaced Exports (Services)
exports.Services = __importStar(require("./ts-proto-generated/services"));
exports.RoomApi = __importStar(require("./ts-proto-generated/room-api"));
// 3. Bridge Exports (For map-editor compatibility)
var messages_1 = require("./ts-proto-generated/messages");
Object.defineProperty(exports, "DeleteCustomEntityMessage", { enumerable: true, get: function () { return messages_1.DeleteCustomEntityMessage; } });
Object.defineProperty(exports, "ModifyCustomEntityMessage", { enumerable: true, get: function () { return messages_1.ModifyCustomEntityMessage; } });
Object.defineProperty(exports, "UploadEntityMessage", { enumerable: true, get: function () { return messages_1.UploadEntityMessage; } });
Object.defineProperty(exports, "UploadFileMessage", { enumerable: true, get: function () { return messages_1.UploadFileMessage; } });
Object.defineProperty(exports, "ModifiyWAMMetadataMessage", { enumerable: true, get: function () { return messages_1.ModifiyWAMMetadataMessage; } });
Object.defineProperty(exports, "UpdateWAMSettingsMessage", { enumerable: true, get: function () { return messages_1.UpdateWAMSettingsMessage; } });
Object.defineProperty(exports, "CustomEntityDirection", { enumerable: true, get: function () { return messages_1.CustomEntityDirection; } });
//# sourceMappingURL=index.js.map