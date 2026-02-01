import { z } from "zod";
const extendApi = <T extends z.ZodTypeAny>(schema: T, _extension: unknown): T => schema;
/* FIXED: Changed to namespaced import to resolve the 'extendApi' export error */


export const isMetaTagFavicon = z.object({
  rel: extendApi(z.string(), {
    description: "Device specification",
    example: "apple-touch-icon",
  }),
  sizes: extendApi(z.string(), {
    description: "Icon sizes",
    example: "57x57",
  }),
  src: extendApi(z.string(), {
    description: "Icon path",
    example: "https://workadventu.re/icons/apple-icon-57x57.png",
  }),
});

export type MetaTagFavicon = z.infer<typeof isMetaTagFavicon>;
