import axios from "axios";
import Debug from "debug";
import * as Sentry from "@sentry/svelte";

import type { AreaData, AtLeast, EntityDimensions, WAMEntityData } from "@workadventure/map-editor";
import type {
    AddSpaceFilterMessage,
    AnswerMessage,
    ApplicationMessage,
    AvailabilityStatus,
    CharacterTextureMessage,
    ChatMembersAnswer,
    CompanionTextureMessage,
    DeleteCustomEntityMessage,
    EditMapCommandMessage,
    EmbeddableWebsiteAnswer,
    EmoteEventMessage as EmoteEventMessageTsProto,
    ErrorMessage as ErrorMessageTsProto,
    ErrorScreenMessage as ErrorScreenMessageTsProto,
    FollowAbortMessage,
    FollowConfirmationMessage,
    FollowRequestMessage,
    GroupDeleteMessage as GroupDeleteMessageTsProto,
    GroupUpdateMessage as GroupUpdateMessageTsProto,
    JitsiJwtAnswer,
    JoinBBBMeetingAnswer,
    MegaphoneSettings,
    Member,
    ModifiyWAMMetadataMessage,
    ModifyCustomEntityMessage,
    MoveToPositionMessage as MoveToPositionMessageProto,
    LocatePositionMessage as LocatePositionMessageProto,
    PlayerDetailsUpdatedMessage as PlayerDetailsUpdatedMessageTsProto,
    PositionMessage as PositionMessageTsProto,
    PositionMessage_Direction,
    QueryMessage,
    RefreshRoomMessage,
    RemoveSpaceFilterMessage,
    RoomShortDescription,
    TokenExpiredMessage,
    UpdateWAMSettingsMessage,
    UploadEntityMessage,
    UserJoinedMessage as UserJoinedMessageTsProto,
    UserLeftMessage as UserLeftMessageTsProto,
    UserMovedMessage as UserMovedMessageTsProto,
    ViewportMessage as ViewportMessageTsProto,
    WorldConnectionMessage,
    PublicEvent,
    JoinSpaceRequestMessage,
    LeaveSpaceRequestMessage,
    SpaceEvent,
    PrivateSpaceEvent,
    UpdateSpaceUserPusherToFrontMessage,
    AddSpaceUserMessage,
    RemoveSpaceUserPusherToFrontMessage,
    PublicEventFrontToPusher,
    PrivateEventFrontToPusher,
    OauthRefreshToken,
    ExternalModuleMessage,
    SpaceDestroyedMessage,
    SayMessage,
    FilterType,
    UploadFileMessage,
    MapStorageJwtAnswer,
    PrivateEventPusherToFront,
    InitSpaceUsersMessage,
    IceServersAnswer,
    AskPositionMessage_AskType,
} from "@workadventure/messages";
import {
    AskPositionMessage_AskType as AskPositionMessageAskType,
    apiVersionHash,
    ClientToServerMessage as ClientToServerMessageTsProto,
    ServerToClientMessage as ServerToClientMessageTsProto,
    SetPlayerDetailsMessage as SetPlayerDetailsMessageTsProto,
    SetPlayerVariableMessage_Scope,
    UpdateSpaceMetadataMessage,
    SpaceUser,
    LeaveChatRoomAreaMessage,
} from "@workadventure/messages";
import { BehaviorSubject, Subject } from "rxjs";
import { get } from "svelte/store";
import { generateFieldMask } from "protobuf-fieldmask";
import { AbortError } from "@workadventure/shared-utils/src/Abort/AbortError";
import { asError } from "catch-unknown";
import { abortAny } from "@workadventure/shared-utils/src/Abort/AbortAny";
import { abortTimeout } from "@workadventure/shared-utils/src/Abort/AbortTimeout";
import type { ReceiveEventEvent } from "../Api/Events/ReceiveEventEvent";
import type { SetPlayerVariableEvent } from "../Api/Events/SetPlayerVariableEvent";
import { iframeListener } from "../Api/IframeListener";
import { ABSOLUTE_PUSHER_URL } from "../Enum/ComputedConst";
import { ENABLE_MAP_EDITOR, UPLOADER_URL, WOKA_SPEED } from "../Enum/EnvironmentVariable";
import type { CompanionTextureDescriptionInterface } from "../Phaser/Companion/CompanionTextures";
import type { WokaTextureDescriptionInterface } from "../Phaser/Entity/PlayerTextures";
import { gameManager } from "../Phaser/Game/GameManager";
import { SelectCharacterScene, SelectCharacterSceneName } from "../Phaser/Login/SelectCharacterScene";
import { SelectCompanionScene, SelectCompanionSceneName } from "../Phaser/Login/SelectCompanionScene";
import { chatZoneLiveStore } from "../Stores/ChatStore";
import { errorScreenStore } from "../Stores/ErrorScreenStore";
import { followRoleStore, followUsersStore } from "../Stores/FollowStore";
import { isSpeakerStore, requestedMicrophoneState, requestedCameraState } from "../Stores/MediaStore";
import { currentLiveStreamingSpaceStore } from "../Stores/MegaphoneStore";
import {
    inviteUserActivated,
    mapEditorActivated,
    menuIconVisiblilityStore,
    menuVisiblilityStore,
    warningBannerStore,
} from "../Stores/MenuStore";
import { requestedScreenSharingState } from "../Stores/ScreenSharingStore";
import { selectCompanionSceneVisibleStore } from "../Stores/SelectCompanionStore";
import { selectCharacterSceneVisibleStore } from "../Stores/SelectCharacterStore";
import { adminMessagesService } from "./AdminMessagesService";
import { connectionManager } from "./ConnectionManager";
import type {
    GroupCreatedUpdatedMessageInterface,
    GroupUsersUpdateMessageInterface,
    MessageUserJoined,
    PlayGlobalMessageInterface,
    PositionInterface,
    RoomJoinedMessageInterface,
    ViewportInterface,
} from "./ConnexionModels";
import { localUserStore } from "./LocalUserStore";
import { ConnectionClosedError } from "./ConnectionClosedError";
import type { OnChatMessageOptions } from "../Api/Iframe/chat";

// This must be greater than RoomManager's PING_INTERVAL
const manualPingDelay = 100_000;

export class RoomConnection implements RoomConnection {
    onUserMoved(arg0: () => void) {
        throw new Error("Method not implemented.");
    }
    private static websocketFactory: null | ((url: string, protocols?: string[]) => any) = null; // eslint-disable-line @typescript-eslint/no-explicit-any
    public readonly socket: WebSocket;
    private userId: number | null = null;
    private _closed = false;
    private tags: string[] = [];
    private canEdit = false;

    public readonly _serverDisconnected = new Subject<void>();
    public readonly serverDisconnected = this._serverDisconnected.asObservable();

