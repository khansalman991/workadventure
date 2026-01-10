"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeResponse = exports.MeSuccessResponse = void 0;
const zod_1 = require("zod");
const extendApi = (schema, _extension) => schema;
/* FIXED: Changed to namespaced import to resolve the 'extendApi' export error */
const ErrorApiData_1 = require("./ErrorApiData");
exports.MeSuccessResponse = extendApi(zod_1.z.object({
    status: zod_1.z.literal("ok"),
    authToken: extendApi(zod_1.z.string(), {
        description: "The authToken.",
    }),
    userUuid: extendApi(zod_1.z.string(), {
        description: "A unique identifier for the user.",
    }),
    email: extendApi(zod_1.z.string().nullable().optional(), {
        description: "The email of the user.",
    }),
    username: extendApi(zod_1.z.string().nullable().optional(), {
        description: "The name of the Woka.",
        example: "John",
    }),
    locale: extendApi(zod_1.z.string().nullable().optional(), {
        description: "The locale (if returned by OpenID Connect).",
    }),
    visitCardUrl: extendApi(zod_1.z.string().nullable().optional(), {
        description: "The visit card URL of the Woka.",
    }),
    isCharacterTexturesValid: extendApi(zod_1.z.boolean(), {
        description: "True if the character textures are valid, false if we need to redirect the user to the Woka selection page.",
        example: true,
    }),
    isCompanionTextureValid: extendApi(zod_1.z.boolean(), {
        description: "True if the companion texture is valid, false if we need to redirect the user to the companion selection page.",
        example: true,
    }),
    matrixUserId: extendApi(zod_1.z.string().nullable().optional(), {
        description: "The matrix user id of the user.",
    }),
    matrixServerUrl: extendApi(zod_1.z.string().nullable().optional(), {
        description: "The matrix server url for this user.",
    }),
}), {
    description: 'This is a response to the /me endpoint.',
});
exports.MeResponse = zod_1.z.union([exports.MeSuccessResponse, ErrorApiData_1.ErrorApiData]);
//# sourceMappingURL=MeResponse.js.map