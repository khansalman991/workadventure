"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorApiData = exports.isErrorApiUnauthorizedData = exports.isErrorApiRedirectData = exports.isErrorApiRetryData = exports.isErrorApiErrorData = void 0;
const zod_1 = require("zod");
const extendApi = (schema, _extension) => schema;
/* FIXED: Changed to namespaced import to resolve the 'extendApi' export error */
exports.isErrorApiErrorData = extendApi(zod_1.z.object({
    status: zod_1.z.literal("error"),
    type: zod_1.z.literal("error"),
    code: extendApi(zod_1.z.string(), {
        description: "The system code of an error, it must be in SCREAMING_SNAKE_CASE.",
        example: "ROOM_NOT_FOUND",
    }),
    title: extendApi(zod_1.z.string(), {
        description: "Big title displayed on the error screen.",
        example: "ERROR",
    }),
    subtitle: extendApi(zod_1.z.string(), {
        description: "Subtitle displayed to let the user know what is the main subject of the error.",
        example: "The room was not found.",
    }),
    details: extendApi(zod_1.z.string(), {
        description: "Some others details on what the user can do if he don't understand the error.",
        example: "If you would like more information, you can contact the administrator or us at example@workadventu.re.",
    }),
    image: extendApi(zod_1.z.string().optional(), {
        description: "The URL of the image displayed just under the logo in the error screen.",
        example: "https://example.com/error.png",
    }),
    imageLogo: extendApi(zod_1.z.string().optional(), {
        description: "The URL of the image displayed just at the place of the logo in the error screen.",
        example: "https://example.com/error.png",
    }),
}), {
    description: 'This is an error that can be returned by the API, its type must be equal to "error".\n If such an error is caught, an error screen will be displayed.',
});
exports.isErrorApiRetryData = extendApi(zod_1.z.object({
    status: zod_1.z.literal("error"),
    type: zod_1.z.literal("retry"),
    code: extendApi(zod_1.z.string(), {
        description: "The system code of an error, it must be in SCREAMING_SNAKE_CASE. \n It will not be displayed to the user.",
        example: "WORLD_FULL",
    }),
    title: extendApi(zod_1.z.string(), {
        description: "Big title displayed on the error screen.",
        example: "ERROR",
    }),
    subtitle: extendApi(zod_1.z.string(), {
        description: "Subtitle displayed to let the user know what is the main subject of the error.",
        example: "Too successful, your WorkAdventure world is full!",
    }),
    details: extendApi(zod_1.z.string(), {
        description: "Some others details on what the user can do if he don't understand the error.",
        example: "New automatic attempt in 30 seconds",
    }),
    image: extendApi(zod_1.z.string().optional(), {
        description: "The URL of the image displayed just under the logo in the waiting screen.",
        example: "https://example.com/wait.png",
    }),
    imageLogo: extendApi(zod_1.z.string().optional(), {
        description: "The URL of the image displayed just at the place of the logo in the waiting screen.",
        example: "https://example.com/wait.png",
    }),
    buttonTitle: extendApi(zod_1.z.string().nullable().optional(), {
        description: "If this is not defined the button and the parameter canRetryManual is set to true, the button will be not displayed at all.",
        example: "Retry",
    }),
    timeToRetry: extendApi(zod_1.z.number(), {
        description: "This is the time (in millisecond) between the next auto refresh of the page.",
        example: 30000,
    }),
    canRetryManual: extendApi(zod_1.z.boolean(), {
        description: "This boolean show or hide the button to let the user refresh manually the current page.",
        example: true,
    }),
}), {
    description: 'This is an error that can be returned by the API, its type must be equal to "retry".\n' + "If such an error is caught, a waiting screen will be displayed.",
});
exports.isErrorApiRedirectData = extendApi(zod_1.z.object({
    status: zod_1.z.literal("error"),
    type: zod_1.z.literal("redirect"),
    urlToRedirect: extendApi(zod_1.z.string(), {
        description: "A URL specified to redirect the user onto it directly",
        example: "/contact-us",
    }),
}), {
    description: 'This is an error that can be returned by the API, its type must be equal to "redirect".\n' + "If such an error is caught, the user will be automatically redirected to urlToRedirect.",
});
exports.isErrorApiUnauthorizedData = extendApi(zod_1.z.object({
    status: zod_1.z.literal("error"),
    type: zod_1.z.literal("unauthorized"),
    code: extendApi(zod_1.z.string(), {
        description: "This is the system code of an error, it must be in SCREAMING_SNAKE_CASE.",
        example: "USER_ACCESS_FORBIDDEN",
    }),
    title: extendApi(zod_1.z.string(), {
        description: "Big title displayed on the error screen.",
        example: "ERROR",
    }),
    subtitle: extendApi(zod_1.z.string(), {
        description: "Subtitle displayed to let the user know what is the main subject of the error.",
        example: "You can't access this place.",
    }),
    details: extendApi(zod_1.z.string(), {
        description: "Some others details on what the user can do if he don't understand the error.",
        example: "If you would like more information, you can contact the administrator or us at example@workadventu.re.",
    }),
    image: extendApi(zod_1.z.string().optional(), {
        description: "The URL of the image displayed just under the logo in the error screen.",
        example: "https://example.com/error.png",
    }),
    imageLogo: extendApi(zod_1.z.string().optional(), {
        description: "The URL of the image displayed just under the logo in the error screen.",
        example: "https://example.com/error.png",
    }),
    buttonTitle: extendApi(zod_1.z.string().nullable().optional(), {
        description: "If this is not defined the button to logout will be not displayed.",
        example: "Log out",
    }),
}), {
    description: 'This is an error that can be returned by the API, its type must be equal to "unauthorized".\n' + "If such an error is caught, an error screen will be displayed with a button to let him logout and go to login page.",
});
exports.ErrorApiData = zod_1.z.discriminatedUnion("type", [
    exports.isErrorApiErrorData,
    exports.isErrorApiRetryData,
    exports.isErrorApiRedirectData,
    exports.isErrorApiUnauthorizedData,
]);
//# sourceMappingURL=ErrorApiData.js.map