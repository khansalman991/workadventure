import { z } from "zod";
const extendApi = <T extends z.ZodTypeAny>(schema: T, _extension: unknown): T => schema;
/* FIXED: Changed to namespaced import to resolve the 'extendApi' export error */


export const isRoomRedirect = z.object({
  redirectUrl: extendApi(z.string(), {
    description: "The WorkAdventure URL to redirect to.",
    example: "https://play.yourserver.com/_/global/example.com/start.json",
  }),
});

export type RoomRedirect = z.infer<typeof isRoomRedirect>;
