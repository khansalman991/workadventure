import { z } from "zod";
export declare const isErrorApiErrorData: z.ZodObject<{
    status: z.ZodLiteral<"error">;
    type: z.ZodLiteral<"error">;
    code: z.ZodString;
    title: z.ZodString;
    subtitle: z.ZodString;
    details: z.ZodString;
    image: z.ZodOptional<z.ZodString>;
    imageLogo: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    code: string;
    type: "error";
    status: "error";
    title: string;
    subtitle: string;
    details: string;
    image?: string | undefined;
    imageLogo?: string | undefined;
}, {
    code: string;
    type: "error";
    status: "error";
    title: string;
    subtitle: string;
    details: string;
    image?: string | undefined;
    imageLogo?: string | undefined;
}>;
export declare const isErrorApiRetryData: z.ZodObject<{
    status: z.ZodLiteral<"error">;
    type: z.ZodLiteral<"retry">;
    code: z.ZodString;
    title: z.ZodString;
    subtitle: z.ZodString;
    details: z.ZodString;
    image: z.ZodOptional<z.ZodString>;
    imageLogo: z.ZodOptional<z.ZodString>;
    buttonTitle: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    timeToRetry: z.ZodNumber;
    canRetryManual: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    code: string;
    type: "retry";
    status: "error";
    title: string;
    subtitle: string;
    details: string;
    timeToRetry: number;
    canRetryManual: boolean;
    image?: string | undefined;
    imageLogo?: string | undefined;
    buttonTitle?: string | null | undefined;
}, {
    code: string;
    type: "retry";
    status: "error";
    title: string;
    subtitle: string;
    details: string;
    timeToRetry: number;
    canRetryManual: boolean;
    image?: string | undefined;
    imageLogo?: string | undefined;
    buttonTitle?: string | null | undefined;
}>;
export declare const isErrorApiRedirectData: z.ZodObject<{
    status: z.ZodLiteral<"error">;
    type: z.ZodLiteral<"redirect">;
    urlToRedirect: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "redirect";
    status: "error";
    urlToRedirect: string;
}, {
    type: "redirect";
    status: "error";
    urlToRedirect: string;
}>;
export declare const isErrorApiUnauthorizedData: z.ZodObject<{
    status: z.ZodLiteral<"error">;
    type: z.ZodLiteral<"unauthorized">;
    code: z.ZodString;
    title: z.ZodString;
    subtitle: z.ZodString;
    details: z.ZodString;
    image: z.ZodOptional<z.ZodString>;
    imageLogo: z.ZodOptional<z.ZodString>;
    buttonTitle: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    code: string;
    type: "unauthorized";
    status: "error";
    title: string;
    subtitle: string;
    details: string;
    image?: string | undefined;
    imageLogo?: string | undefined;
    buttonTitle?: string | null | undefined;
}, {
    code: string;
    type: "unauthorized";
    status: "error";
    title: string;
    subtitle: string;
    details: string;
    image?: string | undefined;
    imageLogo?: string | undefined;
    buttonTitle?: string | null | undefined;
}>;
export declare const ErrorApiData: z.ZodDiscriminatedUnion<"type", [z.ZodObject<{
    status: z.ZodLiteral<"error">;
    type: z.ZodLiteral<"error">;
    code: z.ZodString;
    title: z.ZodString;
    subtitle: z.ZodString;
    details: z.ZodString;
    image: z.ZodOptional<z.ZodString>;
    imageLogo: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    code: string;
    type: "error";
    status: "error";
    title: string;
    subtitle: string;
    details: string;
    image?: string | undefined;
    imageLogo?: string | undefined;
}, {
    code: string;
    type: "error";
    status: "error";
    title: string;
    subtitle: string;
    details: string;
    image?: string | undefined;
    imageLogo?: string | undefined;
}>, z.ZodObject<{
    status: z.ZodLiteral<"error">;
    type: z.ZodLiteral<"retry">;
    code: z.ZodString;
    title: z.ZodString;
    subtitle: z.ZodString;
    details: z.ZodString;
    image: z.ZodOptional<z.ZodString>;
    imageLogo: z.ZodOptional<z.ZodString>;
    buttonTitle: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    timeToRetry: z.ZodNumber;
    canRetryManual: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    code: string;
    type: "retry";
    status: "error";
    title: string;
    subtitle: string;
    details: string;
    timeToRetry: number;
    canRetryManual: boolean;
    image?: string | undefined;
    imageLogo?: string | undefined;
    buttonTitle?: string | null | undefined;
}, {
    code: string;
    type: "retry";
    status: "error";
    title: string;
    subtitle: string;
    details: string;
    timeToRetry: number;
    canRetryManual: boolean;
    image?: string | undefined;
    imageLogo?: string | undefined;
    buttonTitle?: string | null | undefined;
}>, z.ZodObject<{
    status: z.ZodLiteral<"error">;
    type: z.ZodLiteral<"redirect">;
    urlToRedirect: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "redirect";
    status: "error";
    urlToRedirect: string;
}, {
    type: "redirect";
    status: "error";
    urlToRedirect: string;
}>, z.ZodObject<{
    status: z.ZodLiteral<"error">;
    type: z.ZodLiteral<"unauthorized">;
    code: z.ZodString;
    title: z.ZodString;
    subtitle: z.ZodString;
    details: z.ZodString;
    image: z.ZodOptional<z.ZodString>;
    imageLogo: z.ZodOptional<z.ZodString>;
    buttonTitle: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    code: string;
    type: "unauthorized";
    status: "error";
    title: string;
    subtitle: string;
    details: string;
    image?: string | undefined;
    imageLogo?: string | undefined;
    buttonTitle?: string | null | undefined;
}, {
    code: string;
    type: "unauthorized";
    status: "error";
    title: string;
    subtitle: string;
    details: string;
    image?: string | undefined;
    imageLogo?: string | undefined;
    buttonTitle?: string | null | undefined;
}>]>;
export type ErrorApiErrorData = z.infer<typeof isErrorApiErrorData>;
export type ErrorApiRetryData = z.infer<typeof isErrorApiRetryData>;
export type ErrorApiRedirectData = z.infer<typeof isErrorApiRedirectData>;
export type ErrorApiUnauthorizedData = z.infer<typeof isErrorApiUnauthorizedData>;
export type ErrorApiData = z.infer<typeof ErrorApiData>;