    private readonly _errorMessageStream = new Subject<ErrorMessageTsProto>();
    public readonly errorMessageStream = this._errorMessageStream.asObservable();
    private readonly _errorScreenMessageStream = new Subject<ErrorScreenMessageTsProto>();
    public readonly errorScreenMessageStream = this._errorScreenMessageStream.asObservable();
    private readonly _roomJoinedMessageStream = new Subject<{
        connection: RoomConnection;
        room: RoomJoinedMessageInterface;
    }>();
    public readonly roomJoinedMessageStream = this._roomJoinedMessageStream.asObservable();
    private readonly _teleportMessageMessageStream = new Subject<string>();
    public readonly teleportMessageMessageStream = this._teleportMessageMessageStream.asObservable();
    private readonly _worldFullMessageStream = new Subject<string | null>();
    public readonly worldFullMessageStream = this._worldFullMessageStream.asObservable();
    private readonly _worldConnectionMessageStream = new Subject<WorldConnectionMessage>();
    public readonly worldConnectionMessageStream = this._worldConnectionMessageStream.asObservable();
    private readonly _tokenExpiredMessageStream = new Subject<TokenExpiredMessage>();
    public readonly tokenExpiredMessageStream = this._tokenExpiredMessageStream.asObservable();
    private readonly _userMovedMessageStream = new Subject<UserMovedMessageTsProto>();
    public readonly userMovedMessageStream = this._userMovedMessageStream.asObservable();
    private readonly _groupUpdateMessageStream = new Subject<GroupCreatedUpdatedMessageInterface>();
    public readonly groupUpdateMessageStream = this._groupUpdateMessageStream.asObservable();
    private readonly _groupUsersUpdateMessageStream = new Subject<GroupUsersUpdateMessageInterface>();
    public readonly groupUsersUpdateMessageStream = this._groupUsersUpdateMessageStream.asObservable();
    private readonly _groupDeleteMessageStream = new Subject<GroupDeleteMessageTsProto>();
    public readonly groupDeleteMessageStream = this._groupDeleteMessageStream.asObservable();
    private readonly _userJoinedMessageStream = new Subject<MessageUserJoined>();
    public readonly userJoinedMessageStream = this._userJoinedMessageStream.asObservable();
    private readonly _userLeftMessageStream = new Subject<UserLeftMessageTsProto>();
    public readonly userLeftMessageStream = this._userLeftMessageStream.asObservable();
    private readonly _refreshRoomMessageStream = new Subject<RefreshRoomMessage>();
    public readonly refreshRoomMessageStream = this._refreshRoomMessageStream.asObservable();

    private readonly _followRequestMessageStream = new Subject<FollowRequestMessage>();
    public readonly followRequestMessageStream = this._followRequestMessageStream.asObservable();

    private readonly _followConfirmationMessageStream = new Subject<FollowConfirmationMessage>();
    public readonly followConfirmationMessageStream = this._followConfirmationMessageStream.asObservable();

    private readonly _followAbortMessageStream = new Subject<FollowAbortMessage>();
    public readonly followAbortMessageStream = this._followAbortMessageStream.asObservable();

    private readonly _itemEventMessageStream = new Subject<{
        itemId: number;
        event: string;
        parameters: unknown;
        state: unknown;
    }>();
    public readonly itemEventMessageStream = this._itemEventMessageStream.asObservable();
    private readonly _emoteEventMessageStream = new Subject<EmoteEventMessageTsProto>();
    public readonly emoteEventMessageStream = this._emoteEventMessageStream.asObservable();
    private readonly _variableMessageStream = new Subject<{ name: string; value: unknown }>();
    public readonly variableMessageStream = this._variableMessageStream.asObservable();
    private readonly _editMapCommandMessageStream = new Subject<EditMapCommandMessage>();
    public readonly editMapCommandMessageStream = this._editMapCommandMessageStream.asObservable();
    private readonly _playerDetailsUpdatedMessageStream = new Subject<PlayerDetailsUpdatedMessageTsProto>();
    public readonly playerDetailsUpdatedMessageStream = this._playerDetailsUpdatedMessageStream.asObservable();

    private readonly _websocketErrorStream = new Subject<Event>();
    public readonly websocketErrorStream = this._websocketErrorStream.asObservable();
    // Triggered if a "close" event is received from the WebSocket before a message is received
    private readonly _connectionErrorStream = new Subject<CloseEvent>();
    public readonly connectionErrorStream = this._connectionErrorStream.asObservable();
    // If this timeout triggers, we consider the connection is lost (no ping received)
    private timeout: ReturnType<typeof setInterval> | undefined = undefined;
    private readonly _moveToPositionMessageStream = new Subject<MoveToPositionMessageProto>();
    public readonly moveToPositionMessageStream = this._moveToPositionMessageStream.asObservable();
    private readonly _locatePositionMessageStream = new Subject<LocatePositionMessageProto>();
    public readonly locatePositionMessageStream = this._locatePositionMessageStream.asObservable();
    private readonly _initSpaceUsersMessageStream = new Subject<InitSpaceUsersMessage>();
    public readonly initSpaceUsersMessageStream = this._initSpaceUsersMessageStream.asObservable();
    private readonly _addSpaceUserMessageStream = new Subject<AddSpaceUserMessage>();
    public readonly addSpaceUserMessageStream = this._addSpaceUserMessageStream.asObservable();
    private readonly _updateSpaceUserMessageStream = new Subject<UpdateSpaceUserPusherToFrontMessage>();
    public readonly updateSpaceUserMessageStream = this._updateSpaceUserMessageStream.asObservable();
    private readonly _removeSpaceUserMessageStream = new Subject<RemoveSpaceUserPusherToFrontMessage>();
    public readonly removeSpaceUserMessageStream = this._removeSpaceUserMessageStream.asObservable();
    private readonly _updateSpaceMetadataMessageStream = new Subject<UpdateSpaceMetadataMessage>();
    public readonly updateSpaceMetadataMessageStream = this._updateSpaceMetadataMessageStream.asObservable();
    private readonly _megaphoneSettingsMessageStream = new BehaviorSubject<MegaphoneSettings | undefined>(undefined);
    public readonly megaphoneSettingsMessageStream = this._megaphoneSettingsMessageStream.asObservable();
    private readonly _receivedEventMessageStream = new Subject<ReceiveEventEvent>();
    public readonly receivedEventMessageStream = this._receivedEventMessageStream.asObservable();
    private readonly _spacePrivateMessageEvent = new Subject<PrivateEventPusherToFront>();
    public readonly spacePrivateMessageEvent = this._spacePrivateMessageEvent.asObservable();
    private readonly _spacePublicMessageEvent = new Subject<PublicEvent>();
    public readonly spacePublicMessageEvent = this._spacePublicMessageEvent.asObservable();
    private readonly _joinSpaceRequestMessage = new Subject<JoinSpaceRequestMessage>();
    public readonly joinSpaceRequestMessage = this._joinSpaceRequestMessage.asObservable();
    private readonly _leaveSpaceRequestMessage = new Subject<LeaveSpaceRequestMessage>();
    public readonly leaveSpaceRequestMessage = this._leaveSpaceRequestMessage.asObservable();
    private readonly _externalModuleMessage = new Subject<ExternalModuleMessage>();
    public readonly externalModuleMessage = this._externalModuleMessage.asObservable();
    private readonly _spaceDestroyedMessage = new Subject<SpaceDestroyedMessage>();
    public readonly spaceDestroyedMessage = this._spaceDestroyedMessage.asObservable();

    private queries = new Map<
        number,
        {
            answerType: string;
            resolve: (message: Required<AnswerMessage>["chatMembersAnswer"]) => void;
            reject: (e: unknown) => void;
        }
    >();
    private lastQueryId = 0;

