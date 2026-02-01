import { RoomConnection } from "../play/src/front/Connection/RoomConnection";
import { connectionManager } from "../play/src/front/Connection/ConnectionManager";
import WebSocket from "ws"; // Ensure this matches your package.json (usually default import)
import { AvailabilityStatus, PositionMessage_Direction } from "@workadventure/messages";


let userMovedCount = 0;

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Map the WebSocket for Node environment
RoomConnection.setWebsocketFactory((url: string, protocols?: string[]) => {
    return new WebSocket(url, protocols) as any;
});

async function startOneUser(userNo: number): Promise<void> {
    try {
        const roomId = process.env.ROOM_ID || '_/global/maps.workadventure.localhost/Floor0/floor0.json';
        
        const onConnect = await connectionManager.connectToRoomSocket(
            roomId, 
            `TEST_${userNo}`, 
            ['male3'],
            { x: 783, y: 170 }, 
            { top: 0, bottom: 200, left: 500, right: 800 },
            null,
            AvailabilityStatus.ONLINE
        );

        const connection = onConnect.connection;

        // Note: The method name in RoomConnection is usually userMovedMessageStream (Observable)
        // If you have a custom 'onUserMoved' method, keep it, otherwise subscribe to the stream:
        connection.userMovedMessageStream.subscribe(() => {
            userMovedCount++;
        });

        console.log(`User ${userNo} connected with ID: ${connection.getUserId()}`);

        let angle = Math.random() * Math.PI * 2;

        for (let i = 0; i < 100; i++) {
            const x = Math.floor(320 + 1472/2 * (1 + Math.sin(angle)));
            const y = Math.floor(200 + 1090/2 * (1 + Math.cos(angle)));

            // Fixed parameters to match PositionMessage_Direction enum
            connection.sharePosition(x, y, PositionMessage_Direction.DOWN, true, {
                top: y - 200,
                bottom: y + 200,
                left: x - 320,
                right: x + 320
            });

            angle += 0.05;
            await sleep(200);
        }

        await sleep(10000);
        connection.closeConnection();
        console.log(`User ${userNo} disconnected.`);
    } catch (e) {
        console.error(`Error with user ${userNo}:`, e);
    }
}

(async () => {
    // initBenchmark usually sets up the stores for Node environment
    connectionManager.initBenchmark();

    const promises = [];

    console.log("Starting benchmark with 160 users...");

    for (let userNo = 0; userNo < 160; userNo++) {
        const promise = startOneUser(userNo);
        promises.push(promise);
        
        // Staggered login to prevent server overload
        await sleep(125);
    }

    await Promise.all(promises);
    console.log('--- Benchmark Finished ---');
    console.log('Total User moved messages received: ' + userMovedCount);
})();