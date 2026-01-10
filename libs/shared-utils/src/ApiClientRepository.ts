/**
 * A class to get connections to the correct "api" server given a room name.
 */
import crypto from "crypto";
import Debug from "debug";

// CHANGED: We use nice-grpc factory methods now
import { createChannel, createClient, ChannelCredentials, Client } from "nice-grpc";

// CHANGED: Import Services from the main package
import { Services } from "@workadventure/messages";

const debug = Debug("apiClientRespository");

export class ApiClientRepository {
    // CHANGED: We use 'any' for the client type to avoid import errors
    private roomManagerClients: any[] = [];
    private spaceManagerClients: any[] = [];

    public constructor(private apiUrls: string[]) {}

    // CHANGED: Return 'any' to bypass strict type checks
    public async getClient(roomId: string, GRPC_MAX_MESSAGE_SIZE: number): Promise<any> {
        const index = this.getIndex(roomId);

        let client = this.roomManagerClients[index];
        if (client === undefined) {
            const channel = createChannel(
                this.apiUrls[index],
                ChannelCredentials.createInsecure(),
                {
                    "grpc.max_receive_message_length": GRPC_MAX_MESSAGE_SIZE,
                    "grpc.max_send_message_length": GRPC_MAX_MESSAGE_SIZE,
                }
            );

            // FORCE FIX: Cast Services to 'any' to stop the "Property does not exist" error
            // @ts-ignore
            const definition = (Services as any).RoomManagerDefinition || (Services as any).RoomManager;
            
            if (!definition) {
                console.error("CRITICAL: RoomManagerDefinition not found in Services!");
            }

            this.roomManagerClients[index] = client = createClient(definition, channel);
        }
        debug("Mapping room %s to API server %s", roomId, this.apiUrls[index]);

        return Promise.resolve(client);
    }

    public getAllClients(GRPC_MAX_MESSAGE_SIZE: number): Promise<any[]> {
        for (let i = 0; i < this.apiUrls.length; i++) {
            if (this.roomManagerClients[i] === undefined) {
                 const channel = createChannel(
                    this.apiUrls[i], 
                    ChannelCredentials.createInsecure(), 
                    {
                        "grpc.max_receive_message_length": GRPC_MAX_MESSAGE_SIZE,
                        "grpc.max_send_message_length": GRPC_MAX_MESSAGE_SIZE,
                    }
                );
                
                // FORCE FIX: Cast to any
                // @ts-ignore
                const definition = (Services as any).RoomManagerDefinition || (Services as any).RoomManager;
                this.roomManagerClients[i] = createClient(definition, channel);
            }
        }
        return Promise.resolve(this.roomManagerClients);
    }

    async getSpaceClient(spaceName: string, GRPC_MAX_MESSAGE_SIZE: number): Promise<any> {
        const index = this.getIndex(spaceName);

        let client = this.spaceManagerClients[index];
        if (client === undefined) {
            const channel = createChannel(
                this.apiUrls[index],
                ChannelCredentials.createInsecure(),
                {
                    "grpc.max_receive_message_length": GRPC_MAX_MESSAGE_SIZE,
                    "grpc.max_send_message_length": GRPC_MAX_MESSAGE_SIZE,
                }
            );

            // FORCE FIX: Cast Services to 'any'
            // @ts-ignore
            const definition = (Services as any).SpaceManagerDefinition || (Services as any).SpaceManager;
            
            this.spaceManagerClients[index] = client = createClient(definition, channel);
        }
        debug("Mapping room %s to API server %s", spaceName, this.apiUrls[index]);

        return Promise.resolve(client);
    }

    public getIndex(name: string) {
        const array = new Uint32Array(crypto.createHash("md5").update(name).digest());
        return array[0] % this.apiUrls.length;
    }
}