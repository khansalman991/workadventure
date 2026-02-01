import type { Subscription } from "rxjs";
import * as DeferredModule from "ts-deferred";
/** * FIX: We define the type separately so it can be used for type definitions 
 */
import type { Deferred as DeferredType } from "ts-deferred";
const Deferred = DeferredModule.Deferred;

import type { Readable, Unsubscriber } from "svelte/store";
import { get } from "svelte/store";
import { iframeListener } from "../../Api/IframeListener";
import { videoStreamElementsStore } from "../../Stores/PeerStore";
import type { SpaceInterface } from "../../Space/SpaceInterface";
import { InputPCMStreamer } from "./InputPCMStreamer";

/**
 * Class in charge of receiving audio streams from the users and forwarding them to the scripting API for analysis.
 */
export class ScriptingInputAudioStreamManager {
    private appendPCMDataStreamUnsubscriber: Subscription | undefined;
    
    /** * FIX: Use DeferredType for the type definition and Deferred for the value 
     */
    private pcmStreamerDeferred: DeferredType<InputPCMStreamer> = new Deferred<InputPCMStreamer>();
    
    private pcmStreamerResolved = false;
    private pcmStreamerResolving = false;
    private isListening = false;
    private streams: Map<Readable<MediaStream | undefined>, Unsubscriber> = new Map();
    private videoPeerAddedUnsubscriber: Subscription;
    private videoPeerRemovedUnsubscriber: Subscription;

    constructor(space: SpaceInterface) {
        this.videoPeerAddedUnsubscriber = space.spacePeerManager.videoPeerAdded.subscribe((streamable) => {
            if (this.isListening) {
                if (streamable.media.type === "webrtc" || streamable.media.type === "livekit") {
                    this.addMediaStreamStore(streamable.media.streamStore);
                }
            }
        });

        this.videoPeerRemovedUnsubscriber = space.spacePeerManager.videoPeerRemoved.subscribe((streamable) => {
            if (this.isListening) {
                if (streamable.media.type === "webrtc" || streamable.media.type === "livekit") {
                    this.removeMediaStreamStore(streamable.media.streamStore);
                }
            }
        });
    }

    public async startListeningToAudioStream(sampleRate: number): Promise<void> {
        if (this.isListening) {
            throw new Error("Already listening");
        }

        this.isListening = true;

        if (this.pcmStreamerResolved || this.pcmStreamerResolving) {
            throw new Error("Already listening");
        }
        const pcmStreamer = new InputPCMStreamer(sampleRate);
        this.pcmStreamerResolving = true;
        await pcmStreamer.initWorklet();
        this.pcmStreamerResolved = true;
        this.pcmStreamerResolving = false;
        this.pcmStreamerDeferred.resolve(pcmStreamer);

        this.appendPCMDataStreamUnsubscriber = pcmStreamer.pcmDataStream.subscribe((data) => {
            iframeListener.postMessage(
                {
                    type: "appendPCMData",
                    /**
                     * FIX: Cast to any to bypass the ArrayBuffer vs SharedArrayBuffer incompatibility.
                     * This prevents the "Type 'ArrayBufferLike' is not assignable to type 'ArrayBuffer'" error.
                     */
                    data: { data: data as any },
                },
                undefined
            );
        });

        get(videoStreamElementsStore).forEach((peer) => {
            const streamable = get(peer.streamable);
            if (streamable && (streamable.media.type === "webrtc" || streamable.media.type === "livekit")) {
                this.addMediaStreamStore(streamable.media.streamStore);
            }
        });
    }

    public stopListeningToAudioStream(): void {
        this.isListening = false;

        this.appendPCMDataStreamUnsubscriber?.unsubscribe();
        this.appendPCMDataStreamUnsubscriber = undefined;

        get(videoStreamElementsStore).forEach((peer) => {
            const streamable = get(peer.streamable);
            if (streamable && (streamable.media.type === "webrtc" || streamable.media.type === "livekit")) {
                this.removeMediaStreamStore(streamable.media.streamStore);
            }
        });

        if (this.pcmStreamerResolved || this.pcmStreamerResolving) {
            this.pcmStreamerDeferred.promise
                .then((pcmStreamer: InputPCMStreamer) => {
                    pcmStreamer.close();
                    this.pcmStreamerDeferred = new Deferred<InputPCMStreamer>();
                })
                .catch((e: Error) => {
                    console.error("Error while stopping stream", e);
                });
        } else {
            console.error("stopListeningToStreamInBubble called while no stream is running");
        }

        this.pcmStreamerResolved = false;
        this.pcmStreamerResolving = false;
        this.pcmStreamerDeferred = new Deferred<InputPCMStreamer>();
    }

    private addMediaStreamStore(streamStore: Readable<MediaStream | undefined>): void {
        let lastValue: MediaStream | undefined = undefined;
        const unsubscriber = streamStore.subscribe((stream) => {
            if (stream) {
                this.pcmStreamerDeferred.promise
                    .then((pcmStreamer: InputPCMStreamer) => {
                        pcmStreamer.addMediaStream(stream);
                        lastValue = stream;
                    })
                    .catch((e: Error) => {
                        console.error("Error while adding stream", e);
                    });
            } else {
                this.pcmStreamerDeferred.promise
                    .then((pcmStreamer: InputPCMStreamer) => {
                        if (lastValue) {
                            pcmStreamer.removeMediaStream(lastValue);
                            lastValue = undefined;
                        }
                    })
                    .catch((e: Error) => {
                        console.error("Error while removing stream", e);
                    });
            }
        });
        this.streams.set(streamStore, unsubscriber);
    }

    private removeMediaStreamStore(streamStore: Readable<MediaStream | undefined>): void {
        const unsubscriber = this.streams.get(streamStore);
        if (unsubscriber) {
            unsubscriber();
            this.streams.delete(streamStore);
        } else {
            console.error("Stream not found. Unable to remove.");
        }
    }

    public close(): void {
        this.videoPeerAddedUnsubscriber.unsubscribe();
        this.videoPeerRemovedUnsubscriber.unsubscribe();
        this.appendPCMDataStreamUnsubscriber?.unsubscribe();

        if (this.pcmStreamerResolved || this.pcmStreamerResolving) {
            this.pcmStreamerDeferred.promise
                .then((pcmStreamer: InputPCMStreamer) => {
                    pcmStreamer.close();
                })
                .catch((e: Error) => {
                    console.error("Error while closing stream", e);
                });
        }
    }
}