    /**
     *
     * @param token A JWT token containing the email of the user
     * @param roomUrl The URL of the room in the form "https://example.com/_/[instance]/[map_url]" or "https://example.com/@/[org]/[event]/[map]"
     * @param name
     * @param characterTextureIds
     * @param position
     * @param viewport
     * @param companionTextureId
     * @param availabilityStatus
     * @param lastCommandId
     */
    public constructor(
        token: string | null,
        private roomUrl: string,
        name: string,
        characterTextureIds: string[],
        position: PositionInterface,
        viewport: ViewportInterface,
        companionTextureId: string | null,
        availabilityStatus: AvailabilityStatus,
        lastCommandId?: string
    ) {
        const urlObj = new URL("ws/room", ABSOLUTE_PUSHER_URL);
        urlObj.protocol = urlObj.protocol.replace("http", "ws");

        const params = urlObj.searchParams;
        params.set("roomId", roomUrl);
        params.set("name", name);
        for (const textureId of characterTextureIds) {
            params.append("characterTextureIds", textureId);
        }
        params.set("x", Math.floor(position.x).toString());
        params.set("y", Math.floor(position.y).toString());
        params.set("top", Math.floor(viewport.top).toString());
        params.set("bottom", Math.floor(viewport.bottom).toString());
        params.set("left", Math.floor(viewport.left).toString());
        params.set("right", Math.floor(viewport.right).toString());
        if (companionTextureId) {
            params.set("companionTextureId", companionTextureId);
        }
        params.set("availabilityStatus", availabilityStatus.toString());
        if (lastCommandId) {
            params.set("lastCommandId", lastCommandId);
        }
        params.set("version", apiVersionHash);
        params.set("chatID", localUserStore.getChatId() ?? "");
        params.set("roomName", gameManager.currentStartedRoom.roomName ?? "");
        params.set("cameraState", get(requestedCameraState) ? "true" : "false");
        params.set("microphoneState", get(requestedMicrophoneState) ? "true" : "false");
        // TODO: check if the screenSharingState variable is used
        params.set("screenSharingState", get(requestedScreenSharingState) ? "true" : "false");

        const url = urlObj.toString();
        let subProtocols: string[] | undefined = undefined;
        if (token) {
            // We abuse the subprotocols to pass the token to the server
            subProtocols = [token];
        }

        if (RoomConnection.websocketFactory) {
            this.socket = RoomConnection.websocketFactory(url, subProtocols);
        } else {
            this.socket = new WebSocket(url, subProtocols);
        }

        this.socket.binaryType = "arraybuffer";

        this.socket.onopen = () => {
            console.info("Socket has been opened");
            this.resetPingTimeout();
        };

        this.socket.addEventListener("close", this.handleSocketClose);

        this.socket.onmessage = (messageEvent) => {
    try {
        const arrayBuffer: ArrayBuffer = messageEvent.data;
        // We cast to 'any' here to stop the "Property message does not exist" loop 
        // while we switch to the flattened $case logic.
        const msg = ServerToClientMessageTsProto.decode(new Uint8Array(arrayBuffer)) as any;

        if (!msg || !msg.$case) {
            return;
        }

        switch (msg.$case) {
            case "batchMessage": {
                for (const subMessageWrapper of msg.batchMessage.payload) {
                    try {
                        // subMessage is now flattened too
                        const subMessage = subMessageWrapper as any;
                        if (!subMessage || !subMessage.$case) continue;

                        switch (subMessage.$case) {
                            case "errorMessage":
                                this._errorMessageStream.next(subMessage.errorMessage);
                                console.error("An error occurred server side: " + subMessage.errorMessage.message);
                                break;
                            case "userJoinedMessage":
                                this._userJoinedMessageStream.next(this.toMessageUserJoined(subMessage.userJoinedMessage));
                                break;
                            case "userLeftMessage":
                                this._userLeftMessageStream.next(subMessage.userLeftMessage);
                                break;
                            case "userMovedMessage":
                                this._userMovedMessageStream.next(subMessage.userMovedMessage);
                                break;
                            case "groupUpdateMessage":
                                this._groupUpdateMessageStream.next(this.toGroupCreatedUpdatedMessage(subMessage.groupUpdateMessage));
                                break;
                            case "groupDeleteMessage":
                                this._groupDeleteMessageStream.next(subMessage.groupDeleteMessage);
                                break;
                            case "itemEventMessage":
                                this._itemEventMessageStream.next({
                                    itemId: subMessage.itemEventMessage.itemId,
                                    event: subMessage.itemEventMessage.event,
                                    parameters: JSON.parse(subMessage.itemEventMessage.parametersJson),
                                    state: JSON.parse(subMessage.itemEventMessage.stateJson),
                                });
                                break;
                            case "emoteEventMessage":
                                this._emoteEventMessageStream.next(subMessage.emoteEventMessage);
                                break;
                            case "playerDetailsUpdatedMessage":
                                this._playerDetailsUpdatedMessageStream.next(subMessage.playerDetailsUpdatedMessage);
                                break;
                            case "variableMessage": {
                                const name = subMessage.variableMessage.name;
                                const value = RoomConnection.unserializeVariable(subMessage.variableMessage.value);
                                this._variableMessageStream.next({ name, value });
                                break;
                            }
                            case "pingMessage":
                                this.resetPingTimeout();
                                this.sendPong();
                                break;
                            case "editMapCommandMessage":
                                this._editMapCommandMessageStream.next(subMessage.editMapCommandMessage);
                                break;
                            case "initSpaceUsersMessage":
                                this._initSpaceUsersMessageStream.next(subMessage.initSpaceUsersMessage);
                                break;
                            case "addSpaceUserMessage":
                                this._addSpaceUserMessageStream.next(subMessage.addSpaceUserMessage);
                                break;
                            case "updateSpaceUserMessage":
                                this._updateSpaceUserMessageStream.next(subMessage.updateSpaceUserMessage);
                                break;
                            case "removeSpaceUserMessage":
                                this._removeSpaceUserMessageStream.next(subMessage.removeSpaceUserMessage);
                                break;
                            case "updateSpaceMetadataMessage":
                                this._updateSpaceMetadataMessageStream.next(subMessage.updateSpaceMetadataMessage);
                                break;
                            case "megaphoneSettingsMessage":
                                this._megaphoneSettingsMessageStream.next(subMessage.megaphoneSettingsMessage);
                                break;
                            case "receivedEventMessage":
                                this._receivedEventMessageStream.next({
                                    name: subMessage.receivedEventMessage.name,
                                    data: subMessage.receivedEventMessage.data,
                                    senderId: subMessage.receivedEventMessage.senderId,
                                });
                                break;
                            case "kickOffMessage": {
                                if (subMessage.kickOffMessage.userId !== this.userId?.toString()) break;
                                isSpeakerStore.set(false);
                                currentLiveStreamingSpaceStore.set(undefined);
                                const scene = gameManager.getCurrentGameScene();
                                scene.broadcastService.leaveSpace(subMessage.kickOffMessage.spaceName).catch((e) => {
                                    console.error("Error while leaving space", e);
                                    Sentry.captureException(e);
                                });
                                chatZoneLiveStore.set(false);
                                break;
                            }
                            case "publicEvent":
                                this._spacePublicMessageEvent.next(subMessage.publicEvent);
                                break;
                            case "privateEvent":
                                this._spacePrivateMessageEvent.next(subMessage.privateEvent);
                                break;
                            case "spaceDestroyedMessage":
                                this._spaceDestroyedMessage.next(subMessage.spaceDestroyedMessage);
                                break;
                            case "groupUsersUpdateMessage":
                                this._groupUsersUpdateMessageStream.next(subMessage.groupUsersUpdateMessage);
                                break;
                        }
                    } catch (e) {
                        console.error("Error while processing a submessage of a batchMessage", e);
                        Sentry.captureException(e);
                    }
                }
                break;
            }

            case "roomJoinedMessage": {
                const roomJoined = msg.roomJoinedMessage;
                const items: { [itemId: number]: unknown } = {};
                for (const item of roomJoined.item) {
                    items[item.itemId] = JSON.parse(item.stateJson);
                }
                const variables = new Map<string, unknown>();
                for (const variable of roomJoined.variable) {
                    variables.set(variable.name, RoomConnection.unserializeVariable(variable.value));
                }
                const playerVariables = new Map<string, unknown>();
                for (const variable of roomJoined.playerVariable) {
                    playerVariables.set(variable.name, RoomConnection.unserializeVariable(variable.value));
                }

                this.userId = roomJoined.currentUserId;
                this.tags = roomJoined.tag;
                this._userRoomToken = roomJoined.userRoomToken;
                inviteUserActivated.set(roomJoined.activatedInviteUser ?? true);
                this.canEdit = roomJoined.canEdit;
                mapEditorActivated.set(ENABLE_MAP_EDITOR && this.canEdit);

                const applications: ApplicationMessage[] = [];
                if (roomJoined.applications) {
                    roomJoined.applications.forEach((app: any) => {
                        if (!app.script) applications.push(app);
                        else iframeListener.registerScript(app.script).catch(console.error);
                    });
                }

                this._roomJoinedMessageStream.next({
                    connection: this,
                    room: {
                        items, variables, playerVariables,
                        characterTextures: roomJoined.characterTextures.map(this.mapWokaTextureToResourceDescription.bind(this)),
                        companionTexture: roomJoined.companionTexture,
                        commandsToApply: roomJoined.editMapCommandsArrayMessage?.editMapCommands,
                        applications
                    } as RoomJoinedMessageInterface,
                });

                if (roomJoined.megaphoneSettings) {
                    this._megaphoneSettingsMessageStream.next(roomJoined.megaphoneSettings);
                }
                break;
            }

            case "worldFullMessage":
                this._worldFullMessageStream.next(null);
                this.closeConnection();
                break;

            case "invalidCharacterTextureMessage":
                console.warn("Woka textures invalid. Redirecting...");
                this.goToSelectYourWokaScene();
                this.closeConnection();
                break;

            case "invalidCompanionTextureMessage":
                console.warn("Companion texture invalid. Redirecting...");
                this.goToSelectYourCompanionScene();
                this.closeConnection();
                break;

            case "tokenExpiredMessage":
                connectionManager.logout();
                this.closeConnection();
                break;

            case "worldConnectionMessage":
                this._worldFullMessageStream.next(msg.worldConnectionMessage.message);
                this.closeConnection();
                break;

            case "teleportMessageMessage":
                this._teleportMessageMessageStream.next(msg.teleportMessageMessage.map);
                break;

            case "sendUserMessage":
                adminMessagesService.onSendusermessage(msg.sendUserMessage);
                break;

            case "banUserMessage":
                adminMessagesService.onSendusermessage(msg.banUserMessage);
                break;

            case "worldFullWarningMessage":
                warningBannerStore.activateWarningContainer();
                break;

            case "refreshRoomMessage":
                this._refreshRoomMessageStream.next(msg.refreshRoomMessage);
                break;

            case "followRequestMessage":
                this._followRequestMessageStream.next(msg.followRequestMessage);
                break;

            case "followConfirmationMessage":
                this._followConfirmationMessageStream.next(msg.followConfirmationMessage);
                break;

            case "followAbortMessage":
                this._followAbortMessageStream.next(msg.followAbortMessage);
                break;

            case "errorMessage":
                this._errorMessageStream.next(msg.errorMessage);
                break;

            case "errorScreenMessage":
                this._errorScreenMessageStream.next(msg.errorScreenMessage);
                if (msg.errorScreenMessage.code !== "retry") this._closed = true;
                if (msg.errorScreenMessage.type === "redirect" && msg.errorScreenMessage.urlToRedirect) {
                    window.location.assign(msg.errorScreenMessage.urlToRedirect);
                } else {
                    errorScreenStore.setError(msg.errorScreenMessage);
                }
                break;

            case "moveToPositionMessage":
                if (msg.moveToPositionMessage?.position) {
                    gameManager.getCurrentGameScene()
                        .moveTo(msg.moveToPositionMessage.position, false, WOKA_SPEED * 2.5)
                        .catch(console.warn);
                }
                this._moveToPositionMessageStream.next(msg.moveToPositionMessage);
                break;

            case "locatePositionMessage":
                this._locatePositionMessageStream.next(msg.locatePositionMessage);
                break;

            case "answerMessage": {
                const queryId = msg.answerMessage.id;
                const query = this.queries.get(queryId);
                if (query) {
                    if (msg.answerMessage.answer?.$case === "error") {
                        query.reject(new Error(msg.answerMessage.answer.error.message));
                    } else {
                        query.resolve(msg.answerMessage.answer);
                    }
                    this.queries.delete(queryId);
                }
                break;
            }

            case "joinSpaceRequestMessage":
                this._joinSpaceRequestMessage.next(msg.joinSpaceRequestMessage);
                break;

            case "leaveSpaceRequestMessage":
                this._leaveSpaceRequestMessage.next(msg.leaveSpaceRequestMessage);
                break;

            case "externalModuleMessage":
                this._externalModuleMessage.next(msg.externalModuleMessage);
                break;
        }
    } catch (e) {
        console.error("Error while handling message from server", e);
        Sentry.captureException(e);
    }
};

        this.socket.addEventListener("error", this.handleSocketError);
    }

