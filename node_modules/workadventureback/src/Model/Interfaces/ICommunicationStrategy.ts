import type { SpaceUser } from "@workadventure/messages";

export interface ICommunicationStrategy {
    /**
     * Initializes the strategy with the current set of users in the space.
     */
    initialize(users: ReadonlyMap<string, SpaceUser>, usersToNotify: ReadonlyMap<string, SpaceUser>): void;

    /**
     * Logic for when a user is added to the active communication.
     */
    addUser(user: SpaceUser): Promise<void>;

    /**
     * Logic for when a user leaves the active communication.
     */
    deleteUser(user: SpaceUser): void;

    /**
     * Logic for updating user data (e.g., name changes or status updates).
     */
    updateUser(user: SpaceUser): void;

    /**
     * Logic for users who are nearby but not yet in the active communication.
     */
    addUserToNotify(user: SpaceUser): Promise<void>;

    /**
     * Logic for removing a user from the notification list.
     */
    deleteUserFromNotify(user: SpaceUser): void;
}