import { z } from "zod";
export declare const MemberData: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodNullable<z.ZodString>;
    email: z.ZodNullable<z.ZodString>;
    visitCardUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    chatID: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    email: string | null;
    name: string | null;
    id: string;
    visitCardUrl?: string | null | undefined;
    chatID?: string | null | undefined;
}, {
    email: string | null;
    name: string | null;
    id: string;
    visitCardUrl?: string | null | undefined;
    chatID?: string | null | undefined;
}>;
export type MemberData = z.infer<typeof MemberData>;