    // Event handlers as arrow function in order not to have to bind this explicitly
    private handleSocketClose = (event: CloseEvent) => {
        console.info("Socket has been closed", this.userId, this._closed, event);
        if (this.timeout) {
            clearTimeout(this.timeout);
        }

        // If we are not connected yet (if a JoinRoomMessage was not sent), we need to retry.
        if (this.userId === null && !this._closed) {
            this._connectionErrorStream.next(event);
            return;
        }

        this.cleanupConnection(event.code === 1000);
    };

    private handleSocketError = (event: Event) => {
        this._websocketErrorStream.next(event);
    };

    private cleanupConnection(isNormalClosure: boolean) {
        // Cleanup queries:
        for (const query of this.queries.values()) {
            query.reject(new ConnectionClosedError("Socket closed"));
        }

        this.completeStreams();

        if (this._closed || connectionManager.unloading) {
            return;
        }

        if (isNormalClosure) {
            // Normal closure case
            return;
        }

        this._serverDisconnected.next();
        this._serverDisconnected.complete();
    }

    private _userRoomToken: string | undefined;

    public get userRoomToken(): string | undefined {
        return this._userRoomToken;
    }

    get userCanEdit() {
        return this.canEdit;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public static setWebsocketFactory(websocketFactory: (url: string) => any): void {
        RoomConnection.websocketFactory = websocketFactory;
    }

    /**
     * Unserializes a string received from the server.
     * If the value cannot be unserialized, returns undefined and outputs a console error.
     */
    public static unserializeVariable(serializedValue: string): unknown {
        let value: unknown = undefined;
        if (serializedValue) {
            try {
                value = JSON.parse(serializedValue);
            } catch (e) {
                console.error(
                    "Unable to unserialize value received from server for a variable. " +
                        'Value received: "' +
                        serializedValue +
                        '". Error: ',
                    e
                );
            }
        }
        return value;
    }

   public emitPlayerShowVoiceIndicator(show: boolean): void {
        const setPlayerDetailsMessage = SetPlayerDetailsMessageTsProto.fromPartial({
            showVoiceIndicator: show,
        });
        this.send({
            $case: "setPlayerDetailsMessage",
            setPlayerDetailsMessage,
        } as any);
    }

    public emitPlayerStatusChange(availabilityStatus: AvailabilityStatus): void {
        const setPlayerDetailsMessage = SetPlayerDetailsMessageTsProto.fromPartial({
            availabilityStatus,
        });
        this.send({
            $case: "setPlayerDetailsMessage",
            setPlayerDetailsMessage,
        } as any);
    }

    public emitPlayerChatID(chatID: string): void {
        const setPlayerDetailsMessage = SetPlayerDetailsMessageTsProto.fromPartial({
            chatID,
        });
        this.send({
            $case: "setPlayerDetailsMessage",
            setPlayerDetailsMessage,
        } as any);
    }

    public emitPlayerOutlineColor(color: number | null) {
        let setPlayerDetailsMessage: SetPlayerDetailsMessageTsProto;
        if (color === null) {
            setPlayerDetailsMessage = SetPlayerDetailsMessageTsProto.fromPartial({
                removeOutlineColor: true,
            });
        } else {
            setPlayerDetailsMessage = SetPlayerDetailsMessageTsProto.fromPartial({
                outlineColor: color,
            });
        }
        this.send({
            $case: "setPlayerDetailsMessage",
            setPlayerDetailsMessage,
        } as any);
    }

    public emitPlayerSayMessage(sayMessage: SayMessage | undefined) {
        this.send({
            $case: "setPlayerDetailsMessage",
            setPlayerDetailsMessage: SetPlayerDetailsMessageTsProto.fromPartial({
                sayMessage,
            }),
        } as any);
    }

    public closeConnection(): void {
        this.socket?.close();
        this.cleanupConnection(true);
        this.socket?.removeEventListener("close", this.handleSocketClose);
        this.socket?.removeEventListener("error", this.handleSocketError);
        this._closed = true;
    }

    public sharePosition(
        x: number,
        y: number,
        direction: PositionMessage_Direction,
        moving: boolean,
        viewport: ViewportInterface
    ): void {
        if (!this.socket) {
            return;
        }

        const position = this.toPositionMessage(x, y, direction, moving);
        const viewportMessage = this.toViewportMessage(viewport);

        this.send({
            $case: "userMovesMessage",
            userMovesMessage: {
                position,
                viewport: viewportMessage,
            },
        } as any);
    }

    public setViewport(viewport: ViewportInterface): void {
        this.send({
            $case: "viewportMessage",
            viewportMessage: this.toViewportMessage(viewport),
        } as any);
    }

    public getUserId(): number {
        if (this.userId === null) throw new Error("UserId cannot be null!");
        return this.userId;
    }

    public getSpaceUserId(): string {
        return this.roomUrl + "_" + this.getUserId();
    }

    emitActionableEvent(itemId: number, event: string, state: unknown, parameters: unknown): void {
        this.send({
            $case: "itemEventMessage",
            itemEventMessage: {
                itemId,
                event,
                stateJson: JSON.stringify(state),
                parametersJson: JSON.stringify(parameters),
            },
        } as any);
    }

    emitSetVariableEvent(name: string, value: unknown): void {
        this.send({
            $case: "variableMessage",
            variableMessage: {
                name,
                value: JSON.stringify(value),
            },
        } as any);
    }

   public async emitScriptableEvent(name: string, data: unknown, targetUserIds: number[] | undefined): Promise<void> {
        const answer = await this.query({
            $case: "sendEventQuery",
            sendEventQuery: {
                name,
                data,
                targetUserIds: targetUserIds ?? [],
            },
        } as any);

        // We cast 'answer' to 'any' to access the flat $case property
        if ((answer as any).$case !== "sendEventAnswer") {
            throw new Error("Unexpected answer");
        }
        return;
    }

    public uploadAudio(file: FormData) {
        return axios
            .post<unknown>(`${UPLOADER_URL}/upload-audio-message`, file)
            .then((res: { data: unknown }) => {
                return res.data;
            })
            .catch((err) => {
                console.error(err);
                throw err;
            });
    }

    public emitGlobalMessage(message: PlayGlobalMessageInterface): void {
        this.send({
            $case: "playGlobalMessage",
            playGlobalMessage: {
                type: message.type,
                content: message.content,
                broadcastToWorld: message.broadcastToWorld,
            },
        } as any);
    }

    public emitReportPlayerMessage(reportedUserUuid: string, reportComment: string): void {
        this.send({
            $case: "reportPlayerMessage",
            reportPlayerMessage: {
                reportedUserUuid,
                reportComment,
            },
        } as any);
    }

    public emitBanPlayerMessage(banUserUuid: string, banUserName: string): void {
        this.send({
            $case: "banPlayerMessage",
            banPlayerMessage: {
                banUserUuid,
                banUserName,
            },
        } as any);
    }

    public hasTag(tag: string): boolean {
        return this.tags.includes(tag);
    }

    public isAdmin(): boolean {
        return this.hasTag("admin");
    }

    public emitEmoteEvent(emoteName: string): void {
        this.send({
            $case: "emotePromptMessage",
            emotePromptMessage: {
                emote: emoteName,
            },
        } as any);
    }

    public emitFollowRequest(forceFollow = false): void {
        if (!this.userId) {
            return;
        }

        this.send({
            $case: "followRequestMessage",
            followRequestMessage: {
                leader: this.userId,
                forceFollow,
            },
        } as any);
    }

    public emitFollowConfirmation(leaderId: number): void {
        if (!this.userId) {
            return;
        }

        this.send({
            $case: "followConfirmationMessage",
            followConfirmationMessage: {
                leader: leaderId,
                follower: this.userId,
            },
        } as any);
    }

    public emitFollowAbort(): void {
        const isLeader = get(followRoleStore) === "leader";
        if (!this.userId) {
            return;
        }

        this.send({
            $case: "followAbortMessage",
            followAbortMessage: {
                leader: isLeader ? this.userId : get(followUsersStore)[0],
                follower: isLeader ? 0 : this.userId,
            },
        } as any);
    }

    public emitLockGroup(lock = true): void {
        this.send({
            $case: "lockGroupPromptMessage",
            lockGroupPromptMessage: {
                lock,
            },
        } as any);
    }

    public emitMapEditorModifyArea(commandId: string, config: AtLeast<AreaData, "id">): void {
        if (config.x !== undefined) config.x = Math.round(config.x);
        if (config.y !== undefined) config.y = Math.round(config.y);
        if (config.width !== undefined) config.width = Math.round(config.width);
        if (config.height !== undefined) config.height = Math.round(config.height);
        
        this.send({
            $case: "editMapCommandMessage",
            editMapCommandMessage: {
                id: commandId,
                editMapMessage: {
                    modifyAreaMessage: {
                        ...config,
                        properties: config.properties ?? [],
                        modifyProperties: config.properties !== undefined,
                        modifyServerData: false,
                    },
                },
            },
        } as any);
    }

    public emitUpdateWAMSettingMessage(commandId: string, updateWAMSettingsMessage: UpdateWAMSettingsMessage) {
        this.send({
            $case: "editMapCommandMessage",
            editMapCommandMessage: {
                id: commandId,
                editMapMessage: {
                    updateWAMSettingsMessage,
                },
            },
        } as any);
    }

    public emitMapEditorDeleteArea(commandId: string, id: string): void {
        this.send({
            $case: "editMapCommandMessage",
            editMapCommandMessage: {
                id: commandId,
                editMapMessage: {
                    deleteAreaMessage: { id },
                },
            },
        } as any);
    }

    public emitMapEditorCreateArea(commandId: string, config: AreaData): void {
        if (config.x !== undefined) config.x = Math.round(config.x);
        if (config.y !== undefined) config.y = Math.round(config.y);
        if (config.width !== undefined) config.width = Math.round(config.width);
        if (config.height !== undefined) config.height = Math.round(config.height);
        
        this.send({
            $case: "editMapCommandMessage",
            editMapCommandMessage: {
                id: commandId,
                editMapMessage: {
                    createAreaMessage: config,
                },
            },
        } as any);
    }

    public emitMapEditorModifyEntity(
        commandId: string,
        entityId: string,
        config: AtLeast<WAMEntityData, "x" | "y">,
        entityDimensions: EntityDimensions
    ): void {
        this.send({
            $case: "editMapCommandMessage",
            editMapCommandMessage: {
                id: commandId,
                editMapMessage: {
                    modifyEntityMessage: {
                        ...config,
                        id: entityId,
                        properties: config.properties ?? [],
                        modifyProperties: config.properties !== undefined,
                        width: entityDimensions.width,
                        height: entityDimensions.height,
                    },
                },
            },
        } as any);
    }

    public emitMapEditorCreateEntity(
        commandId: string,
        entityId: string,
        config: WAMEntityData,
        entityDimensions: EntityDimensions
    ): void {
        this.send({
            $case: "editMapCommandMessage",
            editMapCommandMessage: {
                id: commandId,
                editMapMessage: {
                    createEntityMessage: {
                        id: entityId,
                        x: config.x,
                        y: config.y,
                        collectionName: config.prefabRef.collectionName,
                        prefabId: config.prefabRef.id,
                        properties: config.properties ?? [],
                        name: config.name,
                        width: entityDimensions.width,
                        height: entityDimensions.height,
                    },
                },
            },
        } as any);
    }

    public emitMapEditorDeleteEntity(commandId: string, id: string): void {
        this.send({
            $case: "editMapCommandMessage",
            editMapCommandMessage: {
                id: commandId,
                editMapMessage: {
                    deleteEntityMessage: { id },
                },
            },
        } as any);
    }

    public emitMapEditorUploadEntity(commandId: string, uploadEntityMessage: UploadEntityMessage): void {
        this.send({
            $case: "editMapCommandMessage",
            editMapCommandMessage: {
                id: commandId,
                editMapMessage: {
                    uploadEntityMessage,
                },
            },
        } as any);
    }

    public emitMapEditorUploadFile(commandId: string, uploadFileMessage: UploadFileMessage): void {
        this.send({
            $case: "editMapCommandMessage",
            editMapCommandMessage: {
                id: commandId,
                editMapMessage: {
                    uploadFileMessage,
                },
            },
        } as any);
    }

    public emitModifiyWAMMetadataMessage(
        commandId: string,
        modifiyWAMMetadataMessage: ModifiyWAMMetadataMessage
    ): void {
        this.send({
            $case: "editMapCommandMessage",
            editMapCommandMessage: {
                id: commandId,
                editMapMessage: {
                    modifiyWAMMetadataMessage,
                },
            },
        } as any);
    }

    public emitMapEditorModifyCustomEntity(
        commandId: string,
        modifyCustomEntityMessage: ModifyCustomEntityMessage
    ): void {
        this.send({
            $case: "editMapCommandMessage",
            editMapCommandMessage: {
                id: commandId,
                editMapMessage: {
                    modifyCustomEntityMessage,
                },
            },
        } as any);
    }

    public emitMapEditorDeleteCustomEntity(
        commandId: string,
        deleteCustomEntityMessage: DeleteCustomEntityMessage
    ): void {
        this.send({
            $case: "editMapCommandMessage",
            editMapCommandMessage: {
                id: commandId,
                editMapMessage: {
                    deleteCustomEntityMessage,
                },
            },
        } as any);
    }

    public getAllTags(): string[] {
        return this.tags;
    }

    public emitAskPosition(
        uuid: string,
        playUri: string,
        type: AskPositionMessage_AskType = AskPositionMessageAskType.MOVE
    ) {
        this.send({
            $case: "askPositionMessage",
            askPositionMessage: {
                userIdentifier: uuid,
                playUri,
                askType: type,
            },
        } as any);
    }

    public emitAddSpaceFilter(filter: AddSpaceFilterMessage) {
        this.send({
            $case: "addSpaceFilterMessage",
            addSpaceFilterMessage: filter,
        } as any);
    }

    public emitRemoveSpaceFilter(filter: RemoveSpaceFilterMessage) {
        this.send({
            $case: "removeSpaceFilterMessage",
            removeSpaceFilterMessage: filter,
        } as any);
    }

    public async queryJitsiJwtToken(jitsiRoom: string): Promise<JitsiJwtAnswer> {
        const answer = await this.query({
            $case: "jitsiJwtQuery",
            jitsiJwtQuery: { jitsiRoom },
        } as any);
        return (answer as any).jitsiJwtAnswer;
    }

    public async queryMapStorageJwtToken(signal?: AbortSignal): Promise<MapStorageJwtAnswer> {
        const answer = await this.query({
            $case: "mapStorageJwtQuery",
            mapStorageJwtQuery: {},
        } as any, { signal });
        return (answer as any).mapStorageJwtAnswer;
    }

    public async queryIceServers(): Promise<IceServersAnswer> {
        const answer = await this.query({
            $case: "iceServersQuery",
            iceServersQuery: {},
        } as any);
        return (answer as any).iceServersAnswer;
    }

    public async queryBBBMeetingUrl(
        meetingId: string,
        props: Map<string, string | number | boolean>
    ): Promise<JoinBBBMeetingAnswer> {
        const meetingName = props.get("meetingName") as string;
        const localMeetingId = props.get("bbbMeeting") as string;

        const answer = await this.query({
            $case: "joinBBBMeetingQuery",
            joinBBBMeetingQuery: {
                meetingId,
                localMeetingId,
                meetingName,
            },
        } as any);
        return (answer as any).joinBBBMeetingAnswer;
    }

    public emitPlayerSetVariable(event: SetPlayerVariableEvent): void {
        let scope: SetPlayerVariableMessage_Scope;
        switch (event.scope) {
            case "room":
                scope = SetPlayerVariableMessage_Scope.ROOM;
                break;
            case "world":
                scope = SetPlayerVariableMessage_Scope.WORLD;
                break;
            default:
                return;
        }

        this.send({
            $case: "setPlayerDetailsMessage",
            setPlayerDetailsMessage: SetPlayerDetailsMessageTsProto.fromPartial({
                setVariable: {
                    name: event.key,
                    value: JSON.stringify(event.value),
                    public: event.public,
                    ttl: event.ttl,
                    scope,
                    persist: event.persist,
                },
            }),
        } as any);
    }

    public async emitJoinSpace(
        spaceName: string,
        filterType: FilterType,
        propertiesToSync: string[],
        options?: { signal: AbortSignal }
    ): Promise<SpaceUser["spaceUserId"]> {
        const answer = await this.query({
            $case: "joinSpaceQuery",
            joinSpaceQuery: {
                spaceName,
                filterType,
                propertiesToSync,
            },
        } as any, options);

        return (answer as any).joinSpaceAnswer.spaceUserId;
    }

    public async emitLeaveSpace(spaceName: string): Promise<void> {
        await this.query({
            $case: "leaveSpaceQuery",
            leaveSpaceQuery: { spaceName },
        } as any);
    }

    public emitUpdateSpaceMetadata(spaceName: string, metadata: { [key: string]: unknown }): void {
        this.send({
            $case: "updateSpaceMetadataMessage",
            updateSpaceMetadataMessage: {
                spaceName,
                metadata: JSON.stringify(metadata),
            },
        } as any);
    }

    public emitUpdateSpaceUserMessage(spaceName: string, spaceUser: Omit<Partial<SpaceUser>, "id">): void {
        if (!this.userId) throw new Error("userId cannot be null");
        this.send({
            $case: "updateSpaceUserMessage",
            updateSpaceUserMessage: {
                spaceName,
                user: SpaceUser.fromPartial({
                    spaceUserId: this.getSpaceUserId(),
                    ...spaceUser,
                }),
                updateMask: generateFieldMask(spaceUser),
            },
        } as any);
    }

    public async queryRoomTags(): Promise<string[]> {
        const answer = await this.query({
            $case: "roomTagsQuery",
            roomTagsQuery: {},
        } as any);
        return (answer as any).roomTagsAnswer.tags;
    }

    public async queryRoomsFromSameWorld(): Promise<RoomShortDescription[]> {
        const answer = await this.query({
            $case: "roomsFromSameWorldQuery",
            roomsFromSameWorldQuery: {},
        } as any);
        return (answer as any).roomsFromSameWorldAnswer.roomDescriptions;
    }

    public async queryEmbeddableWebsite(url: string): Promise<EmbeddableWebsiteAnswer> {
        const answer = await this.query({
            $case: "embeddableWebsiteQuery",
            embeddableWebsiteQuery: { url },
        } as any);
        return (answer as any).embeddableWebsiteAnswer;
    }

    public async queryTags(searchText: string): Promise<string[]> {
        const answer = await this.query({
            $case: "searchTagsQuery",
            searchTagsQuery: { searchText },
        } as any);
        return (answer as any).searchTagsAnswer.tags;
    }

    public async queryMembers(searchText: string): Promise<Member[]> {
        const answer = await this.query({
            $case: "searchMemberQuery",
            searchMemberQuery: { searchText },
        } as any);
        return (answer as any).searchMemberAnswer.members;
    }

    public async queryMember(memberUUID: string): Promise<Member> {
        const answer = await this.query({
            $case: "getMemberQuery",
            getMemberQuery: {
                uuid: memberUUID,
            },
        } as any); // ASSERT AS ANY HERE

        // Cast 'answer' to any to access the flat properties
        const msg = answer as any;

        if (msg.$case !== "getMemberAnswer") {
            throw new Error("Unexpected answer");
        }
        if (msg.getMemberAnswer.member === undefined) {
            throw new Error("Member is undefined.");
        }
        return msg.getMemberAnswer.member;
    }

    public async queryChatMembers(searchText: string): Promise<ChatMembersAnswer> {
        const answer = await this.query({
            $case: "chatMembersQuery",
            chatMembersQuery: {
                searchText,
            },
        } as any); // ASSERT AS ANY HERE

        // Cast 'answer' to any to access the flat properties
        const msg = answer as any;

        if (msg.$case !== "chatMembersAnswer") {
            throw new Error("Unexpected answer");
        }
        return msg.chatMembersAnswer;
    }

    public async getOauthRefreshToken(
        tokenToRefresh: string,
        provider?: string,
        userIdentifier?: string
    ): Promise<OauthRefreshToken> {
        try {
            const answer = await this.query({
                $case: "oauthRefreshTokenQuery",
                oauthRefreshTokenQuery: {
                    tokenToRefresh,
                    provider,
                    userIdentifier,
                },
            } as any); // ASSERT AS ANY HERE

            // Cast 'answer' to any to access flat properties
            const msg = answer as any;

            if (msg.$case !== "oauthRefreshTokenAnswer") {
                throw new Error("Unexpected answer");
            }
            return msg.oauthRefreshTokenAnswer;
        } catch (error) {
            // FIXME: delete me when the fresh token query and answer are stable
            Debug(
                `RoomConnection => getOauthRefreshToken => Error getting oauth refresh token: ${
                    (error as Error).message
                }`
            );
            throw error;
        }
    }

    public emitUpdateChatId(email: string, chatId: string) {
        if (chatId && email) {
            this.send({
                $case: "updateChatIdMessage",
                updateChatIdMessage: {
                    email,
                    chatId,
                },
            } as any);
        }
    }

    public async queryEnterChatRoomArea(roomID: string): Promise<void> {
        const answer = await this.query({
            $case: "enterChatRoomAreaQuery",
            enterChatRoomAreaQuery: {
                roomID,
            },
        } as any);

        if ((answer as any).$case !== "enterChatRoomAreaAnswer") {
            throw new Error("Unexpected answer");
        }

        return;
    }

    public emitLeaveChatRoomArea(roomID: string): void {
        this.send({
            $case: "leaveChatRoomAreaMessage",
            leaveChatRoomAreaMessage: {
                roomID,
            },
        } as any);
    }

    private resetPingTimeout(): void {
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = undefined;
        }
        this.timeout = setTimeout(() => {
            console.warn(
                "Timeout detected. No ping from the server received. Is your connection down? Closing connection."
            );
            this.socket.close();
            this.cleanupConnection(false);
        }, manualPingDelay);
    }

