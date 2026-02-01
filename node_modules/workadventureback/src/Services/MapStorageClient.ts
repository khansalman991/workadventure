import { MapStorageClientImpl } from "@workadventure/messages/src/ts-proto-generated/services";
import * as grpc from "@grpc/grpc-js";
import { MAP_STORAGE_URL, GRPC_MAX_MESSAGE_SIZE } from "../Enum/EnvironmentVariable";

// Define the internal gRPC-js client type
let nativeClient: grpc.Client;
let mapStorageClient: MapStorageClientImpl;

/**
 * Initializes and returns a singleton instance of the MapStorage client.
 */
export function getMapStorageClient(): MapStorageClientImpl {
    if (!mapStorageClient) {
        if (!MAP_STORAGE_URL) {
            throw new Error("MAP_STORAGE_URL is not configured in Environment Variables.");
        }

        // 1. Create the native gRPC-js client
        nativeClient = new grpc.Client(
            MAP_STORAGE_URL,
            grpc.credentials.createInsecure(),
            {
                "grpc.max_receive_message_length": GRPC_MAX_MESSAGE_SIZE,
                "grpc.max_send_message_length": GRPC_MAX_MESSAGE_SIZE,
            }
        );

        // 2. Wrap the native client into an RPC implementation that ts-proto understands
        const rpc = {
            request(service: string, method: string, data: Uint8Array): Promise<Uint8Array> {
                return new Promise((resolve, reject) => {
                    nativeClient.makeUnaryRequest(
                        `/${service}/${method}`,
                        (arg: any) => arg,
                        (arg: any) => arg,
                        data,
                        (err, response) => {
                            if (err) reject(err);
                            else resolve(response);
                        }
                    );
                });
            },
            clientStreamingRequest: (service: string, method: string, data: any) => { throw new Error("Not implemented"); },
            serverStreamingRequest: (service: string, method: string, data: any) => { throw new Error("Not implemented"); },
            bidirectionalStreamingRequest: (service: string, method: string, data: any) => { throw new Error("Not implemented"); },
        };

        // 3. Instantiate the generated implementation with 1 argument (the RPC bridge)
        mapStorageClient = new MapStorageClientImpl(rpc);
    }
    return mapStorageClient;
}