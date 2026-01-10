"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanionDetail = exports.CompanionTextureCollection = exports.CompanionTexture = exports.CompanionBehavior = void 0;
const zod_1 = require("zod");
const extendApi = (schema, _extension) => schema;
/* FIXED: Changed to namespaced import to resolve the 'extendApi' export error */
//The list of all the companion textures
exports.CompanionBehavior = zod_1.z.union([
    zod_1.z.literal("cat"),
    zod_1.z.literal("dog"),
    zod_1.z.literal("red_panda"),
]);
exports.CompanionTexture = zod_1.z.object({
    id: extendApi(zod_1.z.string(), {
        description: "The unique identifier of the texture.",
        example: "03395306-5dee-4b16-a034-36f2c5f2324a",
    }),
    name: extendApi(zod_1.z.string(), { description: "The name of the texture.", example: "dog1" }),
    url: extendApi(zod_1.z.string(), {
        description: "The URL of the image of the texture.",
        example: "https://example.com/resources/characters/pipoya/Cat 01-1.png",
    }),
    behavior: extendApi(exports.CompanionBehavior, {
        description: "The behavior of the companion.",
        example: "cat",
    }).optional(),
});
exports.CompanionTextureCollection = zod_1.z.object({
    name: extendApi(zod_1.z.string(), { description: "Collection name", example: "cats" }),
    textures: exports.CompanionTexture.array(),
});
exports.CompanionDetail = zod_1.z.object({
    id: extendApi(zod_1.z.string(), {
        description: "The unique identifier of the companion texture.",
        example: "03395306-5dee-4b16-a034-36f2c5f2324a",
    }),
    url: extendApi(zod_1.z.string(), {
        description: "The URL of the image of the companion.",
        example: "http://example.com/resources/companion/pipoya/cat.png",
    }),
});
//# sourceMappingURL=CompanionTextures.js.map