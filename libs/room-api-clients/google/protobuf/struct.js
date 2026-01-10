"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
module.exports = { 
    protobufPackage: "google.protobuf",
    Struct: { fromJSON(obj) { return { fields: obj || {} }; }, toJSON(msg) { return msg.fields; } },
    Value: { fromJSON(obj) { return { value: obj }; }, toJSON(msg) { return msg.value; } },
    NullValue: { NULL_VALUE: 0 }
};