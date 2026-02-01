import { z } from "zod";
export declare const MeRequest: z.ZodObject<{
    token: z.ZodString;
    playUri: z.ZodString;
    "localStorageCharacterTextureIds[]": z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
    localStorageCompanionTextureId: z.ZodOptional<z.ZodString>;
    chatID: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    token: string;
    playUri: string;
    "localStorageCharacterTextureIds[]"?: string | string[] | undefined;
    localStorageCompanionTextureId?: string | undefined;
    chatID?: string | undefined;
}, {
    token: string;
    playUri: string;
    "localStorageCharacterTextureIds[]"?: string | string[] | undefined;
    localStorageCompanionTextureId?: string | undefined;
    chatID?: string | undefined;
}>;
export type MeRequest = z.infer<typeof MeRequest>;
