"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isUserData = void 0;
const zod_1 = require("zod");
const extendApi = (schema, _extension) => schema;
const ApplicationDefinitionInterface_1 = require("./ApplicationDefinitionInterface");
exports.isUserData = zod_1.z.object({
    uuid: zod_1.z.string(),
    email: zod_1.z.string().nullable().optional(),
    name: zod_1.z.string(),
    playUri: zod_1.z.string(),
    authToken: zod_1.z.optional(zod_1.z.string()),
    color: zod_1.z.string(),
    woka: zod_1.z.string(),
    isLogged: zod_1.z.boolean(),
    availabilityStatus: zod_1.z.number(),
    roomName: zod_1.z.optional(zod_1.z.nullable(zod_1.z.string())),
    userRoomToken: zod_1.z.optional(zod_1.z.nullable(zod_1.z.string())),
    visitCardUrl: zod_1.z.optional(zod_1.z.nullable(zod_1.z.string())),
    klaxoonToolActivated: zod_1.z.boolean().optional().default(false),
    youtubeToolActivated: zod_1.z.boolean().optional().default(false),
    googleDocsToolActivated: zod_1.z.boolean().optional().default(false),
    googleSheetsToolActivated: zod_1.z.boolean().optional().default(false),
    googleSlidesToolActivated: zod_1.z.boolean().optional().default(false),
    eraserToolActivated: zod_1.z.boolean().optional().default(false),
    klaxoonToolClientId: zod_1.z.string().optional(),
    excalidrawToolActivated: zod_1.z.boolean().optional().default(false),
    excalidrawToolDomains: zod_1.z.array(zod_1.z.string()).optional().default(['excalidraw.com']),
    applications: zod_1.z.array(ApplicationDefinitionInterface_1.isApplicationDefinitionInterface).optional(),
});
//# sourceMappingURL=ChatData.js.map