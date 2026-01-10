"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isMetaTagManifestIcon = void 0;
const zod_1 = require("zod");
const extendApi = (schema, _extension) => schema;
/* FIXED: Changed to namespaced import to resolve the 'extendApi' export error */
exports.isMetaTagManifestIcon = extendApi(zod_1.z.object({
    sizes: extendApi(zod_1.z.string(), {
        description: "Icon sizes",
        example: "57x57 64x64",
    }),
    src: extendApi(zod_1.z.string(), {
        description: "Icon path",
        example: "https://workadventu.re/icons/apple-icon-57x57.png",
    }),
    type: extendApi(zod_1.z.string().optional(), {
        description: "A hint as to the media type of the image. The purpose of this member is to allow a user agent to quickly ignore images with media types it does not support.",
        example: "image/webp",
    }),
    purpose: extendApi(zod_1.z.string().optional(), {
        description: "Defines the purpose of the image, for example if the image is intended to serve some special purpose in the context of the host OS (i.e., for better integration).",
        example: "any",
    }),
}), {
    description: "An icon as represented in the manifest.json file (for PWA)",
});
//# sourceMappingURL=MetaTagManifestIcon.js.map