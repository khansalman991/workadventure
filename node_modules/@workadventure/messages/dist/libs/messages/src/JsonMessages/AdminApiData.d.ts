import { z } from "zod";
export declare const isAdminApiData: z.ZodObject<{
    userUuid: z.ZodString;
    email: z.ZodNullable<z.ZodString>;
    roomUrl: z.ZodString;
    mapUrlStart: z.ZodString;
    messages: z.ZodOptional<z.ZodArray<z.ZodUnknown, "many">>;
}, "strip", z.ZodTypeAny, {
    userUuid: string;
    email: string | null;
    roomUrl: string;
    mapUrlStart: string;
    messages?: unknown[] | undefined;
}, {
    userUuid: string;
    email: string | null;
    roomUrl: string;
    mapUrlStart: string;
    messages?: unknown[] | undefined;
}>;
export type AdminApiData = z.infer<typeof isAdminApiData>;
export declare const isUserRoomToken: z.ZodObject<{
    messages: z.ZodOptional<z.ZodArray<z.ZodUnknown, "many">>;
    alg: z.ZodString;
    iss: z.ZodString;
    aud: z.ZodString;
    iat: z.ZodNumber;
    uid: z.ZodString;
    user: z.ZodNullable<z.ZodString>;
    room: z.ZodString;
    exp: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    alg: string;
    iss: string;
    aud: string;
    iat: number;
    uid: string;
    user: string | null;
    room: string;
    exp: number;
    messages?: unknown[] | undefined;
}, {
    alg: string;
    iss: string;
    aud: string;
    iat: number;
    uid: string;
    user: string | null;
    room: string;
    exp: number;
    messages?: unknown[] | undefined;
}>;
export declare const isOauthRefreshToken: z.ZodObject<{
    message: z.ZodString;
    token: z.ZodString;
}, "strip", z.ZodTypeAny, {
    message: string;
    token: string;
}, {
    message: string;
    token: string;
}>;
export type OauthRefreshToken = z.infer<typeof isOauthRefreshToken>;
