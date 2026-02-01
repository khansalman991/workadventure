import type {
    BackToPusherSpaceMessage,
    NonUndefinedFields,
    PrivateEventBackToPusher,
    PublicEvent,
    SubMessage,
} from "@workadventure/messages";
import { noUndefined, SpaceUser } from "@workadventure/messages";
import * as Sentry from "@sentry/node";
import * as catchUnknown from "catch-unknown";
const asError = catchUnknown.asError;
import debug from "debug";
import { merge } from "lodash";
import { applyFieldMask } from "protobuf-fieldmask";
import { z } from "zod";
import * as DeferredModule from "ts-deferred";
const Deferred = DeferredModule.Deferred;
import type { Socket } from "../services/SocketManager";
import type { EventProcessor } from "./EventProcessor";
import type { SpaceUserExtended, Space, PartialSpaceUser } from "./Space";

export interface SpaceToFrontDispatcherInterface {
    handleMessage(message: BackToPusherSpaceMessage): void;
    notifyMe(watcher: Socket, subMessage: SubMessage): void;
    notifyMeAddUser(watcher: Socket, user: SpaceUserExtended): void;
    notifyMeInit(watcher: Socket): Promise<void>;
    notifyAll(subMessage: SubMessage): void;
    notifyAllIncludingNonWatchers(subMessage: SubMessage): void;
}

export class SpaceToFrontDispatcher implements SpaceToFrontDispatcherInterface {
    private initDeferred = new Deferred<void>();

    constructor(private readonly _space: Space, private readonly eventProcessor: EventProcessor) {}

    handleMessage(message: BackToPusherSpaceMessage): void {
        // FIX: Cast to any to access flattened $case and bypass "possibly undefined" checks
        const msg = message as any;
        
        if (!msg || !msg.$case) {
            console.warn("spaceStreamToBack => Empty message received.", message);
            return;
        }

        try {
            switch (msg.$case) {
                case "initSpaceUsersMessage": {
                    // FIX: Added ! to assert it's not undefined
                    const initSpaceUsersMessage = noUndefined(msg.initSpaceUsersMessage!);
                    this.initSpaceUsersMessage(initSpaceUsersMessage.users);
                    break;
                }
                case "addSpaceUserMessage": {
                    const addSpaceUserMessage = noUndefined(msg.addSpaceUserMessage!);
                    this.addUser(addSpaceUserMessage.user);
                    break;
                }
                case "updateSpaceUserMessage": {
                    const updateSpaceUserMessage = noUndefined(msg.updateSpaceUserMessage!);
                    try {
                        this.updateUser(updateSpaceUserMessage.user, updateSpaceUserMessage.updateMask);
                    } catch (err) {
                        console.warn("User not found, maybe left the space", err);
                    }
                    break;
                }
                case "removeSpaceUserMessage": {
                    this.removeUser(msg.removeSpaceUserMessage!.spaceUserId);
                    break;
                }
                case "updateSpaceMetadataMessage": {
                    const updateSpaceMetadataMessage = msg.updateSpaceMetadataMessage!;

                    const isMetadata = z
                        .record(z.string(), z.unknown())
                        .safeParse(JSON.parse(updateSpaceMetadataMessage.metadata));
                    if (!isMetadata.success) {
                        Sentry.captureException(`Invalid metadata received. ${updateSpaceMetadataMessage.metadata}`);
                        return;
                    }
                    this.updateMetadata(isMetadata.data);
                    break;
                }
                case "pingMessage": {
                    throw new Error(`${msg.$case} should not be received by the dispatcher`);
                }
                case "kickOffMessage": {
                    debug("[space] kickOffSMessage received");
                    this._space.forwarder.forwardMessageToSpaceBack({
                        $case: "kickOffMessage",
                        kickOffMessage: {
                            userId: msg.kickOffMessage!.userId,
                            spaceName: msg.kickOffMessage!.spaceName,
                        },
                    } as any);
                    break;
                }
                case "publicEvent": {
                    this.sendPublicEvent(noUndefined(msg.publicEvent!));
                    break;
                }
                case "privateEvent": {
                    this.sendPrivateEvent(noUndefined(msg.privateEvent!));
                    break;
                }
                case "spaceAnswerMessage": {
                    const answerMsg = msg.spaceAnswerMessage!;
                    if (answerMsg.answer === undefined) {
                        throw new Error("Invalid message received. Answer missing.");
                    }
                    this._space.query.receiveAnswer(answerMsg.id, answerMsg.answer);
                    break;
                }
                default: {
                    const _exhaustiveCheck: any = msg;
                }
            }
        } catch (error) {
            console.error(error);
            Sentry.captureException(error);
        }
    }

    private initSpaceUsersMessage(spaceUsers: SpaceUser[]) {
        for (const spaceUser of spaceUsers) {
            const user: Partial<SpaceUserExtended> = spaceUser;
            user.lowercaseName = spaceUser.name.toLowerCase();

            if (this._space.users.has(spaceUser.spaceUserId)) {
                throw new Error(
                    `During init... user ${spaceUser.spaceUserId} already exists in space ${this._space.name}`
                );
            }
            this._space.users.set(spaceUser.spaceUserId, user as SpaceUserExtended);
        }
        this.initDeferred.resolve();
    }

