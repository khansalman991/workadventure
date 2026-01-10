"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
module.exports = { 
    protobufPackage: "google.protobuf",
    FieldMask: { fromJSON(obj) { return { paths: obj?.paths || [] }; }, toJSON(msg) { return msg.paths.join(","); } }
};