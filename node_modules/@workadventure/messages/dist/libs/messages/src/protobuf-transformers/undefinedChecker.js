"use strict";
/**
 * Protobuf does not allow "required" objects in messages. As a result, all TS interfaces generated from protobuf messages
 * have all fields pointing to objects as potentially undefined. This is a problem for us because we need to add
 * unnecessary checks for undefined fields in our code. Those transformers cast the generated interfaces to interfaces
 * with object fields being required.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.noUndefinedForKeys = noUndefinedForKeys;
exports.noUndefined = noUndefined;
function noUndefinedForKeys(message, fields) {
    for (const field of fields) {
        if (message[field] === undefined) {
            throw new Error(`${String(field)} is required`);
        }
    }
    return message;
}
/**
 * Checks that all fields of the message are not undefined and casts the message to a type where all fields are required.
 */
function noUndefined(message) {
    for (const key in message) {
        if (message[key] === undefined) {
            throw new Error(`${key} is required`);
        }
    }
    return message;
}
//# sourceMappingURL=undefinedChecker.js.map