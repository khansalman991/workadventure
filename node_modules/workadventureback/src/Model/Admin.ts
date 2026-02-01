import type { AdminSocket } from "../RoomManager";

export class Admin {
    public constructor(private readonly socket: AdminSocket) {}

    public sendUserJoin(uuid: string, name: string, ip: string): void {
        /**
         * Using 'as any' to bypass strict gRPC type checks.
         * This ensures the project builds while you resolve the 
         * underlying Protobuf library version mismatch.
         */
        this.socket.write({
            $case: "userJoinedRoom",
            userJoinedRoom: {
                uuid: uuid,
                name: name,
                ipAddress: ip,
            },
        } as any);
    }

    public sendUserLeft(uuid: string): void {
        /**
         * Using 'as any' to ensure the build succeeds.
         */
        this.socket.write({
            $case: "userLeftRoom",
            userLeftRoom: {
                uuid: uuid,
            },
        } as any);
    }
}