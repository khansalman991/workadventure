"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeRequest = void 0;
const zod_1 = require("zod");
exports.MeRequest = zod_1.z.object({
    token: zod_1.z.string(),
    playUri: zod_1.z.string(),
    "localStorageCharacterTextureIds[]": zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
    localStorageCompanionTextureId: zod_1.z.string().optional(),
    chatID: zod_1.z.string().optional(),
});
//# sourceMappingURL=MeRequest.js.map