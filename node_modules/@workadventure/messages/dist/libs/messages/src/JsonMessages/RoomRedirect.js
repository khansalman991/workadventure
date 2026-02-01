"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isRoomRedirect = void 0;
const zod_1 = require("zod");
const extendApi = (schema, _extension) => schema;
/* FIXED: Changed to namespaced import to resolve the 'extendApi' export error */
exports.isRoomRedirect = zod_1.z.object({
    redirectUrl: extendApi(zod_1.z.string(), {
        description: "The WorkAdventure URL to redirect to.",
        example: "https://play.yourserver.com/_/global/example.com/start.json",
    }),
});
//# sourceMappingURL=RoomRedirect.js.map