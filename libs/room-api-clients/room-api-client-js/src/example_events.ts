import { createRoomApiClient } from "./index";

const apiKey = process.env.ROOM_API_SECRET_KEY;

if (!apiKey) {
    throw new Error("No ROOM_API_SECRET_KEY defined on environment variables!");
}

/**
 * Connection settings for your local environment.
 */
const client = createRoomApiClient(apiKey, "192.168.0.109", 8081);

/**
 * The specific room URL you want to interact with.
 */
const roomUrl = "http://192.168.0.109:3000/_/global/192.168.0.109:8080/Floor0/floor0.json";

// The name of the custom event
const eventName = "my-event";

async function init() {
    // 1. Send a broadcast event after 1 second
    setTimeout(() => {
        console.info(`Sending event "${eventName}"...`);

        client.broadcastEvent({
            name: eventName,
            room: roomUrl,
            data: { foo: "Default Value" },
            targetUserIds: [], 
        }).then(() => {
            console.info("Event successfully sent!");
        }).catch((e: any) => {
            console.error("Error sending event:", e);
        });

    }, 1000);

    // 2. Listen for events using an Observable
    const events = client.listenToEvent({
        name: eventName,
        room: roomUrl,
    });

    console.info(`Listening for events on "${eventName}"...`);

    /**
     * FIXED: Explicitly typed 'event' and 'err' to resolve TS7006.
     * Since the library types are currently unresolved (missing .ts source),
     * we use 'any' to satisfy the "noImplicitAny" requirement.
     */
    const subscription = events.subscribe({
        next: (event: any) => {
            console.info("--- New Event Received ---");
            console.info("Sender ID:", event.senderId);
            console.info("Data:", JSON.stringify(event.data));
        },
        error: (err: any) => {
            console.error("Event stream error:", err);
        },
        complete: () => {
            console.info("Event stream has been closed by the server.");
        }
    });
}

// Start the script
init().catch((e: any) => console.error("Initialization failed:", e));