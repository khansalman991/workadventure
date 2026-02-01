import { z } from "zod";
export declare const OpidWokaNamePolicy: z.ZodNullable<z.ZodOptional<z.ZodEnum<["user_input", "allow_override_opid", "force_opid", ""]>>>;
export type OpidWokaNamePolicy = z.infer<typeof OpidWokaNamePolicy>;
