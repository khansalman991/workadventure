"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isMetaTagFavicon = void 0;
const zod_1 = require("zod");
const extendApi = (schema, _extension) => schema;
/* FIXED: Changed to namespaced import to resolve the 'extendApi' export error */
exports.isMetaTagFavicon = zod_1.z.object({
    rel: extendApi(zod_1.z.string(), {
        description: "Device specification",
        example: "apple-touch-icon",
    }),
    sizes: extendApi(zod_1.z.string(), {
        description: "Icon sizes",
        example: "57x57",
    }),
    src: extendApi(zod_1.z.string(), {
        description: "Icon path",
        example: "https://workadventu.re/icons/apple-icon-57x57.png",
    }),
});
//# sourceMappingURL=MetaTagFavicon.js.map