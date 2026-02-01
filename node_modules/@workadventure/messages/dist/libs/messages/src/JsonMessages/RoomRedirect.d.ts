import { z } from "zod";
export declare const isRoomRedirect: z.ZodObject<{
    redirectUrl: z.ZodString;
}, "strip", z.ZodTypeAny, {
    redirectUrl: string;
}, {
    redirectUrl: string;
}>;
export type RoomRedirect = z.infer<typeof isRoomRedirect>;
