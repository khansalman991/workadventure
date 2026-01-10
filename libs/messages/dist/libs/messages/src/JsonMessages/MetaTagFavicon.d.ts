import { z } from "zod";
export declare const isMetaTagFavicon: z.ZodObject<{
    rel: z.ZodString;
    sizes: z.ZodString;
    src: z.ZodString;
}, "strip", z.ZodTypeAny, {
    rel: string;
    sizes: string;
    src: string;
}, {
    rel: string;
    sizes: string;
    src: string;
}>;
export type MetaTagFavicon = z.infer<typeof isMetaTagFavicon>;
