"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemberData = void 0;
const zod_1 = require("zod");
const extendApi = (schema, _extension) => schema;
exports.MemberData = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string().nullable(),
    email: zod_1.z.string().nullable(),
    visitCardUrl: zod_1.z.string().nullable().optional(), //Proto handle null here. If something goes wrong with personal area, this may be the issue
    chatID: zod_1.z.string().nullable().optional(),
});
//# sourceMappingURL=MemberData.js.map