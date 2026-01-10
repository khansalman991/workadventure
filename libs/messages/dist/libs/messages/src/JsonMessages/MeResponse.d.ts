import { z } from "zod";
export declare const MeSuccessResponse: z.ZodObject<{
    status: z.ZodLiteral<"ok">;
    authToken: z.ZodString;
    userUuid: z.ZodString;
    email: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    username: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    locale: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    visitCardUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    isCharacterTexturesValid: z.ZodBoolean;
    isCompanionTextureValid: z.ZodBoolean;
    matrixUserId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    matrixServerUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    userUuid: string;
    status: "ok";
    authToken: string;
    isCharacterTexturesValid: boolean;
    isCompanionTextureValid: boolean;
    email?: string | null | undefined;
    visitCardUrl?: string | null | undefined;
    username?: string | null | undefined;
    locale?: string | null | undefined;
    matrixUserId?: string | null | undefined;
    matrixServerUrl?: string | null | undefined;
}, {
    userUuid: string;
    status: "ok";
    authToken: string;
    isCharacterTexturesValid: boolean;
    isCompanionTextureValid: boolean;
    email?: string | null | undefined;
    visitCardUrl?: string | null | undefined;
    username?: string | null | undefined;
    locale?: string | null | undefined;
    matrixUserId?: string | null | undefined;
    matrixServerUrl?: string | null | undefined;
}>;
export type MeSuccessResponse = z.infer<typeof MeSuccessResponse>;
export declare const MeResponse: z.ZodUnion<[z.ZodObject<{
    status: z.ZodLiteral<"ok">;
    authToken: z.ZodString;
    userUuid: z.ZodString;
    email: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    username: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    locale: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    visitCardUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    isCharacterTexturesValid: z.ZodBoolean;
    isCompanionTextureValid: z.ZodBoolean;
    matrixUserId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    matrixServerUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    userUuid: string;
    status: "ok";
    authToken: string;
    isCharacterTexturesValid: boolean;
    isCompanionTextureValid: boolean;
    email?: string | null | undefined;
    visitCardUrl?: string | null | undefined;
    username?: string | null | undefined;
    locale?: string | null | undefined;
    matrixUserId?: string | null | undefined;
    matrixServerUrl?: string | null | undefined;
}, {
    userUuid: string;
    status: "ok";
    authToken: string;
    isCharacterTexturesValid: boolean;
    isCompanionTextureValid: boolean;
    email?: string | null | undefined;
    visitCardUrl?: string | null | undefined;
    username?: string | null | undefined;
    locale?: string | null | undefined;
    matrixUserId?: string | null | undefined;
    matrixServerUrl?: string | null | undefined;
}>, z.ZodDiscriminatedUnion<"type", [z.ZodObject<{
    status: z.ZodLiteral<"error">;
    type: z.ZodLiteral<"error">;
    code: z.ZodString;
    title: z.ZodString;
    subtitle: z.ZodString;
    details: z.ZodString;
    image: z.ZodOptional<z.ZodString>;
    imageLogo: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    code: string;
    type: "error";
    status: "error";
    title: string;
    subtitle: string;
    details: string;
    image?: string | undefined;
    imageLogo?: string | undefined;
}, {
    code: string;
    type: "error";
    status: "error";
    title: string;
    subtitle: string;
    details: string;
    image?: string | undefined;
    imageLogo?: string | undefined;
}>, z.ZodObject<{
    status: z.ZodLiteral<"error">;
    type: z.ZodLiteral<"retry">;
    code: z.ZodString;
    title: z.ZodString;
    subtitle: z.ZodString;
    details: z.ZodString;
    image: z.ZodOptional<z.ZodString>;
    imageLogo: z.ZodOptional<z.ZodString>;
    buttonTitle: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    timeToRetry: z.ZodNumber;
    canRetryManual: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    code: string;
    type: "retry";
    status: "error";
    title: string;
    subtitle: string;
    details: string;
    timeToRetry: number;
    canRetryManual: boolean;
    image?: string | undefined;
    imageLogo?: string | undefined;
    buttonTitle?: string | null | undefined;
}, {
    code: string;
    type: "retry";
    status: "error";
    title: string;
    subtitle: string;
    details: string;
    timeToRetry: number;
    canRetryManual: boolean;
    image?: string | undefined;
    imageLogo?: string | undefined;
    buttonTitle?: string | null | undefined;
}>, z.ZodObject<{
    status: z.ZodLiteral<"error">;
    type: z.ZodLiteral<"redirect">;
    urlToRedirect: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "redirect";
    status: "error";
    urlToRedirect: string;
}, {
    type: "redirect";
    status: "error";
    urlToRedirect: string;
}>, z.ZodObject<{
    status: z.ZodLiteral<"error">;
    type: z.ZodLiteral<"unauthorized">;
    code: z.ZodString;
    title: z.ZodString;
    subtitle: z.ZodString;
    details: z.ZodString;
    image: z.ZodOptional<z.ZodString>;
    imageLogo: z.ZodOptional<z.ZodString>;
    buttonTitle: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    code: string;
    type: "unauthorized";
    status: "error";
    title: string;
    subtitle: string;
    details: string;
    image?: string | undefined;
    imageLogo?: string | undefined;
    buttonTitle?: string | null | undefined;
}, {
    code: string;
    type: "unauthorized";
    status: "error";
    title: string;
    subtitle: string;
    details: string;
    image?: string | undefined;
    imageLogo?: string | undefined;
    buttonTitle?: string | null | undefined;
}>]>]>;
export type MeResponse = z.infer<typeof MeResponse>;
