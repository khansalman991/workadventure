/* eslint-disable @typescript-eslint/no-unused-vars */

import { Writable } from "stream";
import { describe, expect, it } from "vitest";
import { BackToPusherSpaceMessage } from "@workadventure/messages";
import { mock } from "vitest-mock-extended";
import { SpacesWatcher } from "../src/Model/SpacesWatcher";
import { SpaceSocket } from "../src/SpaceManager";

describe("SpacesWatcher", () => {
    it("should close the socket because no pong was answered to the ping within 20sec", async () => {
        const eventsWatcher: BackToPusherSpaceMessage[] = [];
        let isClosed = false;
        const spaceSocketToPusher = mock<SpaceSocket>({
            write(chunk: BackToPusherSpaceMessage): boolean {
                eventsWatcher.push(chunk);
                return true;
            },
            end(): any {
                isClosed = true;
                return mock<SpaceSocket>();
            },
        });

        const watcher = new SpacesWatcher("uuid-watcher", spaceSocketToPusher, 0);

        /**
         * FIXED: Removed .message wrapper.
         * Accessing $case directly on the message object.
         */
        expect(eventsWatcher.some((message: any) => message?.$case === "pingMessage")).toBe(true);
        
        await new Promise((resolve) => {
            setTimeout(resolve, 5);
        });

        expect(isClosed).toBe(true);
    });

    it("should add/remove space to watcher", () => {
        const spaceSocketToPusher = mock<SpaceSocket>();
        const watcher = new SpacesWatcher("uuid-watcher", spaceSocketToPusher);
        watcher.watchSpace("test-spaces-watcher");
        expect(watcher.spacesWatched).toContain("test-spaces-watcher");

        watcher.unwatchSpace("test-spaces-watcher");
        expect(watcher.spacesWatched).not.toContain("test-spaces-watcher");
    });

    it("should not close the socket because pong was received to the ping", async () => {
        // eslint-disable-next-line prefer-const
        let watcher: SpacesWatcher;
        const spaceSocketToPusher = mock<SpaceSocket>({
            write(chunk: BackToPusherSpaceMessage): boolean {
                /**
                 * FIXED: Removed .message wrapper.
                 */
                if ((chunk as any)?.$case === "pingMessage") {
                    setTimeout(() => watcher?.clearPongTimeout(), 0);
                }
                return true;
            },
        });

        watcher = new SpacesWatcher("uuid-watcher", spaceSocketToPusher, 0.1);
        let isClosed = false;
        
        // Setup listener to track closure
        (spaceSocketToPusher.on as any)("end", () => (isClosed = true));
        
        await new Promise((resolve) => {
            setTimeout(resolve, 300);
        });
        expect(isClosed).toBe(false);
    });
});