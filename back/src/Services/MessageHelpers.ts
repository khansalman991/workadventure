import type {
    BatchToPusherRoomMessage,
    ServerToAdminClientMessage,
    ServerToClientMessage,
} from "@workadventure/messages";
import type { UserSocket } from "../Model/User";
import type { AdminSocket, RoomSocket } from "../RoomManager";

function getMessageFromError(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    } else if (typeof error === "string") {
        return error;
    } else {
        return "Unknown error";
    }
}

export function emitError(Client: UserSocket, error: unknown): void {
    const message = getMessageFromError(error);

    /**
     * FIXED: Flattened ServerToClientMessage. 
     * The 'message' property is removed, and $case is moved to the top level.
     */
    const serverToClientMessage: ServerToClientMessage = {
        $case: "errorMessage",
        errorMessage: {
            message: message,
        },
    } as any;

    Client.write(serverToClientMessage);
    console.warn(message);
}

export function emitErrorOnAdminSocket(Client: AdminSocket, error: unknown): void {
    const message = getMessageFromError(error);

    /**
     * FIXED: Flattened ServerToAdminClientMessage.
     */
    const serverToAdminClientMessage: ServerToAdminClientMessage = {
        $case: "errorMessage",
        errorMessage: {
            message: message,
        },
    } as any;

    Client.write(serverToAdminClientMessage);
    console.warn(message);
}

export function emitErrorOnRoomSocket(Client: RoomSocket, error: unknown): void {
    console.error(error);
    const message = getMessageFromError(error);

    /**
     * FIXED: Flattened SubMessage within the Batch payload.
     */
    const batchToPusherMessage: BatchToPusherRoomMessage = {
        payload: [
            {
                $case: "errorMessage",
                errorMessage: {
                    message: message,
                },
            } as any,
        ],
    };

    Client.write(batchToPusherMessage);
    console.warn(message);
}