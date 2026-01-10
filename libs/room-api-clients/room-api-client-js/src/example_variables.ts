// FIXED: Point to the local compiled folder you manually populated
import { Value } from "./compiled_proto/struct";
import { createRoomApiClient } from "./index";

const apiKey = process.env.ROOM_API_SECRET_KEY;

if (!apiKey) {
    throw new Error("No ROOM_API_SECRET_KEY defined on environment variables!");
}

/**
 * Ensure the host matches your local Network IP to avoid connection issues.
 * Uses port 8081 for the Room API.
 */
const client = createRoomApiClient(apiKey, "192.168.0.109", 8081);

const roomUrl = "http://192.168.0.109:3000/_/global/192.168.0.109:8080/Floor0/floor0.json";
const variableName = "textField";

async function init() {
    // 1. Save a variable
    await client.saveVariable({
        name: variableName,
        room: roomUrl,
        value: "Default Value",
    });

    console.log("Value saved: Default Value");

    // 2. Read a variable
    const value = await client.readVariable({
        name: variableName,
        room: roomUrl,
    });

    console.log("Value read plain:", value);
    // FIXED: Value.unwrap converts Protobuf Value back to a JS primitive
    console.log("Value read:", Value.unwrap(value as any));

    // 3. Save a variable after 5 seconds
    setTimeout(() => {
        client.saveVariable({
            name: variableName,
            room: roomUrl,
            value: "New Value",
        })
        .then(() => {
            console.log("Value saved: New Value");
        })
        .catch((e: any) => console.error("Error saving variable:", e));
    }, 5000);

    // 4. Listen to variable changes
    const listenVariable = client.listenVariable({
        name: variableName,
        room: roomUrl,
    });

    /**
     * FIXED: Explicitly typed 'val' and 'err' to resolve TS7006.
     * We use 'any' here because the underlying library types are 
     * currently unresolved due to missing .ts source files.
     */
    const subscription = listenVariable.subscribe({
        next: (val: any) => {
            console.log("--- Variable Update Received ---");
            console.log("Value listened plain:", val);
            console.log("Value listened (unwrapped):", Value.unwrap(val as any));
        },
        error: (err: any) => console.error("Variable stream error:", err),
        complete: () => console.log("Variable stream closed.")
    });
}

// Start the initialization
init().catch((e: any) => console.error("Initialization error:", e));