    private sendPong(): void {
        this.send({
            $case: "pingMessage",
            pingMessage: {},
        } as any);
    }

    public emitPublicSpaceEvent(spaceName: string, spaceEvent: NonNullable<SpaceEvent["spaceIsTyping"]>): void {
        this.send({
            $case: "publicEvent",
            publicEvent: {
                spaceName,
                spaceEvent: {
                    event: spaceEvent,
                },
            } as any,
        } as any);
    }

    public emitPrivateSpaceEvent(
        spaceName: string,
        spaceEvent: NonNullable<PrivateSpaceEvent["muteAudio"]>,
        receiverUserId: string
    ): void {
        this.send({
            $case: "privateEvent",
            privateEvent: {
                spaceName,
                receiverUserId,
                spaceEvent: {
                    event: spaceEvent,
                },
            } as any,
        } as any);
    }

    private toPositionMessage(
        x: number,
        y: number,
        direction: PositionMessage_Direction,
        moving: boolean
    ): PositionMessageTsProto {
        return {
            x: Math.floor(x),
            y: Math.floor(y),
            moving,
            direction,
        };
    }

    private toViewportMessage(viewport: ViewportInterface): ViewportMessageTsProto {
        return {
            left: Math.floor(viewport.left),
            right: Math.floor(viewport.right),
            top: Math.floor(viewport.top),
            bottom: Math.floor(viewport.bottom),
        };
    }

