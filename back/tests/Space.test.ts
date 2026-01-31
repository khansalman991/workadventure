import { describe, expect, it, vi } from "vitest";
import { BackToPusherSpaceMessage, FilterType, PrivateEvent, PublicEvent, SpaceUser } from "@workadventure/messages";
import { mock } from "vitest-mock-extended";
import { Space } from "../src/Model/Space";
import { SpacesWatcher } from "../src/Model/SpacesWatcher";
import { EventProcessor } from "../src/Model/EventProcessor";

describe("Space with filter", () => {
    describe("addWatcher", () => {
        it("should send all users to the new watcher", () => {
            const watcher = mock<SpacesWatcher>({
                id: "uuid-watcher",
                write: () => true,
            });

            const space = new Space("test", FilterType.ALL_USERS, mock<EventProcessor>(), [], "world");

            const spaceUser1: SpaceUser = SpaceUser.fromPartial({
                spaceUserId: "foo_1",
                uuid: "uuid-test",
            });
            const spaceUser2: SpaceUser = SpaceUser.fromPartial({
                spaceUserId: "foo_2",
                uuid: "uuid-test2",
            });

            const spaceUser3: SpaceUser = SpaceUser.fromPartial({
                spaceUserId: "foo_3",
                uuid: "uuid-test3",
            });

            // Set users via private property access
            (space as unknown as { users: Map<SpacesWatcher, Map<string, SpaceUser>> }).users.set(
                watcher,
                new Map<string, SpaceUser>([
                    ["foo_1", spaceUser1],
                    ["foo_2", spaceUser2],
                    ["foo_3", spaceUser3],
                ])
            );

            const writeFunctionMock = vi.fn();

            const watcherToAdd = mock<SpacesWatcher>({
                id: "uuid-watcher-to-add",
                write: writeFunctionMock,
            });
            space.addWatcher(watcherToAdd);

            expect(writeFunctionMock).toHaveBeenCalledTimes(2);

            /**
             * FIXED: Flattened BackToPusherSpaceMessage. 
             * Removed the 'message' wrapper.
             */
            expect(writeFunctionMock).toHaveBeenNthCalledWith(
                1,
                BackToPusherSpaceMessage.fromPartial({
                    $case: "initSpaceUsersMessage",
                    initSpaceUsersMessage: {
                        spaceName: "test",
                        users: [spaceUser1, spaceUser2, spaceUser3],
                    },
                } as any)
            );

            expect(writeFunctionMock).toHaveBeenNthCalledWith(
                2,
                BackToPusherSpaceMessage.fromPartial({
                    $case: "updateSpaceMetadataMessage",
                    updateSpaceMetadataMessage: {
                        spaceName: "test",
                        metadata: JSON.stringify({}),
                    },
                } as any)
            );
        });

        it.skip("should throw error if watcher is already added ???", () => {
            expect(true).toBeFalsy();
        });
    });

    describe("addUser", () => {
        it("should send user to the watcher if result of filter is true", () => {
            const space = new Space("test", FilterType.ALL_USERS, mock<EventProcessor>(), [], "world");
            const mockWriteFunction = vi.fn();
            const watcher = mock<SpacesWatcher>({
                id: "uuid-watcher",
                write: mockWriteFunction,
            });

            const mockWriteFunction2 = vi.fn();
            const watcher2 = mock<SpacesWatcher>({
                id: "uuid-watcher-2",
                write: mockWriteFunction2,
            });

            const spaceUser: SpaceUser = SpaceUser.fromPartial({
                spaceUserId: "foo_1",
                uuid: "uuid-test",
            });

            (space as unknown as { users: Map<SpacesWatcher, Map<string, SpaceUser>> }).users.set(
                watcher,
                new Map<string, SpaceUser>()
            );
            (space as unknown as { users: Map<SpacesWatcher, Map<string, SpaceUser>> }).users.set(
                watcher2,
                new Map<string, SpaceUser>()
            );

            space.addUser(watcher, spaceUser);

            expect(mockWriteFunction).toHaveBeenCalledTimes(1);
            expect(mockWriteFunction).toHaveBeenCalledWith(
                BackToPusherSpaceMessage.fromPartial({
                    $case: "addSpaceUserMessage",
                    addSpaceUserMessage: {
                        spaceName: "test",
                        user: spaceUser,
                    },
                } as any)
            );

            expect(mockWriteFunction2).toHaveBeenCalledTimes(1);
            expect(mockWriteFunction2).toHaveBeenCalledWith(
                BackToPusherSpaceMessage.fromPartial({
                    $case: "addSpaceUserMessage",
                    addSpaceUserMessage: {
                        spaceName: "test",
                        user: spaceUser,
                    },
                } as any)
            );
        });

        it("should not send user to the watcher if result of filter is false", () => {
            const space = new Space("test", FilterType.LIVE_STREAMING_USERS, mock<EventProcessor>(), [], "world");
            const mockWriteFunction = vi.fn();
            const watcher = mock<SpacesWatcher>({
                id: "uuid-watcher",
                write: mockWriteFunction,
            });

            const mockWriteFunction2 = vi.fn();
            const watcher2 = mock<SpacesWatcher>({
                id: "uuid-watcher-2",
                write: mockWriteFunction2,
            });

            const spaceUser: SpaceUser = SpaceUser.fromPartial({
                spaceUserId: "foo_1",
                uuid: "uuid-test",
            });

            (space as unknown as { users: Map<SpacesWatcher, Map<string, SpaceUser>> }).users.set(
                watcher,
                new Map<string, SpaceUser>()
            );
            (space as unknown as { users: Map<SpacesWatcher, Map<string, SpaceUser>> }).users.set(
                watcher2,
                new Map<string, SpaceUser>()
            );

            space.addUser(watcher, spaceUser);

            expect(mockWriteFunction).toHaveBeenCalledTimes(0);
            expect(mockWriteFunction2).toHaveBeenCalledTimes(0);
        });

        it.skip("should send remove user event if a error occurs ???", () => {
            const space = new Space("test", FilterType.LIVE_STREAMING_USERS, mock<EventProcessor>(), [], "world");
            const mockWriteFunction = vi.fn().mockImplementation(() => {
                throw new Error("test");
            });
            const watcher = mock<SpacesWatcher>({
                id: "uuid-watcher",
                write: mockWriteFunction,
            });

            const mockWriteFunction2 = vi.fn();
            const watcher2 = mock<SpacesWatcher>({
                id: "uuid-watcher-2",
                write: mockWriteFunction2,
            });

            const spaceUser: SpaceUser = SpaceUser.fromPartial({
                spaceUserId: "foo_1",
                uuid: "uuid-test",
            });

            (space as unknown as { users: Map<SpacesWatcher, Map<string, SpaceUser>> }).users.set(
                watcher,
                new Map<string, SpaceUser>()
            );
            (space as unknown as { users: Map<SpacesWatcher, Map<string, SpaceUser>> }).users.set(
                watcher2,
                new Map<string, SpaceUser>()
            );

            space.addUser(watcher, spaceUser);

            expect(mockWriteFunction).toHaveBeenCalledTimes(1);
            expect(mockWriteFunction2).toHaveBeenCalledTimes(0);
        });
    });

    describe("updateUser", () => {
        it("should send add user message when user is updated and the filter result becomes true", () => {
            const space = new Space("test", FilterType.LIVE_STREAMING_USERS, mock<EventProcessor>(), [], "world");
            const mockWriteFunction = vi.fn();
            const watcher = mock<SpacesWatcher>({
                id: "uuid-watcher",
                write: mockWriteFunction,
            });

            const mockWriteFunction2 = vi.fn();
            const watcher2 = mock<SpacesWatcher>({
                id: "uuid-watcher-2",
                write: mockWriteFunction2,
            });

            const spaceUser: SpaceUser = SpaceUser.fromPartial({
                spaceUserId: "foo_1",
                uuid: "uuid-test",
                megaphoneState: false,
            });

            (space as unknown as { users: Map<SpacesWatcher, Map<string, SpaceUser>> }).users.set(
                watcher,
                new Map<string, SpaceUser>([["foo_1", spaceUser]])
            );
            (space as unknown as { users: Map<SpacesWatcher, Map<string, SpaceUser>> }).users.set(
                watcher2,
                new Map<string, SpaceUser>()
            );

            space.updateUser(
                watcher,
                {
                    ...spaceUser,
                    megaphoneState: true,
                },
                ["megaphoneState"]
            );

            expect(mockWriteFunction).toHaveBeenCalledTimes(1);
            expect(mockWriteFunction2).toHaveBeenCalledTimes(1);

            expect(mockWriteFunction).toHaveBeenCalledWith(
                BackToPusherSpaceMessage.fromPartial({
                    $case: "addSpaceUserMessage",
                    addSpaceUserMessage: {
                        spaceName: "test",
                        user: {
                            ...spaceUser,
                            megaphoneState: true,
                        },
                    },
                } as any)
            );
        });

        it("should send update user message when filter remains true", () => {
            const space = new Space("test", FilterType.LIVE_STREAMING_USERS, mock<EventProcessor>(), [], "world");
            const mockWriteFunction = vi.fn();
            const watcher = mock<SpacesWatcher>({
                id: "uuid-watcher",
                write: mockWriteFunction,
            });

            const mockWriteFunction2 = vi.fn();
            const watcher2 = mock<SpacesWatcher>({
                id: "uuid-watcher-2",
                write: mockWriteFunction2,
            });

            const spaceUser: SpaceUser = SpaceUser.fromPartial({
                spaceUserId: "foo_1",
                uuid: "uuid-test",
                megaphoneState: true,
            });

            (space as unknown as { users: Map<SpacesWatcher, Map<string, SpaceUser>> }).users.set(
                watcher,
                new Map<string, SpaceUser>([["foo_1", spaceUser]])
            );
            (space as unknown as { users: Map<SpacesWatcher, Map<string, SpaceUser>> }).users.set(
                watcher2,
                new Map<string, SpaceUser>()
            );

            space.updateUser(
                watcher,
                {
                    ...spaceUser,
                    megaphoneState: true,
                    name: "test2",
                    cameraState: true,
                },
                ["megaphoneState", "name", "cameraState"]
            );

            expect(mockWriteFunction).toHaveBeenCalledTimes(1);
            expect(mockWriteFunction2).toHaveBeenCalledTimes(1);

            expect(mockWriteFunction).toHaveBeenCalledWith(
                BackToPusherSpaceMessage.fromPartial({
                    $case: "updateSpaceUserMessage",
                    updateSpaceUserMessage: {
                        spaceName: "test",
                        user: {
                            ...spaceUser,
                            megaphoneState: true,
                            name: "test2",
                            cameraState: true,
                        },
                        updateMask: ["megaphoneState", "name", "cameraState"],
                    },
                } as any)
            );
        });

        it("should send delete user message when filter becomes false", () => {
            const space = new Space("test", FilterType.LIVE_STREAMING_USERS, mock<EventProcessor>(), [], "world");
            const mockWriteFunction = vi.fn();
            const watcher = mock<SpacesWatcher>({
                id: "uuid-watcher",
                write: mockWriteFunction,
            });

            const mockWriteFunction2 = vi.fn();
            const watcher2 = mock<SpacesWatcher>({
                id: "uuid-watcher-2",
                write: mockWriteFunction2,
            });

            const spaceUser: SpaceUser = SpaceUser.fromPartial({
                spaceUserId: "foo_1",
                uuid: "uuid-test",
                megaphoneState: true,
            });

            (space as unknown as { users: Map<SpacesWatcher, Map<string, SpaceUser>> }).users.set(
                watcher,
                new Map<string, SpaceUser>([["foo_1", spaceUser]])
            );
            (space as unknown as { users: Map<SpacesWatcher, Map<string, SpaceUser>> }).users.set(
                watcher2,
                new Map<string, SpaceUser>()
            );

            space.updateUser(
                watcher,
                {
                    ...spaceUser,
                    megaphoneState: false,
                },
                ["megaphoneState"]
            );

            expect(mockWriteFunction).toHaveBeenCalledTimes(1);
            expect(mockWriteFunction2).toHaveBeenCalledTimes(1);

            expect(mockWriteFunction).toHaveBeenCalledWith(
                BackToPusherSpaceMessage.fromPartial({
                    $case: "removeSpaceUserMessage",
                    removeSpaceUserMessage: {
                        spaceName: "test",
                        spaceUserId: "foo_1",
                    },
                } as any)
            );
        });
    });

    describe("removeUser", () => {
        it("should send remove user message to all watchers", () => {
            const space = new Space("test", FilterType.LIVE_STREAMING_USERS, mock<EventProcessor>(), [], "world");
            const mockWriteFunction = vi.fn();
            const watcher = mock<SpacesWatcher>({
                id: "uuid-watcher",
                write: mockWriteFunction,
            });

            const mockWriteFunction2 = vi.fn();
            const watcher2 = mock<SpacesWatcher>({
                id: "uuid-watcher-2",
                write: mockWriteFunction2,
            });

            const spaceUser: SpaceUser = SpaceUser.fromPartial({
                spaceUserId: "foo_1",
                uuid: "uuid-test",
                megaphoneState: true,
            });

            (space as unknown as { users: Map<SpacesWatcher, Map<string, SpaceUser>> }).users.set(
                watcher,
                new Map<string, SpaceUser>([["foo_1", spaceUser]])
            );
            (space as unknown as { users: Map<SpacesWatcher, Map<string, SpaceUser>> }).users.set(
                watcher2,
                new Map<string, SpaceUser>([["foo_1", spaceUser]])
            );

            // Setup usersToNotify needed for removal logic
            (space as unknown as { usersToNotify: Map<SpacesWatcher, Map<string, SpaceUser>> }).usersToNotify.set(
                watcher,
                new Map<string, SpaceUser>([["foo_1", spaceUser]])
            );
            (space as unknown as { usersToNotify: Map<SpacesWatcher, Map<string, SpaceUser>> }).usersToNotify.set(
                watcher2,
                new Map<string, SpaceUser>([["foo_1", spaceUser]])
            );

            space.removeUser(watcher, "foo_1");

            expect(mockWriteFunction).toHaveBeenCalledTimes(1);
            expect(mockWriteFunction2).toHaveBeenCalledTimes(1);

            expect(mockWriteFunction2).toHaveBeenCalledWith(
                BackToPusherSpaceMessage.fromPartial({
                    $case: "removeSpaceUserMessage",
                    removeSpaceUserMessage: {
                        spaceName: "test",
                        spaceUserId: "foo_1",
                    },
                } as any)
            );
        });
    });

    describe("updateMetadata", () => {
        it("should send update metadata message to all watchers", () => {
            const space = new Space("test", FilterType.LIVE_STREAMING_USERS, mock<EventProcessor>(), [], "world");
            const mockWriteFunction = vi.fn();
            const watcher = mock<SpacesWatcher>({
                id: "uuid-watcher",
                write: mockWriteFunction,
            });

            const mockWriteFunction2 = vi.fn();
            const watcher2 = mock<SpacesWatcher>({
                id: "uuid-watcher-2",
                write: mockWriteFunction2,
            });

            (space as unknown as { users: Map<SpacesWatcher, Map<string, SpaceUser>> }).users.set(
                watcher,
                new Map<string, SpaceUser>([])
            );
            (space as unknown as { users: Map<SpacesWatcher, Map<string, SpaceUser>> }).users.set(
                watcher2,
                new Map<string, SpaceUser>()
            );

            space.updateMetadata(watcher, { foo: "bar" });

            expect(mockWriteFunction).toHaveBeenCalledTimes(1);
            expect(mockWriteFunction2).toHaveBeenCalledTimes(1);

            expect(mockWriteFunction).toHaveBeenCalledWith(
                BackToPusherSpaceMessage.fromPartial({
                    $case: "updateSpaceMetadataMessage",
                    updateSpaceMetadataMessage: {
                        spaceName: "test",
                        metadata: JSON.stringify({ foo: "bar" }),
                    },
                } as any)
            );
        });
    });

    describe("dispatchPublicEvent", () => {
        it("should send public event to all watchers", () => {
            const space = new Space("test", FilterType.LIVE_STREAMING_USERS, mock<EventProcessor>(), [], "world");
            const mockWriteFunction = vi.fn();
            const watcher = mock<SpacesWatcher>({
                id: "uuid-watcher",
                write: mockWriteFunction,
            });

            const mockWriteFunction2 = vi.fn();
            const watcher2 = mock<SpacesWatcher>({
                id: "uuid-watcher-2",
                write: mockWriteFunction2,
            });

            (space as unknown as { users: Map<SpacesWatcher, Map<string, SpaceUser>> }).users.set(
                watcher,
                new Map<string, SpaceUser>([])
            );
            (space as unknown as { users: Map<SpacesWatcher, Map<string, SpaceUser>> }).users.set(
                watcher2,
                new Map<string, SpaceUser>()
            );

            space.dispatchPublicEvent(
                PublicEvent.fromPartial({
                    spaceName: "test",
                })
            );

            expect(mockWriteFunction).toHaveBeenCalledTimes(1);
            expect(mockWriteFunction).toHaveBeenCalledWith(
                BackToPusherSpaceMessage.fromPartial({
                    $case: "publicEvent",
                    publicEvent: {
                        spaceName: "test",
                    },
                } as any)
            );
        });
    });

    describe("dispatchPrivateEvent", () => {
        it("should send private event to the correct watcher", () => {
            const space = new Space("test", FilterType.LIVE_STREAMING_USERS, mock<EventProcessor>(), [], "world");
            const mockWriteFunction = vi.fn();
            const watcher = mock<SpacesWatcher>({
                id: "uuid-watcher",
                write: mockWriteFunction,
            });

            const watcher2 = mock<SpacesWatcher>({
                id: "uuid-watcher-2",
                write: vi.fn(),
            });

            const spaceUser: SpaceUser = SpaceUser.fromPartial({
                spaceUserId: "foo_1",
                uuid: "uuid-test",
            });

            (space as unknown as { users: Map<SpacesWatcher, Map<string, SpaceUser>> }).users.set(
                watcher,
                new Map<string, SpaceUser>([["foo_1", spaceUser]])
            );
            (space as unknown as { users: Map<SpacesWatcher, Map<string, SpaceUser>> }).users.set(
                watcher2,
                new Map<string, SpaceUser>()
            );

            space.dispatchPrivateEvent(
                PrivateEvent.fromPartial({
                    senderUserId: spaceUser.spaceUserId,
                    spaceName: "test",
                    receiverUserId: "foo_1",
                })
            );

            expect(mockWriteFunction).toHaveBeenCalledTimes(1);
            expect(mockWriteFunction).toHaveBeenCalledWith(
                BackToPusherSpaceMessage.fromPartial({
                    $case: "privateEvent",
                    privateEvent: {
                        spaceName: "test",
                        receiverUserId: "foo_1",
                        sender: spaceUser,
                    },
                } as any)
            );
        });
    });

    describe("canBeDeleted", () => {
        it("should return true if the space has no users", () => {
            const space = new Space("test", FilterType.LIVE_STREAMING_USERS, mock<EventProcessor>(), [], "world");
            expect(space.canBeDeleted()).toBe(true);
        });

        it("should return false if the space has users", () => {
            const space = new Space("test", FilterType.LIVE_STREAMING_USERS, mock<EventProcessor>(), [], "world");
            const watcher = mock<SpacesWatcher>({
                id: "uuid-watcher",
                write: vi.fn(),
            });

            (space as unknown as { users: Map<SpacesWatcher, Map<string, SpaceUser>> }).users.set(
                watcher,
                new Map<string, SpaceUser>([])
            );
            expect(space.canBeDeleted()).toBe(false);
        });
    });
});