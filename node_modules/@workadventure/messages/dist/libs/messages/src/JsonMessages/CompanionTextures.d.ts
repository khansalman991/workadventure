import { z } from "zod";
export declare const CompanionBehavior: z.ZodUnion<[z.ZodLiteral<"cat">, z.ZodLiteral<"dog">, z.ZodLiteral<"red_panda">]>;
export type CompanionBehavior = z.infer<typeof CompanionBehavior>;
export declare const CompanionTexture: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    url: z.ZodString;
    behavior: z.ZodOptional<z.ZodUnion<[z.ZodLiteral<"cat">, z.ZodLiteral<"dog">, z.ZodLiteral<"red_panda">]>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    id: string;
    url: string;
    behavior?: "cat" | "dog" | "red_panda" | undefined;
}, {
    name: string;
    id: string;
    url: string;
    behavior?: "cat" | "dog" | "red_panda" | undefined;
}>;
export type CompanionTexture = z.infer<typeof CompanionTexture>;
export declare const CompanionTextureCollection: z.ZodObject<{
    name: z.ZodString;
    textures: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        url: z.ZodString;
        behavior: z.ZodOptional<z.ZodUnion<[z.ZodLiteral<"cat">, z.ZodLiteral<"dog">, z.ZodLiteral<"red_panda">]>>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        id: string;
        url: string;
        behavior?: "cat" | "dog" | "red_panda" | undefined;
    }, {
        name: string;
        id: string;
        url: string;
        behavior?: "cat" | "dog" | "red_panda" | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    name: string;
    textures: {
        name: string;
        id: string;
        url: string;
        behavior?: "cat" | "dog" | "red_panda" | undefined;
    }[];
}, {
    name: string;
    textures: {
        name: string;
        id: string;
        url: string;
        behavior?: "cat" | "dog" | "red_panda" | undefined;
    }[];
}>;
export type CompanionTextureCollection = z.infer<typeof CompanionTextureCollection>;
export declare const CompanionDetail: z.ZodObject<{
    id: z.ZodString;
    url: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    url: string;
}, {
    id: string;
    url: string;
}>;
export type CompanionDetail = z.infer<typeof CompanionDetail>;
