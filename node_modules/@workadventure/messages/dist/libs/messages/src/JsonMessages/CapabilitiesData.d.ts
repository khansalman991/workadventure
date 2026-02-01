import { z } from "zod";
export declare const isCapabilities: z.ZodObject<{
    "api/companion/list": z.ZodOptional<z.ZodString>;
    "api/woka/list": z.ZodOptional<z.ZodString>;
    "api/domain/verify": z.ZodOptional<z.ZodString>;
    "api/save-name": z.ZodOptional<z.ZodString>;
    "api/save-textures": z.ZodOptional<z.ZodString>;
    "api/livekit/credentials": z.ZodOptional<z.ZodString>;
    "api/ice-servers": z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    "api/companion/list"?: string | undefined;
    "api/woka/list"?: string | undefined;
    "api/domain/verify"?: string | undefined;
    "api/save-name"?: string | undefined;
    "api/save-textures"?: string | undefined;
    "api/livekit/credentials"?: string | undefined;
    "api/ice-servers"?: string | undefined;
}, {
    "api/companion/list"?: string | undefined;
    "api/woka/list"?: string | undefined;
    "api/domain/verify"?: string | undefined;
    "api/save-name"?: string | undefined;
    "api/save-textures"?: string | undefined;
    "api/livekit/credentials"?: string | undefined;
    "api/ice-servers"?: string | undefined;
}>;
export type Capabilities = z.infer<typeof isCapabilities>;
