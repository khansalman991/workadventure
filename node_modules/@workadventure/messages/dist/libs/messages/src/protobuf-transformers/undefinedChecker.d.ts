/**
 * Protobuf does not allow "required" objects in messages. As a result, all TS interfaces generated from protobuf messages
 * have all fields pointing to objects as potentially undefined. This is a problem for us because we need to add
 * unnecessary checks for undefined fields in our code. Those transformers cast the generated interfaces to interfaces
 * with object fields being required.
 */
type NonUndefined<T> = T extends undefined ? never : T;
export type NonUndefinedFields<T> = {
    [K in keyof T]: NonUndefined<T[K]>;
};
export type RequiredFields<T, K extends keyof T> = Omit<T, K> & NonUndefinedFields<Pick<T, K>>;
export declare function noUndefinedForKeys<T, K extends keyof T>(message: T, fields: K[]): RequiredFields<T, K>;
/**
 * Checks that all fields of the message are not undefined and casts the message to a type where all fields are required.
 */
export declare function noUndefined<T>(message: T): NonUndefinedFields<T>;
export {};
