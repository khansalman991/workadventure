"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isRegisterData = void 0;
const zod_1 = require("zod");
const extendApi = (schema, _extension) => schema;
exports.isRegisterData = zod_1.z.object({
    roomUrl: zod_1.z.string(),
    email: zod_1.z.string().nullable(),
    organizationMemberToken: zod_1.z.string().nullable(),
    mapUrlStart: zod_1.z.string(),
    userUuid: zod_1.z.string(),
    authToken: zod_1.z.string(),
    messages: zod_1.z.optional(zod_1.z.array(zod_1.z.unknown())),
});
//# sourceMappingURL=RegisterData.js.map