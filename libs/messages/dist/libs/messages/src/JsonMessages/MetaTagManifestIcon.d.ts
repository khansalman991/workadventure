import { z } from "zod";
export declare const isMetaTagManifestIcon: z.ZodObject<{
    sizes: z.ZodString;
    src: z.ZodString;
    type: z.ZodOptional<z.ZodString>;
    purpose: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    sizes: string;
    src: string;
    type?: string | undefined;
    purpose?: string | undefined;
}, {
    sizes: string;
    src: string;
    type?: string | undefined;
    purpose?: string | undefined;
}>;
export type MetaTagManifestIcon = z.infer<typeof isMetaTagManifestIcon>;
