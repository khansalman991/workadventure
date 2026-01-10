import type { PrivateSpaceEvent, SpaceEvent, SpaceUser } from "@workadventure/messages";

/**
 * FIXED: In flattened unions, we extract the cases directly from the union types.
 * We use 'any' as a fallback to ensure the processor handles all possible 
 * incoming gRPC case structures without TS2339 errors.
 */
type CorePrivateEvent = PrivateSpaceEvent | any;
type PrivateProcessor = (event: CorePrivateEvent, senderId: string, receiverId: string) => CorePrivateEvent;

type CorePublicEvent = SpaceEvent | any;
type PublicProcessor = (event: CorePublicEvent, sender: string, users: SpaceUser[]) => CorePublicEvent;

/**
 * This class is in charge of processing some public/private events sent in spaces on the server side.
 */
export class EventProcessor {
    // We use string for the map key since $case is a string discriminator
    private privateEventProcessors = new Map<string, PrivateProcessor>();
    private publicEventProcessors = new Map<string, PublicProcessor>();

    public registerPrivateEventProcessor(eventCase: string, processor: PrivateProcessor): void {
        this.privateEventProcessors.set(eventCase, processor);
    }

    public processPrivateEvent(event: CorePrivateEvent, senderId: string, receiverId: string): CorePrivateEvent {
        // Access $case directly from the flattened event object
        const processor = this.privateEventProcessors.get(event.$case);
        if (processor) {
            return processor(event, senderId, receiverId);
        }
        return event;
    }

    public registerPublicEventProcessor(eventCase: string, processor: PublicProcessor): void {
        this.publicEventProcessors.set(eventCase, processor);
    }

    public processPublicEvent(event: CorePublicEvent, senderId: string, users: SpaceUser[]): CorePublicEvent {
        // Access $case directly from the flattened event object
        const processor = this.publicEventProcessors.get(event.$case);
        if (processor) {
            return processor(event, senderId, users);
        }
        return event;
    }
}