    private mapWokaTextureToResourceDescription(texture: CharacterTextureMessage): WokaTextureDescriptionInterface {
        return {
            id: texture.id,
            url: texture.url,
        };
    }

    private mapCompanionTextureToResourceDescription(
        texture: CompanionTextureMessage
    ): CompanionTextureDescriptionInterface {
        return {
            id: texture.id,
            url: texture.url,
        };
    }

    private toMessageUserJoined(message: UserJoinedMessageTsProto): MessageUserJoined {
        const position = message.position;
        if (position === undefined) {
            throw new Error("Invalid JOIN_ROOM message");
        }

        const characterTextures = message.characterTextures.map(this.mapWokaTextureToResourceDescription.bind(this));
        const companionTexture = message.companionTexture
            ? this.mapCompanionTextureToResourceDescription(message.companionTexture)
            : undefined;

        const variables = new Map<string, unknown>();
        for (const variable of Object.entries(message.variables)) {
            variables.set(variable[0], RoomConnection.unserializeVariable(variable[1]));
        }

        return {
            userId: message.userId,
            name: message.name,
            characterTextures,
            visitCardUrl: message.visitCardUrl,
            position: position,
            availabilityStatus: message.availabilityStatus,
            companionTexture,
            userUuid: message.userUuid,
            outlineColor: message.hasOutline ? message.outlineColor : undefined,
            variables: variables,
            chatID: message.chatID,
            sayMessage: message.sayMessage,
        };
    }

