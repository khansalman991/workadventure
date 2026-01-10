import * as Sentry from "@sentry/node";
import { SpaceUser, PrivateEvent } from "@workadventure/messages";
import type { CommunicationType } from "../Types/CommunicationTypes";
import type { ICommunicationState, StateTransitionResult } from "../Interfaces/ICommunicationState";
import type { ICommunicationStrategy } from "../Interfaces/ICommunicationStrategy";
import { CommunicationConfig } from "../CommunicationManager";
import type { ICommunicationSpace } from "../Interfaces/ICommunicationSpace";

// Define a local helper type to strictly match the generated Protobuf union cases
type SwitchEventMessages = 
    | { $case: "switchMessage"; switchMessage: { strategy: string } }
    | { $case: "finalizeSwitchMessage"; finalizeSwitchMessage: { strategy: string } };

export abstract class CommunicationState implements ICommunicationState {
    protected _switchTimeout: NodeJS.Timeout | null = null;
    protected abstract _communicationType: CommunicationType;
    protected _switchInitiatorUserId: string | null = null;

    constructor(
        protected readonly _space: ICommunicationSpace,
        protected readonly _currentStrategy: ICommunicationStrategy,
        protected users: ReadonlyMap<string, SpaceUser>,
        protected usersToNotify: ReadonlyMap<string, SpaceUser>,
        protected readonly MAX_USERS_FOR_WEBRTC: number = Number(CommunicationConfig.MAX_USERS_FOR_WEBRTC)
    ) {}

    public init(): void {
        this._currentStrategy.initialize(this.users, this.usersToNotify);
    }

    /**
     * FIXED: Explicitly typed 'event' as SwitchEventMessages.
     * This prevents the type from collapsing into 'never' by providing a direct 
     * match for the switch and finalize cases.
     */
    dispatchSwitchEvent(
        userId: string,
        event: SwitchEventMessages
    ): void {
        const privateEvent: PrivateEvent = {
            spaceName: this._space.getSpaceName(),
            receiverUserId: userId,
            senderUserId: userId,
            spaceEvent: {
                // REQUIRED: Explicitly set the $case to "event" to satisfy the wrapper union
                $case: "event",
                event: event as any, // Cast to 'any' here handles the nested Protobuf union mapping
            },
        } as PrivateEvent;
        
        this._space.dispatchPrivateEvent(privateEvent);
    }

    handleUserAdded(user: SpaceUser): Promise<StateTransitionResult | ICommunicationState | void> {
        try {
            if (!this.usersToNotify.has(user.spaceUserId)) {
                this.notifyUserOfCurrentStrategy(user, this._communicationType);
            }
            this._currentStrategy.addUser(user).catch((e) => {
                Sentry.captureException(e);
                console.error(e);
            });
            return Promise.resolve();
        } catch (e) {
            console.error(e);
            return Promise.resolve();
        }
    }

    handleUserDeleted(user: SpaceUser): Promise<StateTransitionResult | ICommunicationState | void> {
        this._currentStrategy.deleteUser(user);
        return Promise.resolve();
    }

    handleUserUpdated(user: SpaceUser): Promise<StateTransitionResult | ICommunicationState | void> {
        this._currentStrategy.updateUser(user);
        return Promise.resolve();
    }

    handleUserToNotifyAdded(user: SpaceUser): Promise<StateTransitionResult | ICommunicationState | void> {
        try {
            if (!this.users.has(user.spaceUserId)) {
                this.notifyUserOfCurrentStrategy(user, this._communicationType);
            }
            this._currentStrategy.addUserToNotify(user).catch((e) => {
                Sentry.captureException(e);
                console.error(e);
            });
        } catch (e) {
            console.error(e);
            return Promise.resolve();
        }
        return Promise.resolve();
    }

    handleUserToNotifyDeleted(user: SpaceUser): Promise<StateTransitionResult | ICommunicationState | void> {
        this._currentStrategy.deleteUserFromNotify(user);
        return Promise.resolve();
    }

    public switchState(targetCommunicationType: string): void {
        const allUsers = new Map<string, SpaceUser>([...this.users, ...this.usersToNotify]);
        for (const user of allUsers.values()) {
            this.dispatchSwitchEvent(user.spaceUserId, {
                $case: "switchMessage",
                switchMessage: {
                    strategy: targetCommunicationType,
                },
            });
        }
    }

    protected notifyUserOfCurrentStrategy(user: SpaceUser, strategy: CommunicationType): void {
        this.dispatchSwitchEvent(user.spaceUserId, {
            $case: "switchMessage",
            switchMessage: { strategy },
        });
    }

    public finalize(): void {
        const allUsers = new Map<string, SpaceUser>([...this.users, ...this.usersToNotify]);
        for (const user of allUsers.values()) {
            this.dispatchSwitchEvent(user.spaceUserId, {
                $case: "finalizeSwitchMessage",
                finalizeSwitchMessage: {
                    strategy: this._communicationType,
                },
            });
        }
    }

    get communicationType(): string {
        return this._communicationType;
    }
}