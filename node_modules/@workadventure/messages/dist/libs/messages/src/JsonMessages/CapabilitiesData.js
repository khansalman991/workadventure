"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isCapabilities = void 0;
const zod_1 = require("zod");
const extendApi = (schema, _extension) => schema;
/* FIXED: Changed to namespaced import to resolve the 'extendApi' export error */
exports.isCapabilities = zod_1.z.object({
    "api/companion/list": extendApi(zod_1.z.optional(zod_1.z.string()), {
        description: "Means the api implements a companion list",
        example: "v1",
    }),
    "api/woka/list": extendApi(zod_1.z.optional(zod_1.z.string()), {
        description: "Means the api implements woka list, This capability will be added regardless",
        example: "v1",
    }),
    "api/domain/verify": extendApi(zod_1.z.optional(zod_1.z.string()), {
        description: "Means the api can validate if a domain is a legitimate domain. Needed if you do OAuth login AND your WorkAdventure install supports multiple domains.",
        example: "v1",
    }),
    "api/save-name": extendApi(zod_1.z.optional(zod_1.z.string()), {
        description: "Means the api can save the name of the Woka when configured in WorkAdventure.",
        example: "v1",
    }),
    "api/save-textures": extendApi(zod_1.z.optional(zod_1.z.string()), {
        description: "Means the api can save the textures of the Woka when configured in WorkAdventure.",
        example: "v1",
    }),
    "api/livekit/credentials": extendApi(zod_1.z.optional(zod_1.z.string()), {
        description: "Means the api implements the livekit credentials",
        example: "v1"
    }),
    "api/ice-servers": extendApi(zod_1.z.optional(zod_1.z.string()), {
        description: "The API can provide ICE server configurations (including TURN servers and credentials) for WebRTC connections.",
        example: "v1"
    }),
});
//# sourceMappingURL=CapabilitiesData.js.map