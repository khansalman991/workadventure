import { z } from "zod";
export declare const isRegisterData: z.ZodObject<{
    roomUrl: z.ZodString;
    email: z.ZodNullable<z.ZodString>;
    organizationMemberToken: z.ZodNullable<z.ZodString>;
    mapUrlStart: z.ZodString;
    userUuid: z.ZodString;
    authToken: z.ZodString;
    messages: z.ZodOptional<z.ZodArray<z.ZodUnknown, "many">>;
}, "strip", z.ZodTypeAny, {
    userUuid: string;
    email: string | null;
    roomUrl: string;
    mapUrlStart: string;
    authToken: string;
    organizationMemberToken: string | null;
    messages?: unknown[] | undefined;
}, {
    userUuid: string;
    email: string | null;
    roomUrl: string;
    mapUrlStart: string;
    authToken: string;
    organizationMemberToken: string | null;
    messages?: unknown[] | undefined;
}>;
export type RegisterData = z.infer<typeof isRegisterData>;
