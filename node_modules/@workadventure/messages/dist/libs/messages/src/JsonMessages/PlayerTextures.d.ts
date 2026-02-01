import { z } from "zod";
export declare const wokaTexture: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    url: z.ZodString;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    tintable: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    name: string;
    id: string;
    url: string;
    tags?: string[] | undefined;
    tintable?: boolean | undefined;
}, {
    name: string;
    id: string;
    url: string;
    tags?: string[] | undefined;
    tintable?: boolean | undefined;
}>;
export type WokaTexture = z.infer<typeof wokaTexture>;
declare const wokaTextureCollection: z.ZodObject<{
    name: z.ZodString;
    textures: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        url: z.ZodString;
        tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        tintable: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        id: string;
        url: string;
        tags?: string[] | undefined;
        tintable?: boolean | undefined;
    }, {
        name: string;
        id: string;
        url: string;
        tags?: string[] | undefined;
        tintable?: boolean | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    name: string;
    textures: {
        name: string;
        id: string;
        url: string;
        tags?: string[] | undefined;
        tintable?: boolean | undefined;
    }[];
}, {
    name: string;
    textures: {
        name: string;
        id: string;
        url: string;
        tags?: string[] | undefined;
        tintable?: boolean | undefined;
    }[];
}>;
export type WokaTextureCollection = z.infer<typeof wokaTextureCollection>;
declare const wokaPartType: z.ZodObject<{
    collections: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        textures: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            url: z.ZodString;
            tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            tintable: z.ZodOptional<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            id: string;
            url: string;
            tags?: string[] | undefined;
            tintable?: boolean | undefined;
        }, {
            name: string;
            id: string;
            url: string;
            tags?: string[] | undefined;
            tintable?: boolean | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        name: string;
        textures: {
            name: string;
            id: string;
            url: string;
            tags?: string[] | undefined;
            tintable?: boolean | undefined;
        }[];
    }, {
        name: string;
        textures: {
            name: string;
            id: string;
            url: string;
            tags?: string[] | undefined;
            tintable?: boolean | undefined;
        }[];
    }>, "many">;
    required: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    collections: {
        name: string;
        textures: {
            name: string;
            id: string;
            url: string;
            tags?: string[] | undefined;
            tintable?: boolean | undefined;
        }[];
    }[];
    required?: boolean | undefined;
}, {
    collections: {
        name: string;
        textures: {
            name: string;
            id: string;
            url: string;
            tags?: string[] | undefined;
            tintable?: boolean | undefined;
        }[];
    }[];
    required?: boolean | undefined;
}>;
export type WokaPartType = z.infer<typeof wokaPartType>;
export declare const wokaList: z.ZodRecord<z.ZodString, z.ZodObject<{
    collections: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        textures: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            url: z.ZodString;
            tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            tintable: z.ZodOptional<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            id: string;
            url: string;
            tags?: string[] | undefined;
            tintable?: boolean | undefined;
        }, {
            name: string;
            id: string;
            url: string;
            tags?: string[] | undefined;
            tintable?: boolean | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        name: string;
        textures: {
            name: string;
            id: string;
            url: string;
            tags?: string[] | undefined;
            tintable?: boolean | undefined;
        }[];
    }, {
        name: string;
        textures: {
            name: string;
            id: string;
            url: string;
            tags?: string[] | undefined;
            tintable?: boolean | undefined;
        }[];
    }>, "many">;
    required: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    collections: {
        name: string;
        textures: {
            name: string;
            id: string;
            url: string;
            tags?: string[] | undefined;
            tintable?: boolean | undefined;
        }[];
    }[];
    required?: boolean | undefined;
}, {
    collections: {
        name: string;
        textures: {
            name: string;
            id: string;
            url: string;
            tags?: string[] | undefined;
            tintable?: boolean | undefined;
        }[];
    }[];
    required?: boolean | undefined;
}>>;
export type WokaList = z.infer<typeof wokaList>;
export declare const wokaPartNames: string[];
export declare const WokaDetail: z.ZodObject<{
    id: z.ZodString;
    url: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    url: string;
}, {
    id: string;
    url: string;
}>;
export type WokaDetail = z.infer<typeof WokaDetail>;
export {};
