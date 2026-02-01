"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WokaDetail = exports.wokaPartNames = exports.wokaList = exports.wokaTexture = void 0;
const zod_1 = require("zod");
const extendApi = (schema, _extension) => schema;
/* FIXED: Changed to namespaced import to resolve the 'extendApi' export error */
//The list of all the player textures, both the default models and the partial textures used for customization
exports.wokaTexture = zod_1.z.object({
    id: extendApi(zod_1.z.string(), {
        description: "A unique identifier for this texture.",
        example: "03395306-5dee-4b16-a034-36f2c5f2324a",
    }),
    name: extendApi(zod_1.z.string(), {
        description: "The name of the texture.",
        example: "Hair 1",
    }),
    url: extendApi(zod_1.z.string(), {
        description: "The URL of the image of the texture.",
        example: "http://example.com/resources/customisation/character_hairs/character_hairs1.png",
    }),
    tags: extendApi(zod_1.z.array(zod_1.z.string()).optional(), { deprecated: true }),
    tintable: extendApi(zod_1.z.boolean().optional(), {
        description: "Whether the color is customizable or not. Not used yet.",
        example: true,
    }),
});
const wokaTextureCollection = zod_1.z.object({
    name: extendApi(zod_1.z.string(), {
        description: "Name of the collection",
        example: "Hair",
    }),
    textures: zod_1.z.array(exports.wokaTexture),
});
const wokaPartType = zod_1.z.object({
    collections: zod_1.z.array(wokaTextureCollection),
    required: zod_1.z.boolean().optional(),
});
exports.wokaList = zod_1.z.record(wokaPartType);
exports.wokaPartNames = [
    "woka",
    "body",
    "eyes",
    "hair",
    "clothes",
    "hat",
    "accessory",
];
exports.WokaDetail = zod_1.z.object({
    id: extendApi(zod_1.z.string(), {
        description: "The unique identifier of the Woka texture.",
        example: "03395306-5dee-4b16-a034-36f2c5f2324a",
    }),
    url: extendApi(zod_1.z.string(), {
        description: "The URL of the image of the woka.",
        example: "http://example.com/resources/characters/pipoya/male.png",
    }),
});
//# sourceMappingURL=PlayerTextures.js.map