    private toGroupCreatedUpdatedMessage(message: GroupUpdateMessageTsProto): GroupCreatedUpdatedMessageInterface {
        const position = message.position;
        if (position === undefined) {
            throw new Error("Missing position in GROUP_CREATE_UPDATE");
        }

        return {
            groupId: message.groupId,
            position: position,
            groupSize: message.groupSize?.toExponential? 0 : message.groupSize,
            locked: message.locked?.valueOf() ?? false,
            userIds: message.userIds,
        };
    }

    private completeStreams(): void {
        this._errorMessageStream.complete();
        this._errorScreenMessageStream.complete();
        this._roomJoinedMessageStream.complete();
        this._teleportMessageMessageStream.complete();
        this._worldFullMessageStream.complete();
        this._worldConnectionMessageStream.complete();
        this._tokenExpiredMessageStream.complete();
        this._userMovedMessageStream.complete();
        this._groupUpdateMessageStream.complete();
        this._groupUsersUpdateMessageStream.complete();
        this._groupDeleteMessageStream.complete();
        this._userJoinedMessageStream.complete();
        this._userLeftMessageStream.complete();
        this._refreshRoomMessageStream.complete();
        this._followRequestMessageStream.complete();
        this._followConfirmationMessageStream.complete();
        this._followAbortMessageStream.complete();
        this._itemEventMessageStream.complete();
        this._emoteEventMessageStream.complete();
        this._variableMessageStream.complete();
        this._editMapCommandMessageStream.complete();
        this._playerDetailsUpdatedMessageStream.complete();
        this._websocketErrorStream.complete();
        this._connectionErrorStream.complete();
        this._moveToPositionMessageStream.complete();
        this._addSpaceUserMessageStream.complete();
        this._updateSpaceUserMessageStream.complete();
        this._removeSpaceUserMessageStream.complete();
        this._updateSpaceMetadataMessageStream.complete();
        this._megaphoneSettingsMessageStream.complete();
        this._receivedEventMessageStream.complete();
        this._spacePrivateMessageEvent.complete();
        this._spacePublicMessageEvent.complete();
        this._joinSpaceRequestMessage.complete();
        this._leaveSpaceRequestMessage.complete();
        this._externalModuleMessage.complete();
        this._spaceDestroyedMessage.complete();
    }

