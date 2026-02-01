"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isApplicationDefinitionInterface = void 0;
const zod_1 = require("zod");
const extendApi = (schema, _extension) => schema;
/* FIXED: Changed to namespaced import to resolve the 'extendApi' export error */
exports.isApplicationDefinitionInterface = zod_1.z.object({
    name: extendApi(zod_1.z.string(), {
        description: "The name of the application",
        example: "Onboarding woka",
    }),
    script: extendApi(zod_1.z.string().optional(), {
        description: "The url of the application",
        example: "http://example.com/my/script.js",
    }),
    doc: extendApi(zod_1.z.string().optional(), {
        description: "The url of the documentation",
        example: "http://example.com/my/doc.html",
    }),
    image: extendApi(zod_1.z.string().optional(), {
        description: "The url of the application icon",
        example: "http://example.com/my/image.png",
    }),
    description: extendApi(zod_1.z.string().optional(), {
        description: "The description of the application",
        example: "This application is a great application",
    }),
    enabled: extendApi(zod_1.z.boolean().optional().default(false), {
        description: "Is the application enabled",
        example: true,
    }),
    regexUrl: extendApi(zod_1.z.string().optional(), {
        description: "The regular expression to match the url",
        example: "https://www.youtube.com/watch?v=(.*)",
    }),
    targetUrl: extendApi(zod_1.z.string().optional(), {
        description: "The target url",
        example: "https://www.youtube.com/embed/$1",
    }),
    default: extendApi(zod_1.z.boolean().optional().default(false), {
        description: "Is the application the default one and shown in the menu, map edotor, map explorer, and chat. If disabled, the apllication is kept but with a different opacity and tooltip.",
        example: true,
    }),
    forceNewTab: extendApi(zod_1.z.boolean().optional().default(false), {
        description: "Force the application to open in a new tab",
        example: true,
    }),
    allowAPI: extendApi(zod_1.z.boolean().optional().default(false), {
        description: "Allow the application to use the WorkAdventure Scripting API",
        example: true,
    }),
    policy: extendApi(zod_1.z.string().optional(), {
        description: "The permission policy used by the application. Example: fullscreen; accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture...",
        example: "http://example.com/my/policy.html",
    }),
});
//# sourceMappingURL=ApplicationDefinitionInterface.js.map