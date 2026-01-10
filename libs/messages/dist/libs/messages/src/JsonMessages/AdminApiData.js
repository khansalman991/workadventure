"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isOauthRefreshToken = exports.isUserRoomToken = exports.isAdminApiData = void 0;
const zod_1 = require("zod");
/**
 * MOCKED extendApi:
 * This removes the dependency on @anatine/zod-openapi which causes
 * 'exports is not defined' and '500 Internal Server' errors in Vite.
 * It simply returns the schema as-is, which is enough for runtime validation.
 */
const extendApi = (schema, _extension) => schema;
exports.isAdminApiData = zod_1.z.object({
    userUuid: extendApi(zod_1.z.string(), {
        example: "998ce839-3dea-4698-8b41-ebbdf7688ad9",
    }),
    email: extendApi(zod_1.z.string().nullable(), {
        description: "The email of the current user.",
        example: "example@workadventu.re",
    }),
    roomUrl: extendApi(zod_1.z.string(), { example: "/@/teamSlug/worldSlug/roomSlug" }),
    mapUrlStart: extendApi(zod_1.z.string(), {
        description: "The full URL to the JSON map file",
        example: "https://myuser.github.io/myrepo/map.json",
    }),
    messages: zod_1.z.optional(zod_1.z.array(zod_1.z.unknown())),
});
exports.isUserRoomToken = zod_1.z.object({
    messages: zod_1.z.optional(zod_1.z.array(zod_1.z.unknown())),
    alg: zod_1.z.string(),
    iss: zod_1.z.string(),
    aud: zod_1.z.string(),
    iat: zod_1.z.number(),
    uid: zod_1.z.string(),
    user: extendApi(zod_1.z.string().nullable(), {
        description: "The email of the current user.",
        example: "example@workadventu.re",
    }),
    room: extendApi(zod_1.z.string(), {
        description: "The room URL of the current user.",
        example: "/@/teamSlug/worldSlug/roomSlug",
    }),
    exp: zod_1.z.number(),
});
exports.isOauthRefreshToken = zod_1.z.object({
    message: zod_1.z.string(),
    token: zod_1.z.string(),
});
//# sourceMappingURL=AdminApiData.js.map