    private goToSelectYourWokaScene(): void {
        menuVisiblilityStore.set(false);
        menuIconVisiblilityStore.set(false);
        selectCharacterSceneVisibleStore.set(true);
        gameManager.leaveGame(SelectCharacterSceneName, new SelectCharacterScene());
    }

    private goToSelectYourCompanionScene(): void {
        menuVisiblilityStore.set(false);
        menuIconVisiblilityStore.set(false);
        selectCompanionSceneVisibleStore.set(true);
        gameManager.leaveGame(SelectCompanionSceneName, new SelectCompanionScene());
    }

    private send(message: ClientToServerMessageTsProto): void {
        const encodedMessage = ClientToServerMessageTsProto.encode(message).finish();

        if (this.socket.readyState === WebSocket.CLOSING || this.socket.readyState === WebSocket.CLOSED) {
            console.warn("Trying to send a message to the server, but the connection is closed. Message: ", message);
            return;
        }

        this.socket.send(encodedMessage);
    }

    private query<T extends Required<QueryMessage>>(
        message: T,
        options?: {
            signal?: AbortSignal;
            timeout?: number;
        }
    ): Promise<Required<AnswerMessage>> {
        if (options?.signal?.aborted) {
            return Promise.reject(asError(options?.signal?.reason));
        }

        const signals: AbortSignal[] = [];
        if (options?.signal) {
            signals.push(options.signal);
        }
        signals.push(
            abortTimeout(options?.timeout ?? 15000, new AbortError("The query took too long and was aborted"))
        );
        const finalSignal = abortAny(signals);

        return new Promise<Required<AnswerMessage>>((resolve, reject) => {
            const msg = message as any;
            if (!msg.$case || !msg.$case.endsWith("Query")) {
                throw new Error("Query types are supposed to be suffixed with Query");
            }
            const answerType = msg.$case.substring(0, msg.$case.length - 5) + "Answer";

            const queryId = this.lastQueryId;
            const onAbort = () => {
                if (!this.queries.has(queryId)) {
                    return;
                }

                this.send({
                    $case: "abortQueryMessage",
                    abortQueryMessage: {
                        id: queryId,
                    },
                } as any);

                this.queries.set(queryId, {
                    answerType,
                    resolve: () => {},
                    reject: () => {},
                });

                setTimeout(() => {
                    this.queries.delete(queryId);
                }, 10000);
                reject(new AbortError());
            };

            finalSignal.addEventListener("abort", onAbort, { once: true });

            this.queries.set(queryId, {
                answerType,
                resolve: (res: any) => resolve(res),
                reject,
            });

            this.send({
                $case: "queryMessage",
                queryMessage: {
                    id: queryId,
                    query: message,
                },
            } as any);

            this.lastQueryId++;
        });
    }

    get closed(): boolean {
        return this._closed;
    }
}
 