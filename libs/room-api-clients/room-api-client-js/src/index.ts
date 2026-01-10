// @ts-ignore
export * from "./compiled_proto/room-api";
import { ChannelCredentials, createChannel, createClient, Metadata } from "nice-grpc";

/**
 * FIXED: Importing the whole module to access exports dynamically.
 * This bypasses the TS2305 error caused by missing .ts source files.
 */
import * as RoomApiModule from "./compiled_proto/room-api";

/**
 * Creates a Room API Client.
 * We return 'any' here because your folder only has .d.ts files, which 
 * leads to incomplete type mapping for the client methods.
 */
export const createRoomApiClient = (apiKey: string, host = "192.168.0.109", port = 8081): any => {
    const isSecure = port === 443 || host.startsWith("https://");
    
    const channel = createChannel(
        `${host}:${port}`, 
        isSecure ? ChannelCredentials.createSsl() : ChannelCredentials.createInsecure()
    );

    /**
     * FIXED: Checking both possible names for the service definition.
     * Use 'as any' to allow the compiler to look into the .js file.
     */
    const Definition = (RoomApiModule as any).RoomManagerDefinition || 
                       (RoomApiModule as any).RoomApiDefinition;

    if (!Definition) {
        throw new Error("RoomManagerDefinition/RoomApiDefinition not found in compiled_proto");
    }

    const client = createClient(
        Definition,
        channel,
        {
            "*": {
                metadata: new Metadata({ "X-API-Key": apiKey }),
            }
        }
    );

    return client;
};