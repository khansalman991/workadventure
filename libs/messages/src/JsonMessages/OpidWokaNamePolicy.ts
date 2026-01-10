import { z } from "zod";
const extendApi = <T extends z.ZodTypeAny>(schema: T, _extension: unknown): T => schema;
/* FIXED: Changed to namespaced import to resolve the 'extendApi' export error */


export const OpidWokaNamePolicy = extendApi(z.enum(["user_input", "allow_override_opid", "force_opid", ""]), {
    example: "['user_input', 'allow_override_opid', 'force_opid']",
})
    .optional()
    .nullable();

export type OpidWokaNamePolicy = z.infer<typeof OpidWokaNamePolicy>;