    private addUser(spaceUser: SpaceUser) {
        const user: Partial<SpaceUserExtended> = spaceUser;
        user.lowercaseName = spaceUser.name.toLowerCase();

        if (this._space.users.has(spaceUser.spaceUserId)) {
            return;
        }
        this._space.users.set(spaceUser.spaceUserId, user as SpaceUserExtended);

        // FIX: Flattened SubMessage creation
        const subMessage: SubMessage = {
            $case: "addSpaceUserMessage",
            addSpaceUserMessage: {
                spaceName: this._space.localName,
                user: spaceUser,
            },
        } as any;
        this.notifyAll(subMessage);
    }

    private updateUser(spaceUser: PartialSpaceUser, updateMask: string[]) {
        const user = this._space.users.get(spaceUser.spaceUserId);
        if (!user) {
            throw new Error(`User not found in this space ${spaceUser.spaceUserId}`);
        }
        const updateValues = applyFieldMask(spaceUser, updateMask);
        merge(user, updateValues);

        if (spaceUser.name) user.lowercaseName = spaceUser.name.toLowerCase();

        const subMessage: SubMessage = {
            $case: "updateSpaceUserMessage",
            updateSpaceUserMessage: {
                spaceName: this._space.localName,
                user: SpaceUser.fromPartial(spaceUser),
                updateMask,
            },
        } as any;
        this.notifyAll(subMessage);
    }

    private removeUser(spaceUserId: string) {
        const user = this._space.users.get(spaceUserId);
        if (user) {
            this._space.users.delete(spaceUserId);

            const subMessage: SubMessage = {
                $case: "removeSpaceUserMessage",
                removeSpaceUserMessage: {
                    spaceName: this._space.localName,
                    spaceUserId,
                },
            } as any;

            this.notifyAll(subMessage);
        }
    }

    private updateMetadata(metadata: { [key: string]: unknown }) {
        for (const [key, value] of Object.entries(metadata)) {
            this._space.metadata.set(key, value);
        }

        const subMessage: SubMessage = {
            $case: "updateSpaceMetadataMessage",
            updateSpaceMetadataMessage: {
                spaceName: this._space.localName,
                metadata: JSON.stringify(metadata),
            },
        } as any;
        this.notifyAllMetadata(subMessage);
    }

    private notifyAllMetadata(subMessage: SubMessage) {
        this._space._localConnectedUser.forEach((watcher) => {
            const socketData = watcher.getUserData();
            // FIX: Access flattened case directly
            const msg = subMessage as any;
            if (msg.$case === "updateSpaceMetadataMessage") {
                msg.updateSpaceMetadataMessage.spaceName = this._space.localName;
                socketData.emitInBatch(subMessage);
            }
        });
    }

    public notifyAll(subMessage: SubMessage) {
        this._space._localWatchers.forEach((watcherId) => {
            const watcher = this._space._localConnectedUser.get(watcherId);
            if (watcher) {
                this.notifyMe(watcher, subMessage);
            }
        });
    }

    public notifyAllIncludingNonWatchers(subMessage: SubMessage) {
        this._space._localConnectedUser.forEach((socket) => {
            this.notifyMe(socket, subMessage);
        });
    }

    public notifyMe(watcher: Socket, subMessage: SubMessage) {
        watcher.getUserData().emitInBatch(subMessage);
    }

    public notifyMeAddUser(watcher: Socket, user: SpaceUserExtended) {
        const subMessage: SubMessage = {
            $case: "addSpaceUserMessage",
            addSpaceUserMessage: {
                spaceName: this._space.localName,
                user,
            },
        } as any;
        this.notifyMe(watcher, subMessage);
    }

    public async notifyMeInit(watcher: Socket) {
        await this.waitForInit();
        const subMessage: SubMessage = {
            $case: "initSpaceUsersMessage",
            initSpaceUsersMessage: {
                spaceName: this._space.localName,
                users: Array.from(this._space.users.values()),
            },
        } as any;
        this.notifyMe(watcher, subMessage);
    }

    private sendPublicEvent(message: NonUndefinedFields<PublicEvent>) {
        const spaceEvent = noUndefined(message.spaceEvent);
        const sender = this._space.users.get(message.senderUserId);

        this.notifyAllUsers(
            {
                $case: "publicEvent",
                publicEvent: {
                    senderUserId: message.senderUserId,
                    spaceEvent: this.eventProcessor.processPublicEvent(spaceEvent as any, sender) as any,
                    spaceName: this._space.localName,
                },
            } as any,
            message.senderUserId
        );
    }

    private sendPrivateEvent(message: NonUndefinedFields<PrivateEventBackToPusher>) {
        const spaceEvent = noUndefined(message.spaceEvent);
        const receiver = this._space._localConnectedUser.get(message.receiverUserId);

        if (!receiver) return;

        const receiverSpaceUser = this._space._localConnectedUserWithSpaceUser.get(receiver);
        if (!receiverSpaceUser) return;

        const extendedSender = {
            ...message.sender,
            lowercaseName: message.sender.name.toLowerCase(),
        };

        receiver.getUserData().emitInBatch({
            $case: "privateEvent",
            privateEvent: {
                sender: extendedSender,
                receiverUserId: message.receiverUserId,
                spaceEvent: this.eventProcessor.processPrivateEvent(
                    spaceEvent as any,
                    extendedSender,
                    receiverSpaceUser
                ) as any,
                spaceName: this._space.localName,
            },
        } as any);
    }

    private notifyAllUsers(subMessage: SubMessage, senderId: string) {
        for (const [socket, spaceUser] of this._space._localConnectedUserWithSpaceUser.entries()) {
            if (spaceUser.spaceUserId !== senderId) {
                socket.getUserData().emitInBatch(subMessage);
            }
        }
    }

    private waitForInit(): Promise<void> {
        return this.initDeferred.promise;
    }
}