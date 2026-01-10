"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpidWokaNamePolicy = void 0;
const zod_1 = require("zod");
const extendApi = (schema, _extension) => schema;
/* FIXED: Changed to namespaced import to resolve the 'extendApi' export error */
exports.OpidWokaNamePolicy = extendApi(zod_1.z.enum(["user_input", "allow_override_opid", "force_opid", ""]), {
    example: "['user_input', 'allow_override_opid', 'force_opid']",
})
    .optional()
    .nullable();
//# sourceMappingURL=OpidWokaNamePolicy.js.map