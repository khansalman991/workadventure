import { BinaryReader, BinaryWriter } from "@bufbuild/protobuf/wire";
export declare const protobufPackage = "";
export declare enum AvailabilityStatus {
    UNCHANGED = 0,
    ONLINE = 1,
    SILENT = 2,
    AWAY = 3,
    JITSI = 4,
    BBB = 5,
    DENY_PROXIMITY_MEETING = 6,
    SPEAKER = 7,
    BUSY = 8,
    DO_NOT_DISTURB = 9,
    BACK_IN_A_MOMENT = 10,
    LIVEKIT = 11,
    LISTENER = 12,
    UNRECOGNIZED = -1
}
export declare function availabilityStatusFromJSON(object: any): AvailabilityStatus;
export declare function availabilityStatusToJSON(object: AvailabilityStatus): string;
export declare enum SayMessageType {
    SpeechBubble = 0,
    ThinkingCloud = 1,
    UNRECOGNIZED = -1
}
export declare function sayMessageTypeFromJSON(object: any): SayMessageType;
export declare function sayMessageTypeToJSON(object: SayMessageType): string;
export declare enum CustomEntityDirection {
    Up = 0,
    Right = 1,
    Down = 2,
    Left = 3,
    UNRECOGNIZED = -1
}
export declare function customEntityDirectionFromJSON(object: any): CustomEntityDirection;
export declare function customEntityDirectionToJSON(object: CustomEntityDirection): string;
export declare enum FilterType {
    ALL_USERS = 0,
    LIVE_STREAMING_USERS = 1,
    UNRECOGNIZED = -1
}
export declare function filterTypeFromJSON(object: any): FilterType;
export declare function filterTypeToJSON(object: FilterType): string;
export interface PositionMessage {
    x: number;
    y: number;
    direction: PositionMessage_Direction;
    moving: boolean;
}
export declare enum PositionMessage_Direction {
    UP = 0,
    RIGHT = 1,
    DOWN = 2,
    LEFT = 3,
    UNRECOGNIZED = -1
}
export declare function positionMessage_DirectionFromJSON(object: any): PositionMessage_Direction;
export declare function positionMessage_DirectionToJSON(object: PositionMessage_Direction): string;
export interface PointMessage {
    x: number;
    y: number;
}
export interface ViewportMessage {
    left: number;
    top: number;
    right: number;
    bottom: number;
}
export interface CharacterTextureMessage {
    url: string;
    id: string;
}
export interface ApplicationMessage {
    name: string;
    script?: string | undefined;
    doc?: string | undefined;
    description?: string | undefined;
    image?: string | undefined;
    enabled?: boolean | undefined;
    regexUrl?: string | undefined;
    targetUrl?: string | undefined;
    default?: boolean | undefined;
    forceNewTab?: boolean | undefined;
    allowAPI?: boolean | undefined;
    policy?: string | undefined;
    imageLogo?: string | undefined;
}
export interface CompanionTextureMessage {
    url: string;
    id: string;
}
/** Wrapper for all messages destined to a specific zone */
export interface ZoneMessage {
    x: number;
    y: number;
    userJoinedZoneMessage?: UserJoinedZoneMessage | undefined;
    groupUpdateZoneMessage?: GroupUpdateZoneMessage | undefined;
    userMovedMessage?: UserMovedMessage | undefined;
    groupLeftZoneMessage?: GroupLeftZoneMessage | undefined;
    userLeftZoneMessage?: UserLeftZoneMessage | undefined;
    emoteEventMessage?: EmoteEventMessage | undefined;
    playerDetailsUpdatedMessage?: PlayerDetailsUpdatedMessage | undefined;
    groupUsersUpdateMessage?: GroupUsersUpdateMessage | undefined;
}
export interface PingMessage {
}
export interface UpdateMapToNewestMessage {
    commandId?: string | undefined;
}
export interface UpdateMapToNewestWithKeyMessage {
    mapKey: string;
    updateMapToNewestMessage: UpdateMapToNewestMessage | undefined;
}
export interface SetPlayerDetailsMessage {
    outlineColor: number | undefined;
    removeOutlineColor: boolean | undefined;
    showVoiceIndicator: boolean | undefined;
    availabilityStatus: AvailabilityStatus;
    setVariable: SetPlayerVariableMessage | undefined;
    chatID: string;
    sayMessage: SayMessage | undefined;
}
export interface SayMessage {
    message: string;
    type: SayMessageType;
}
export interface UserMovesMessage {
    position: PositionMessage | undefined;
    viewport: ViewportMessage | undefined;
}
export interface WebRtcSignal {
    signal: string;
}
export interface ReportPlayerMessage {
    reportedUserUuid: string;
    reportComment: string;
}
export interface BanPlayerMessage {
    banUserUuid: string;
    banUserName: string;
}
export interface UpdateChatIdMessage {
    email: string;
    chatId: string;
}
export interface LeaveChatRoomAreaMessage {
    roomID: string;
}
export interface EmotePromptMessage {
    emote: string;
}
export interface EmoteEventMessage {
    actorUserId: number;
    emote: string;
}
export interface FollowRequestMessage {
    leader: number;
    forceFollow: boolean;
}
export interface FollowConfirmationMessage {
    leader: number;
    follower: number;
}
export interface FollowAbortMessage {
    leader: number;
    follower: number;
}
export interface LockGroupPromptMessage {
    lock: boolean;
}
export interface EditMapMessage {
    modifyAreaMessage?: ModifyAreaMessage | undefined;
    createAreaMessage?: CreateAreaMessage | undefined;
    deleteAreaMessage?: DeleteAreaMessage | undefined;
    modifyEntityMessage?: ModifyEntityMessage | undefined;
    createEntityMessage?: CreateEntityMessage | undefined;
    deleteEntityMessage?: DeleteEntityMessage | undefined;
    updateWAMSettingsMessage?: UpdateWAMSettingsMessage | undefined;
    errorCommandMessage?: ErrorCommandMessage | undefined;
    uploadEntityMessage?: UploadEntityMessage | undefined;
    modifyCustomEntityMessage?: ModifyCustomEntityMessage | undefined;
    deleteCustomEntityMessage?: DeleteCustomEntityMessage | undefined;
    modifiyWAMMetadataMessage?: ModifiyWAMMetadataMessage | undefined;
    uploadFileMessage?: UploadFileMessage | undefined;
}
export interface ErrorCommandMessage {
    reason: string;
}
export interface UpdateWAMSettingsMessage {
    updateMegaphoneSettingMessage?: UpdateMegaphoneSettingMessage | undefined;
}
export interface UpdateMegaphoneSettingMessage {
    enabled: boolean;
    title?: string | undefined;
    scope?: string | undefined;
    rights: string[];
}
export interface EditMapCommandMessage {
    id: string;
    editMapMessage: EditMapMessage | undefined;
}
export interface EditMapCommandsArrayMessage {
    editMapCommands: EditMapCommandMessage[];
}
export interface EditMapCommandWithKeyMessage {
    mapKey: string;
    editMapCommandMessage: EditMapCommandMessage | undefined;
    connectedUserTags: string[];
    userCanEdit: boolean;
    userUUID: string;
}
export interface ModifyAreaMessage {
    id: string;
    name?: string | undefined;
    x?: number | undefined;
    y?: number | undefined;
    width?: number | undefined;
    height?: number | undefined;
    properties: any[];
    modifyProperties?: boolean | undefined;
    modifyServerData?: boolean | undefined;
}
export interface DeleteAreaMessage {
    id: string;
}
export interface CreateAreaMessage {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    name: string;
    properties: any[];
}
export interface CreateEntityMessage {
    id: string;
    x: number;
    y: number;
    collectionName: string;
    prefabId: string;
    properties: any[];
    name?: string | undefined;
    width: number;
    height: number;
}
export interface DeleteEntityMessage {
    id: string;
}
export interface CollisionGridRow {
    row: number[];
}
export interface UploadEntityMessage {
    file: Uint8Array;
    id: string;
    name: string;
    tags: string[];
    imagePath: string;
    direction: CustomEntityDirection;
    color: string;
    collisionGrid?: any | undefined;
    depthOffset?: number | undefined;
}
export interface UploadFileMessage {
    file: Uint8Array;
    id: string;
    name: string;
    propertyId: string;
    areaId?: string | undefined;
    entityId?: string | undefined;
}
export interface ModifyCustomEntityMessage {
    id: string;
    name: string;
    tags: string[];
    collisionGrid?: any | undefined;
    depthOffset?: number | undefined;
}
export interface DeleteCustomEntityMessage {
    id: string;
}
export interface ModifyEntityMessage {
    id: string;
    x: number;
    y: number;
    properties: any[];
    modifyProperties?: boolean | undefined;
    name?: string | undefined;
    width: number;
    height: number;
}
export interface ClientToServerMessage {
    userMovesMessage?: UserMovesMessage | undefined;
    viewportMessage?: ViewportMessage | undefined;
    itemEventMessage?: ItemEventMessage | undefined;
    setPlayerDetailsMessage?: SetPlayerDetailsMessage | undefined;
    playGlobalMessage?: PlayGlobalMessage | undefined;
    reportPlayerMessage?: ReportPlayerMessage | undefined;
    emotePromptMessage?: EmotePromptMessage | undefined;
    variableMessage?: VariableMessage | undefined;
    followRequestMessage?: FollowRequestMessage | undefined;
    followConfirmationMessage?: FollowConfirmationMessage | undefined;
    followAbortMessage?: FollowAbortMessage | undefined;
    lockGroupPromptMessage?: LockGroupPromptMessage | undefined;
    queryMessage?: QueryMessage | undefined;
    abortQueryMessage?: AbortQueryMessage | undefined;
    pingMessage?: PingMessage | undefined;
    /** XmppMessage xmppMessage = 22; */
    askPositionMessage?: AskPositionMessage | undefined;
    editMapCommandMessage?: EditMapCommandMessage | undefined;
    addSpaceFilterMessage?: AddSpaceFilterMessage | undefined;
    removeSpaceFilterMessage?: RemoveSpaceFilterMessage | undefined;
    updateSpaceUserMessage?: UpdateSpaceUserMessage | undefined;
    updateSpaceMetadataMessage?: UpdateSpaceMetadataMessage | undefined;
    banPlayerMessage?: BanPlayerMessage | undefined;
    updateChatIdMessage?: UpdateChatIdMessage | undefined;
    publicEvent?: PublicEventFrontToPusher | undefined;
    privateEvent?: PrivateEventFrontToPusher | undefined;
    leaveChatRoomAreaMessage?: LeaveChatRoomAreaMessage | undefined;
}
export interface ReceivedEventMessage {
    name: string;
    data: any | undefined;
    senderId?: number | undefined;
}
export interface ModifiyWAMMetadataMessage {
    name: string;
    description?: string | undefined;
    copyright?: string | undefined;
    thumbnail?: string | undefined;
    tags?: string | undefined;
}
export interface ItemEventMessage {
    itemId: number;
    event: string;
    stateJson: string;
    parametersJson: string;
}
export interface VariableMessage {
    name: string;
    value: string;
}
export interface SetPlayerVariableMessage {
    name: string;
    value: string;
    public: boolean;
    persist: boolean;
    ttl: number | undefined;
    scope: SetPlayerVariableMessage_Scope;
}
export declare enum SetPlayerVariableMessage_Scope {
    ROOM = 0,
    WORLD = 1,
    UNRECOGNIZED = -1
}
export declare function setPlayerVariableMessage_ScopeFromJSON(object: any): SetPlayerVariableMessage_Scope;
export declare function setPlayerVariableMessage_ScopeToJSON(object: SetPlayerVariableMessage_Scope): string;
/** A variable, along the tag describing who it is targeted at */
export interface VariableWithTagMessage {
    name: string;
    value: string;
    readableBy: string;
}
export interface PlayGlobalMessage {
    type: string;
    content: string;
    broadcastToWorld: boolean;
}
export interface QueryMessage {
    id: number;
    jitsiJwtQuery?: JitsiJwtQuery | undefined;
    joinBBBMeetingQuery?: JoinBBBMeetingQuery | undefined;
    roomTagsQuery?: RoomTagsQuery | undefined;
    embeddableWebsiteQuery?: EmbeddableWebsiteQuery | undefined;
    roomsFromSameWorldQuery?: RoomsFromSameWorldQuery | undefined;
    sendEventQuery?: SendEventQuery | undefined;
    searchMemberQuery?: SearchMemberQuery | undefined;
    getMemberQuery?: GetMemberQuery | undefined;
    iceServersQuery?: IceServersQuery | undefined;
    chatMembersQuery?: ChatMembersQuery | undefined;
    searchTagsQuery?: SearchTagsQuery | undefined;
    oauthRefreshTokenQuery?: OauthRefreshTokenQuery | undefined;
    enterChatRoomAreaQuery?: EnterChatRoomAreaQuery | undefined;
    joinSpaceQuery?: JoinSpaceQuery | undefined;
    leaveSpaceQuery?: LeaveSpaceQuery | undefined;
    mapStorageJwtQuery?: MapStorageJwtQuery | undefined;
}
export interface AbortQueryMessage {
    id: number;
}
export interface MapStorageJwtQuery {
}
export interface JitsiJwtQuery {
    jitsiRoom: string;
}
export interface JoinBBBMeetingQuery {
    /** a hash of domain, instance and localMeetingId */
    meetingId: string;
    /** bbbMeeting field from the map */
    localMeetingId: string;
    /**
     * Fix me Pusher linter fails because eslint-plugin version < 3.0
     * map<string, string> userdata = 3;
     */
    meetingName: string;
}
export interface RoomTagsQuery {
}
export interface EmbeddableWebsiteQuery {
    url: string;
}
export interface RoomsFromSameWorldQuery {
}
export interface SendEventQuery {
    name: string;
    data: any | undefined;
    targetUserIds: number[];
}
export interface SearchMemberQuery {
    searchText: string;
}
export interface GetMemberQuery {
    uuid: string;
}
export interface ChatMembersQuery {
    searchText: string;
}
export interface OauthRefreshTokenQuery {
    tokenToRefresh: string;
    provider?: string | undefined;
    userIdentifier?: string | undefined;
}
export interface SearchTagsQuery {
    searchText: string;
}
export interface EnterChatRoomAreaQuery {
    roomID: string;
}
export interface JoinSpaceQuery {
    spaceName: string;
    filterType: FilterType;
    propertiesToSync: string[];
}
export interface LeaveSpaceQuery {
    spaceName: string;
}
export interface AnswerMessage {
    id: number;
    error?: ErrorMessage | undefined;
    jitsiJwtAnswer?: JitsiJwtAnswer | undefined;
    joinBBBMeetingAnswer?: JoinBBBMeetingAnswer | undefined;
    roomTagsAnswer?: RoomTagsAnswer | undefined;
    embeddableWebsiteAnswer?: EmbeddableWebsiteAnswer | undefined;
    roomsFromSameWorldAnswer?: RoomsFromSameWorldAnswer | undefined;
    sendEventAnswer?: SendEventAnswer | undefined;
    searchMemberAnswer?: SearchMemberAnswer | undefined;
    getMemberAnswer?: GetMemberAnswer | undefined;
    iceServersAnswer?: IceServersAnswer | undefined;
    chatMembersAnswer?: ChatMembersAnswer | undefined;
    searchTagsAnswer?: SearchTagsAnswer | undefined;
    oauthRefreshTokenAnswer?: OauthRefreshTokenAnswer | undefined;
    enterChatRoomAreaAnswer?: EnterChatRoomAreaAnswer | undefined;
    joinSpaceAnswer?: JoinSpaceAnswer | undefined;
    leaveSpaceAnswer?: LeaveSpaceAnswer | undefined;
    mapStorageJwtAnswer?: MapStorageJwtAnswer | undefined;
}
export interface JitsiJwtAnswer {
    jwt: string;
    url: string;
}
export interface MapStorageJwtAnswer {
    jwt: string;
}
export interface JoinBBBMeetingAnswer {
    meetingId: string;
    clientURL: string;
}
export interface RoomTagsAnswer {
    tags: string[];
}
export interface EmbeddableWebsiteAnswer {
    url: string;
    state: boolean;
    embeddable: boolean;
    message?: string | undefined;
}
export interface RoomShortDescription {
    name: string;
    roomUrl: string;
    wamUrl?: string | undefined;
    description?: string | undefined;
    copyright?: string | undefined;
    thumbnail?: string | undefined;
    areasSearchable?: number | undefined;
    entitiesSearchable?: number | undefined;
}
export interface RoomsFromSameWorldAnswer {
    roomDescriptions: RoomShortDescription[];
}
export interface SendEventAnswer {
}
export interface SearchMemberAnswer {
    members: Member[];
}
export interface GetMemberAnswer {
    member: Member | undefined;
}
export interface ChatMembersAnswer {
    total: number;
    members: ChatMember[];
}
export interface OauthRefreshTokenAnswer {
    message: string;
    token: string;
}
export interface EnterChatRoomAreaAnswer {
}
export interface JoinSpaceAnswer {
    spaceUserId: string;
}
export interface LeaveSpaceAnswer {
}
export interface Member {
    id: string;
    name?: string | undefined;
    email?: string | undefined;
    visitCardUrl?: string | undefined;
    chatID?: string | undefined;
}
export interface IceServer {
    urls: string[];
    username?: string | undefined;
    credential?: string | undefined;
    credentialType?: string | undefined;
}
export interface IceServersAnswer {
    iceServers: IceServer[];
}
export interface IceServersQuery {
}
export interface ChatMember {
    uuid: string;
    wokaName?: string | undefined;
    email?: string | undefined;
    chatId?: string | undefined;
    tags: string[];
}
export interface SearchTagsAnswer {
    tags: string[];
}
export interface SpaceQueryMessage {
    id: number;
    spaceName: string;
    addSpaceUserQuery?: AddSpaceUserQuery | undefined;
    removeSpaceUserQuery?: RemoveSpaceUserQuery | undefined;
}
export interface AddSpaceUserQuery {
    spaceName: string;
    user: SpaceUser | undefined;
    filterType: FilterType;
}
export interface RemoveSpaceUserQuery {
    spaceName: string;
    spaceUserId: string;
}
export interface SpaceAnswerMessage {
    id: number;
    spaceName: string;
    error?: ErrorMessage | undefined;
    addSpaceUserAnswer?: AddSpaceUserAnswer | undefined;
    removeSpaceUserAnswer?: RemoveSpaceUserAnswer | undefined;
    joinSpaceAnswer?: JoinSpaceAnswer | undefined;
    leaveSpaceAnswer?: LeaveSpaceAnswer | undefined;
}
export interface AddSpaceUserAnswer {
    spaceName: string;
    spaceUserId: string;
}
export interface RemoveSpaceUserAnswer {
    spaceName: string;
    spaceUserId: string;
}
export interface UserMovedMessage {
    userId: number;
    position: PositionMessage | undefined;
}
export interface MoveToPositionMessage {
    position: PositionMessage | undefined;
}
export interface LocatePositionMessage {
    position: PositionMessage | undefined;
    userId: number;
}
export interface SubMessage {
    userMovedMessage?: UserMovedMessage | undefined;
    groupUpdateMessage?: GroupUpdateMessage | undefined;
    groupDeleteMessage?: GroupDeleteMessage | undefined;
    userJoinedMessage?: UserJoinedMessage | undefined;
    userLeftMessage?: UserLeftMessage | undefined;
    itemEventMessage?: ItemEventMessage | undefined;
    emoteEventMessage?: EmoteEventMessage | undefined;
    variableMessage?: VariableMessage | undefined;
    errorMessage?: ErrorMessage | undefined;
    playerDetailsUpdatedMessage?: PlayerDetailsUpdatedMessage | undefined;
    pingMessage?: PingMessage | undefined;
    editMapCommandMessage?: EditMapCommandMessage | undefined;
    addSpaceUserMessage?: AddSpaceUserMessage | undefined;
    updateSpaceUserMessage?: UpdateSpaceUserPusherToFrontMessage | undefined;
    removeSpaceUserMessage?: RemoveSpaceUserPusherToFrontMessage | undefined;
    megaphoneSettingsMessage?: MegaphoneSettings | undefined;
    receivedEventMessage?: ReceivedEventMessage | undefined;
    updateSpaceMetadataMessage?: UpdateSpaceMetadataMessage | undefined;
    groupUsersUpdateMessage?: GroupUsersUpdateMessage | undefined;
    /** FIXME: remove all this */
    kickOffMessage?: KickOffMessage | undefined;
    publicEvent?: PublicEvent | undefined;
    privateEvent?: PrivateEventPusherToFront | undefined;
    spaceDestroyedMessage?: SpaceDestroyedMessage | undefined;
    initSpaceUsersMessage?: InitSpaceUsersMessage | undefined;
}
export interface BatchMessage {
    /** FIXME: event seems to be useless */
    event: string;
    payload: SubMessage[];
}
export interface GroupUpdateMessage {
    groupId: number;
    position: PointMessage | undefined;
    groupSize: number | undefined;
    locked: boolean | undefined;
    userIds: number[];
}
export interface GroupDeleteMessage {
    groupId: number;
}
export interface UserJoinedMessage {
    userId: number;
    name: string;
    characterTextures: CharacterTextureMessage[];
    position: PositionMessage | undefined;
    companionTexture: CompanionTextureMessage | undefined;
    visitCardUrl: string;
    userUuid: string;
    outlineColor: number;
    hasOutline: boolean;
    availabilityStatus: AvailabilityStatus;
    variables: {
        [key: string]: string;
    };
    chatID?: string | undefined;
    sayMessage: SayMessage | undefined;
}
export interface UserJoinedMessage_VariablesEntry {
    key: string;
    value: string;
}
export interface UserLeftMessage {
    userId: number;
}
/** ErrorMessage is only used to console.error the message in the front */
export interface ErrorMessage {
    message: string;
}
/** ErrorScreenMessage is used to show the ErrorScreen in the front */
export interface ErrorScreenMessage {
    type: string;
    code: string | undefined;
    title: string | undefined;
    subtitle: string | undefined;
    details: string | undefined;
    timeToRetry: number | undefined;
    canRetryManual: boolean | undefined;
    urlToRedirect: string | undefined;
    buttonTitle: string | undefined;
    image: string | undefined;
    imageLogo: string | undefined;
}
export interface ItemStateMessage {
    itemId: number;
    stateJson: string;
}
export interface GroupUsersUpdateMessage {
    groupId: number;
    userIds: number[];
}
export interface RoomJoinedMessage {
    /**
     * repeated UserJoinedMessage user = 1;
     * repeated GroupUpdateMessage group = 2;
     */
    item: ItemStateMessage[];
    currentUserId: number;
    tag: string[];
    variable: VariableMessage[];
    userRoomToken: string;
    /** We send the current skin of the current player. */
    characterTextures: CharacterTextureMessage[];
    activatedInviteUser: boolean;
    playerVariable: VariableMessage[];
    applications: ApplicationMessage[];
    editMapCommandsArrayMessage: EditMapCommandsArrayMessage | undefined;
    canEdit: boolean;
    megaphoneSettings: MegaphoneSettings | undefined;
    companionTexture: CompanionTextureMessage | undefined;
}
export interface MegaphoneSettings {
    enabled: boolean;
    url?: string | undefined;
}
export interface WebRtcStartMessage {
    userId: string;
    initiator: boolean;
}
export interface WebRtcDisconnectMessage {
    userId: string;
}
export interface TeleportMessageMessage {
    map: string;
}
export interface SendUserMessage {
    type: string;
    message: string;
}
export interface WorldFullWarningMessage {
}
export interface WorldFullWarningToRoomMessage {
    roomId: string;
}
export interface RefreshRoomPromptMessage {
    roomId: string;
}
export interface RefreshRoomMessage {
    roomId: string;
    versionNumber: number;
    timeToRefresh?: number | undefined;
}
export interface WorldFullMessage {
}
export interface TokenExpiredMessage {
}
export interface InvalidCharacterTextureMessage {
    message: string;
}
export interface InvalidCompanionTextureMessage {
    message: string;
}
export interface WorldConnectionMessage {
    message: string;
}
export interface BanUserMessage {
    type: string;
    message: string;
}
export interface AskPositionMessage {
    userIdentifier: string;
    playUri: string;
    askType: AskPositionMessage_AskType;
}
export declare enum AskPositionMessage_AskType {
    MOVE = 0,
    LOCATE = 1,
    UNRECOGNIZED = -1
}
export declare function askPositionMessage_AskTypeFromJSON(object: any): AskPositionMessage_AskType;
export declare function askPositionMessage_AskTypeToJSON(object: AskPositionMessage_AskType): string;
/** A request sent within a space to mute the audio of a specific user */
export interface MuteAudioPrivateMessage {
    /** The "force" field is filled by the pusher server if the user is an admin */
    force: boolean;
}
/** A request sent within a space to mute the video of a specific user */
export interface MuteVideoPrivateMessage {
    /** The "force" field is filled by the pusher server if the user is an admin */
    force: boolean;
}
export interface MuteAudioForEverybodyPublicMessage {
}
export interface MuteVideoForEverybodyPublicMessage {
}
export interface KickOffUserPrivateMessage {
}
export interface PublicEventFrontToPusher {
    spaceName: string;
    spaceEvent: SpaceEvent | undefined;
}
export interface PublicEvent {
    spaceName: string;
    spaceEvent: SpaceEvent | undefined;
    senderUserId: string;
}
export interface SpaceEvent {
    spaceMessage?: SpaceMessage | undefined;
    spaceIsTyping?: SpaceIsTyping | undefined;
    muteAudioForEverybody?: MuteAudioForEverybodyPublicMessage | undefined;
    muteVideoForEverybody?: MuteVideoForEverybodyPublicMessage | undefined;
}
export interface PrivateSpaceEvent {
    muteVideo?: MuteVideoPrivateMessage | undefined;
    muteAudio?: MuteAudioPrivateMessage | undefined;
    kickOffUser?: KickOffUserPrivateMessage | undefined;
    webRtcStartMessage?: WebRtcStartMessage | undefined;
    webRtcSignal?: WebRtcSignal | undefined;
    webRtcScreenSharingSignal?: WebRtcSignal | undefined;
    webRtcDisconnectMessage?: WebRtcDisconnectMessage | undefined;
    communicationStrategyMessage?: CommunicationStrategyMessage | undefined;
    switchMessage?: SwitchMessage | undefined;
    finalizeSwitchMessage?: FinalizeSwitchMessage | undefined;
    livekitInvitationMessage?: LivekitInvitationMessage | undefined;
    livekitDisconnectMessage?: LivekitDisconnectMessage | undefined;
    addSpaceUserMessage?: AddSpaceUserMessage | undefined;
    updateSpaceUserMessage?: UpdateSpaceUserMessage | undefined;
    removeSpaceUserMessage?: RemoveSpaceUserMessage | undefined;
    blockUserMessage?: BlockUserMessage | undefined;
    unblockUserMessage?: UnblockUserMessage | undefined;
}
export interface CommunicationStrategyMessage {
    strategy: string;
}
export interface SwitchMessage {
    strategy: string;
}
export interface FinalizeSwitchMessage {
    strategy: string;
}
export interface BlockUserMessage {
}
export interface UnblockUserMessage {
}
export interface LivekitInvitationMessage {
    token: string;
    serverUrl: string;
}
export interface LivekitDisconnectMessage {
}
export interface SpaceMessage {
    message: string;
    characterTextures: CharacterTextureMessage[];
    name?: string | undefined;
}
export interface SpaceIsTyping {
    isTyping: boolean;
    characterTextures: CharacterTextureMessage[];
    name?: string | undefined;
}
export interface PrivateEvent {
    spaceName: string;
    receiverUserId: string;
    senderUserId: string;
    spaceEvent: PrivateSpaceEvent | undefined;
}
export interface PrivateEventBackToPusher {
    spaceName: string;
    receiverUserId: string;
    sender: SpaceUser | undefined;
    spaceEvent: PrivateSpaceEvent | undefined;
}
export interface PrivateEventPusherToFront {
    spaceName: string;
    receiverUserId: string;
    sender: SpaceUser | undefined;
    spaceEvent: PrivateSpaceEvent | undefined;
}
export interface PrivateEventFrontToPusher {
    spaceName: string;
    receiverUserId: string;
    spaceEvent: PrivateSpaceEvent | undefined;
}
/** Messages going from server to the client to ask the client to join a space */
export interface JoinSpaceRequestMessage {
    spaceName: string;
    propertiesToSync: string[];
}
/** Messages going from server to the client to ask the client to leave a space */
export interface LeaveSpaceRequestMessage {
    spaceName: string;
}
/** Messages going from back and pusher to the front */
export interface ServerToClientMessage {
    batchMessage?: BatchMessage | undefined;
    errorMessage?: ErrorMessage | undefined;
    roomJoinedMessage?: RoomJoinedMessage | undefined;
    teleportMessageMessage?: TeleportMessageMessage | undefined;
    sendUserMessage?: SendUserMessage | undefined;
    banUserMessage?: BanUserMessage | undefined;
    /** AdminRoomMessage adminRoomMessage = 14; */
    worldFullWarningMessage?: WorldFullWarningMessage | undefined;
    worldFullMessage?: WorldFullMessage | undefined;
    refreshRoomMessage?: RefreshRoomMessage | undefined;
    worldConnectionMessage?: WorldConnectionMessage | undefined;
    /** EmoteEventMessage emoteEventMessage = 19; */
    tokenExpiredMessage?: TokenExpiredMessage | undefined;
    followRequestMessage?: FollowRequestMessage | undefined;
    followConfirmationMessage?: FollowConfirmationMessage | undefined;
    followAbortMessage?: FollowAbortMessage | undefined;
    invalidCharacterTextureMessage?: InvalidCharacterTextureMessage | undefined;
    errorScreenMessage?: ErrorScreenMessage | undefined;
    answerMessage?: AnswerMessage | undefined;
    moveToPositionMessage?: MoveToPositionMessage | undefined;
    invalidCompanionTextureMessage?: InvalidCompanionTextureMessage | undefined;
    joinSpaceRequestMessage?: JoinSpaceRequestMessage | undefined;
    leaveSpaceRequestMessage?: LeaveSpaceRequestMessage | undefined;
    externalModuleMessage?: ExternalModuleMessage | undefined;
    locatePositionMessage?: LocatePositionMessage | undefined;
}
export interface JoinRoomMessage {
    positionMessage: PositionMessage | undefined;
    name: string;
    characterTextures: CharacterTextureMessage[];
    userUuid: string;
    roomId: string;
    tag: string[];
    IPAddress: string;
    companionTexture: CompanionTextureMessage | undefined;
    visitCardUrl: string | undefined;
    userRoomToken: string;
    availabilityStatus: AvailabilityStatus;
    activatedInviteUser: boolean;
    isLogged: boolean;
    applications: ApplicationMessage[];
    lastCommandId: string | undefined;
    canEdit: boolean;
    chatID: string | undefined;
}
export interface UserJoinedZoneMessage {
    userId: number;
    name: string;
    characterTextures: CharacterTextureMessage[];
    position: PositionMessage | undefined;
    fromZone: Zone | undefined;
    companionTexture: CompanionTextureMessage | undefined;
    visitCardUrl: string;
    userUuid: string;
    outlineColor: number;
    hasOutline: boolean;
    availabilityStatus: AvailabilityStatus;
    variables: {
        [key: string]: string;
    };
    chatID?: string | undefined;
    sayMessage: SayMessage | undefined;
}
export interface UserJoinedZoneMessage_VariablesEntry {
    key: string;
    value: string;
}
export interface UserLeftZoneMessage {
    userId: number;
    toZone: Zone | undefined;
}
export interface GroupUpdateZoneMessage {
    groupId: number;
    position: PointMessage | undefined;
    groupSize: number;
    fromZone: Zone | undefined;
    locked: boolean;
    userIds: number[];
}
export interface GroupLeftZoneMessage {
    groupId: number;
    toZone: Zone | undefined;
}
export interface PlayerDetailsUpdatedMessage {
    userId: number;
    details: SetPlayerDetailsMessage | undefined;
}
export interface Zone {
    x: number;
    y: number;
}
export interface SubscribeZoneMessage {
    x: number;
    y: number;
}
export interface UnsubscribeZoneMessage {
    x: number;
    y: number;
}
export interface RoomMessage {
    roomId: string;
}
export interface PusherToBackRoomMessage {
    initRoomMessage?: InitRoomMessage | undefined;
    subscribeZoneMessage?: SubscribeZoneMessage | undefined;
    unsubscribeZoneMessage?: UnsubscribeZoneMessage | undefined;
}
export interface InitRoomMessage {
    roomId: string;
}
export interface PusherToBackMessage {
    joinRoomMessage?: JoinRoomMessage | undefined;
    userMovesMessage?: UserMovesMessage | undefined;
    itemEventMessage?: ItemEventMessage | undefined;
    setPlayerDetailsMessage?: SetPlayerDetailsMessage | undefined;
    sendUserMessage?: SendUserMessage | undefined;
    banUserMessage?: BanUserMessage | undefined;
    emotePromptMessage?: EmotePromptMessage | undefined;
    variableMessage?: VariableMessage | undefined;
    followRequestMessage?: FollowRequestMessage | undefined;
    followConfirmationMessage?: FollowConfirmationMessage | undefined;
    followAbortMessage?: FollowAbortMessage | undefined;
    lockGroupPromptMessage?: LockGroupPromptMessage | undefined;
    queryMessage?: QueryMessage | undefined;
    abortQueryMessage?: AbortQueryMessage | undefined;
    askPositionMessage?: AskPositionMessage | undefined;
    editMapCommandMessage?: EditMapCommandMessage | undefined;
    pingMessage?: PingMessage | undefined;
    publicEvent?: PublicEvent | undefined;
    privateEvent?: PrivateEvent | undefined;
}
export interface BatchToPusherRoomMessage {
    payload: SubToPusherRoomMessage[];
}
export interface SubToPusherRoomMessage {
    /** Room-wide messages */
    variableMessage?: VariableWithTagMessage | undefined;
    errorMessage?: ErrorMessage | undefined;
    editMapCommandMessage?: EditMapCommandMessage | undefined;
    receivedEventMessage?: ReceivedEventMessage | undefined;
    /** Zone-specific messages (all grouped in ZoneMessage) */
    zoneMessage?: ZoneMessage | undefined;
}
export interface UserJoinedRoomMessage {
    uuid: string;
    ipAddress: string;
    name: string;
}
export interface UserLeftRoomMessage {
    uuid: string;
}
export interface ServerToAdminClientMessage {
    userJoinedRoom?: UserJoinedRoomMessage | undefined;
    userLeftRoom?: UserLeftRoomMessage | undefined;
    errorMessage?: ErrorMessage | undefined;
}
export interface AdminPusherToBackMessage {
    /** TODO ban, unban */
    subscribeToRoom?: string | undefined;
}
export interface MapStorageRefreshMessage {
    comment: string;
}
export interface MapStorageToBackMessage {
    mapStorageRefreshMessage?: MapStorageRefreshMessage | undefined;
}
export interface MapStorageUrlMessage {
    mapUrl: string;
    roomId: string;
}
export interface MapStorageClearAfterUploadMessage {
    wamUrl: string;
}
/** A message sent by an administrator to a recipient */
export interface AdminMessage {
    message: string;
    recipientUuid: string;
    roomId: string;
    type: string;
}
/** A message sent by an administrator to everyone in a specific room */
export interface AdminRoomMessage {
    message: string;
    roomId: string;
    type: string;
}
/** A message sent by an administrator to absolutely everybody */
export interface AdminGlobalMessage {
    message: string;
}
export interface BanMessage {
    recipientUuid: string;
    roomId: string;
    type: string;
    message: string;
}
export interface RoomDescription {
    roomId: string;
    nbUsers: number;
}
export interface RoomsList {
    roomDescription: RoomDescription[];
}
export interface DispatchGlobalEventRequest {
    name: string;
    value: any | undefined;
}
export interface ExternalModuleMessage {
    moduleId: string;
    recipientUuid?: string | undefined;
    roomId?: string | undefined;
    message: any | undefined;
}
/**
 * ******************************************************************************
 * Start Spaces messages
 * ******************************************************************************
 */
export interface PusherToBackSpaceMessage {
    joinSpaceMessage?: JoinSpaceMessage | undefined;
    leaveSpaceMessage?: LeaveSpaceMessage | undefined;
    updateSpaceUserMessage?: UpdateSpaceUserMessage | undefined;
    pongMessage?: PingMessage | undefined;
    updateSpaceMetadataMessage?: UpdateSpaceMetadataMessage | undefined;
    /** FIXME: the kick of message should be global to the room (unless we apply it on the world space???) */
    kickOffMessage?: KickOffMessage | undefined;
    publicEvent?: PublicEvent | undefined;
    privateEvent?: PrivateEvent | undefined;
    syncSpaceUsersMessage?: SyncSpaceUsersMessage | undefined;
    spaceQueryMessage?: SpaceQueryMessage | undefined;
    addSpaceUserToNotifyMessage?: AddSpaceUserToNotifyMessage | undefined;
    deleteSpaceUserToNotifyMessage?: DeleteSpaceUserToNotifyMessage | undefined;
}
export interface BackToPusherSpaceMessage {
    addSpaceUserMessage?: AddSpaceUserMessage | undefined;
    updateSpaceUserMessage?: UpdateSpaceUserMessage | undefined;
    removeSpaceUserMessage?: RemoveSpaceUserMessage | undefined;
    pingMessage?: PingMessage | undefined;
    updateSpaceMetadataMessage?: UpdateSpaceMetadataMessage | undefined;
    /** FIXME: the kick of message should be global to the room (unless we apply it on the world space???) */
    kickOffMessage?: KickOffMessage | undefined;
    publicEvent?: PublicEvent | undefined;
    privateEvent?: PrivateEventBackToPusher | undefined;
    spaceAnswerMessage?: SpaceAnswerMessage | undefined;
    initSpaceUsersMessage?: InitSpaceUsersMessage | undefined;
}
/** Message sent by the user to join a space as a participant. */
export interface JoinSpaceMessage {
    spaceName: string;
    propertiesToSync: string[];
    filterType: FilterType;
    world: string;
}
export interface LeaveSpaceMessage {
    spaceName: string;
}
export interface SpaceUser {
    /** used */
    spaceUserId: string;
    /** used */
    name: string;
    playUri: string;
    /** TO DELETE */
    color: string;
    characterTextures: CharacterTextureMessage[];
    isLogged: boolean;
    availabilityStatus: number;
    roomName: string | undefined;
    visitCardUrl: string | undefined;
    tags: string[];
    /** used */
    cameraState: boolean;
    /** used */
    microphoneState: boolean;
    /** used */
    screenSharingState: boolean;
    /** used */
    megaphoneState: boolean;
    /** used */
    jitsiParticipantId: string | undefined;
    /** used */
    uuid: string;
    /** used */
    chatID: string | undefined;
    showVoiceIndicator: boolean;
}
/** Message adding a user to a space (front to pusher, pusher to back-space, back-space to pusher) */
export interface AddSpaceUserMessage {
    spaceName: string;
    user: SpaceUser | undefined;
}
export interface InitSpaceUsersMessage {
    spaceName: string;
    users: SpaceUser[];
}
/** Message updating a user in a space (front to pusher, pusher to back-space, back-space to pusher) */
export interface UpdateSpaceUserMessage {
    spaceName: string;
    user: SpaceUser | undefined;
    updateMask: string[] | undefined;
}
export interface UpdateSpaceUserPusherToFrontMessage {
    spaceName: string;
    user: SpaceUser | undefined;
    updateMask: string[] | undefined;
}
/** Message removing a user from a space (front to pusher, pusher to back-space, back-space to pusher) */
export interface RemoveSpaceUserMessage {
    spaceName: string;
    spaceUserId: string;
}
export interface RemoveSpaceUserPusherToFrontMessage {
    spaceName: string;
    spaceUserId: string;
}
export interface UpdateSpaceMetadataMessage {
    spaceName: string;
    metadata: string;
}
/** Message sent by the pusher to the back to sync the space users with the server after a reconnection */
export interface SyncSpaceUsersMessage {
    spaceName: string;
    users: SpaceUser[];
}
/** Message sent by the pusher to the back to add a user to the notify list */
export interface AddSpaceUserToNotifyMessage {
    spaceName: string;
    user: SpaceUser | undefined;
}
/** Message sent by the pusher to the back to delete a user from the notify list */
export interface DeleteSpaceUserToNotifyMessage {
    spaceName: string;
    user: SpaceUser | undefined;
}
/** The space we were listening to has been destroyed for some awful reason (connection to back was lost) */
export interface SpaceDestroyedMessage {
    spaceName: string;
}
export interface KickOffMessage {
    spaceName: string;
    userId: string;
}
/** Filter * */
export interface AddSpaceFilterMessage {
    spaceFilterMessage: SpaceFilterMessage | undefined;
}
export interface RemoveSpaceFilterMessage {
    spaceFilterMessage: SpaceFilterMessage | undefined;
}
export interface SpaceFilterMessage {
    spaceName: string;
}
export interface SpaceFilterContainName {
    value: string;
}
export interface SpaceFilterLiveStreaming {
}
export interface SpaceFilterEverybody {
}
export interface VariableRequest {
    room: string;
    name: string;
}
export interface SaveVariableRequest {
    room: string;
    name: string;
    value: any | undefined;
}
export interface EventRequest {
    room: string;
    name: string;
}
export interface EventResponse {
    data: any | undefined;
    senderId?: number | undefined;
}
export interface DispatchEventRequest {
    room: string;
    name: string;
    data: any | undefined;
    /** If targetUserIds is empty, the event is broadcast to all users in the room. Otherwise, it targets the users with the given ids. */
    targetUserIds: number[];
}
export declare const PositionMessage: MessageFns<PositionMessage>;
export declare const PointMessage: MessageFns<PointMessage>;
export declare const ViewportMessage: MessageFns<ViewportMessage>;
export declare const CharacterTextureMessage: MessageFns<CharacterTextureMessage>;
export declare const ApplicationMessage: MessageFns<ApplicationMessage>;
export declare const CompanionTextureMessage: MessageFns<CompanionTextureMessage>;
export declare const ZoneMessage: MessageFns<ZoneMessage>;
export declare const PingMessage: MessageFns<PingMessage>;
export declare const UpdateMapToNewestMessage: MessageFns<UpdateMapToNewestMessage>;
export declare const UpdateMapToNewestWithKeyMessage: MessageFns<UpdateMapToNewestWithKeyMessage>;
export declare const SetPlayerDetailsMessage: MessageFns<SetPlayerDetailsMessage>;
export declare const SayMessage: MessageFns<SayMessage>;
export declare const UserMovesMessage: MessageFns<UserMovesMessage>;
export declare const WebRtcSignal: MessageFns<WebRtcSignal>;
export declare const ReportPlayerMessage: MessageFns<ReportPlayerMessage>;
export declare const BanPlayerMessage: MessageFns<BanPlayerMessage>;
export declare const UpdateChatIdMessage: MessageFns<UpdateChatIdMessage>;
export declare const LeaveChatRoomAreaMessage: MessageFns<LeaveChatRoomAreaMessage>;
export declare const EmotePromptMessage: MessageFns<EmotePromptMessage>;
export declare const EmoteEventMessage: MessageFns<EmoteEventMessage>;
export declare const FollowRequestMessage: MessageFns<FollowRequestMessage>;
export declare const FollowConfirmationMessage: MessageFns<FollowConfirmationMessage>;
export declare const FollowAbortMessage: MessageFns<FollowAbortMessage>;
export declare const LockGroupPromptMessage: MessageFns<LockGroupPromptMessage>;
export declare const EditMapMessage: MessageFns<EditMapMessage>;
export declare const ErrorCommandMessage: MessageFns<ErrorCommandMessage>;
export declare const UpdateWAMSettingsMessage: MessageFns<UpdateWAMSettingsMessage>;
export declare const UpdateMegaphoneSettingMessage: MessageFns<UpdateMegaphoneSettingMessage>;
export declare const EditMapCommandMessage: MessageFns<EditMapCommandMessage>;
export declare const EditMapCommandsArrayMessage: MessageFns<EditMapCommandsArrayMessage>;
export declare const EditMapCommandWithKeyMessage: MessageFns<EditMapCommandWithKeyMessage>;
export declare const ModifyAreaMessage: MessageFns<ModifyAreaMessage>;
export declare const DeleteAreaMessage: MessageFns<DeleteAreaMessage>;
export declare const CreateAreaMessage: MessageFns<CreateAreaMessage>;
export declare const CreateEntityMessage: MessageFns<CreateEntityMessage>;
export declare const DeleteEntityMessage: MessageFns<DeleteEntityMessage>;
export declare const CollisionGridRow: MessageFns<CollisionGridRow>;
export declare const UploadEntityMessage: MessageFns<UploadEntityMessage>;
export declare const UploadFileMessage: MessageFns<UploadFileMessage>;
export declare const ModifyCustomEntityMessage: MessageFns<ModifyCustomEntityMessage>;
export declare const DeleteCustomEntityMessage: MessageFns<DeleteCustomEntityMessage>;
export declare const ModifyEntityMessage: MessageFns<ModifyEntityMessage>;
export declare const ClientToServerMessage: MessageFns<ClientToServerMessage>;
export declare const ReceivedEventMessage: MessageFns<ReceivedEventMessage>;
export declare const ModifiyWAMMetadataMessage: MessageFns<ModifiyWAMMetadataMessage>;
export declare const ItemEventMessage: MessageFns<ItemEventMessage>;
export declare const VariableMessage: MessageFns<VariableMessage>;
export declare const SetPlayerVariableMessage: MessageFns<SetPlayerVariableMessage>;
export declare const VariableWithTagMessage: MessageFns<VariableWithTagMessage>;
export declare const PlayGlobalMessage: MessageFns<PlayGlobalMessage>;
export declare const QueryMessage: MessageFns<QueryMessage>;
export declare const AbortQueryMessage: MessageFns<AbortQueryMessage>;
export declare const MapStorageJwtQuery: MessageFns<MapStorageJwtQuery>;
export declare const JitsiJwtQuery: MessageFns<JitsiJwtQuery>;
export declare const JoinBBBMeetingQuery: MessageFns<JoinBBBMeetingQuery>;
export declare const RoomTagsQuery: MessageFns<RoomTagsQuery>;
export declare const EmbeddableWebsiteQuery: MessageFns<EmbeddableWebsiteQuery>;
export declare const RoomsFromSameWorldQuery: MessageFns<RoomsFromSameWorldQuery>;
export declare const SendEventQuery: MessageFns<SendEventQuery>;
export declare const SearchMemberQuery: MessageFns<SearchMemberQuery>;
export declare const GetMemberQuery: MessageFns<GetMemberQuery>;
export declare const ChatMembersQuery: MessageFns<ChatMembersQuery>;
export declare const OauthRefreshTokenQuery: MessageFns<OauthRefreshTokenQuery>;
export declare const SearchTagsQuery: MessageFns<SearchTagsQuery>;
export declare const EnterChatRoomAreaQuery: MessageFns<EnterChatRoomAreaQuery>;
export declare const JoinSpaceQuery: MessageFns<JoinSpaceQuery>;
export declare const LeaveSpaceQuery: MessageFns<LeaveSpaceQuery>;
export declare const AnswerMessage: MessageFns<AnswerMessage>;
export declare const JitsiJwtAnswer: MessageFns<JitsiJwtAnswer>;
export declare const MapStorageJwtAnswer: MessageFns<MapStorageJwtAnswer>;
export declare const JoinBBBMeetingAnswer: MessageFns<JoinBBBMeetingAnswer>;
export declare const RoomTagsAnswer: MessageFns<RoomTagsAnswer>;
export declare const EmbeddableWebsiteAnswer: MessageFns<EmbeddableWebsiteAnswer>;
export declare const RoomShortDescription: MessageFns<RoomShortDescription>;
export declare const RoomsFromSameWorldAnswer: MessageFns<RoomsFromSameWorldAnswer>;
export declare const SendEventAnswer: MessageFns<SendEventAnswer>;
export declare const SearchMemberAnswer: MessageFns<SearchMemberAnswer>;
export declare const GetMemberAnswer: MessageFns<GetMemberAnswer>;
export declare const ChatMembersAnswer: MessageFns<ChatMembersAnswer>;
export declare const OauthRefreshTokenAnswer: MessageFns<OauthRefreshTokenAnswer>;
export declare const EnterChatRoomAreaAnswer: MessageFns<EnterChatRoomAreaAnswer>;
export declare const JoinSpaceAnswer: MessageFns<JoinSpaceAnswer>;
export declare const LeaveSpaceAnswer: MessageFns<LeaveSpaceAnswer>;
export declare const Member: MessageFns<Member>;
export declare const IceServer: MessageFns<IceServer>;
export declare const IceServersAnswer: MessageFns<IceServersAnswer>;
export declare const IceServersQuery: MessageFns<IceServersQuery>;
export declare const ChatMember: MessageFns<ChatMember>;
export declare const SearchTagsAnswer: MessageFns<SearchTagsAnswer>;
export declare const SpaceQueryMessage: MessageFns<SpaceQueryMessage>;
export declare const AddSpaceUserQuery: MessageFns<AddSpaceUserQuery>;
export declare const RemoveSpaceUserQuery: MessageFns<RemoveSpaceUserQuery>;
export declare const SpaceAnswerMessage: MessageFns<SpaceAnswerMessage>;
export declare const AddSpaceUserAnswer: MessageFns<AddSpaceUserAnswer>;
export declare const RemoveSpaceUserAnswer: MessageFns<RemoveSpaceUserAnswer>;
export declare const UserMovedMessage: MessageFns<UserMovedMessage>;
export declare const MoveToPositionMessage: MessageFns<MoveToPositionMessage>;
export declare const LocatePositionMessage: MessageFns<LocatePositionMessage>;
export declare const SubMessage: MessageFns<SubMessage>;
export declare const BatchMessage: MessageFns<BatchMessage>;
export declare const GroupUpdateMessage: MessageFns<GroupUpdateMessage>;
export declare const GroupDeleteMessage: MessageFns<GroupDeleteMessage>;
export declare const UserJoinedMessage: MessageFns<UserJoinedMessage>;
export declare const UserJoinedMessage_VariablesEntry: MessageFns<UserJoinedMessage_VariablesEntry>;
export declare const UserLeftMessage: MessageFns<UserLeftMessage>;
export declare const ErrorMessage: MessageFns<ErrorMessage>;
export declare const ErrorScreenMessage: MessageFns<ErrorScreenMessage>;
export declare const ItemStateMessage: MessageFns<ItemStateMessage>;
export declare const GroupUsersUpdateMessage: MessageFns<GroupUsersUpdateMessage>;
export declare const RoomJoinedMessage: MessageFns<RoomJoinedMessage>;
export declare const MegaphoneSettings: MessageFns<MegaphoneSettings>;
export declare const WebRtcStartMessage: MessageFns<WebRtcStartMessage>;
export declare const WebRtcDisconnectMessage: MessageFns<WebRtcDisconnectMessage>;
export declare const TeleportMessageMessage: MessageFns<TeleportMessageMessage>;
export declare const SendUserMessage: MessageFns<SendUserMessage>;
export declare const WorldFullWarningMessage: MessageFns<WorldFullWarningMessage>;
export declare const WorldFullWarningToRoomMessage: MessageFns<WorldFullWarningToRoomMessage>;
export declare const RefreshRoomPromptMessage: MessageFns<RefreshRoomPromptMessage>;
export declare const RefreshRoomMessage: MessageFns<RefreshRoomMessage>;
export declare const WorldFullMessage: MessageFns<WorldFullMessage>;
export declare const TokenExpiredMessage: MessageFns<TokenExpiredMessage>;
export declare const InvalidCharacterTextureMessage: MessageFns<InvalidCharacterTextureMessage>;
export declare const InvalidCompanionTextureMessage: MessageFns<InvalidCompanionTextureMessage>;
export declare const WorldConnectionMessage: MessageFns<WorldConnectionMessage>;
export declare const BanUserMessage: MessageFns<BanUserMessage>;
export declare const AskPositionMessage: MessageFns<AskPositionMessage>;
export declare const MuteAudioPrivateMessage: MessageFns<MuteAudioPrivateMessage>;
export declare const MuteVideoPrivateMessage: MessageFns<MuteVideoPrivateMessage>;
export declare const MuteAudioForEverybodyPublicMessage: MessageFns<MuteAudioForEverybodyPublicMessage>;
export declare const MuteVideoForEverybodyPublicMessage: MessageFns<MuteVideoForEverybodyPublicMessage>;
export declare const KickOffUserPrivateMessage: MessageFns<KickOffUserPrivateMessage>;
export declare const PublicEventFrontToPusher: MessageFns<PublicEventFrontToPusher>;
export declare const PublicEvent: MessageFns<PublicEvent>;
export declare const SpaceEvent: MessageFns<SpaceEvent>;
export declare const PrivateSpaceEvent: MessageFns<PrivateSpaceEvent>;
export declare const CommunicationStrategyMessage: MessageFns<CommunicationStrategyMessage>;
export declare const SwitchMessage: MessageFns<SwitchMessage>;
export declare const FinalizeSwitchMessage: MessageFns<FinalizeSwitchMessage>;
export declare const BlockUserMessage: MessageFns<BlockUserMessage>;
export declare const UnblockUserMessage: MessageFns<UnblockUserMessage>;
export declare const LivekitInvitationMessage: MessageFns<LivekitInvitationMessage>;
export declare const LivekitDisconnectMessage: MessageFns<LivekitDisconnectMessage>;
export declare const SpaceMessage: MessageFns<SpaceMessage>;
export declare const SpaceIsTyping: MessageFns<SpaceIsTyping>;
export declare const PrivateEvent: MessageFns<PrivateEvent>;
export declare const PrivateEventBackToPusher: MessageFns<PrivateEventBackToPusher>;
export declare const PrivateEventPusherToFront: MessageFns<PrivateEventPusherToFront>;
export declare const PrivateEventFrontToPusher: MessageFns<PrivateEventFrontToPusher>;
export declare const JoinSpaceRequestMessage: MessageFns<JoinSpaceRequestMessage>;
export declare const LeaveSpaceRequestMessage: MessageFns<LeaveSpaceRequestMessage>;
export declare const ServerToClientMessage: MessageFns<ServerToClientMessage>;
export declare const JoinRoomMessage: MessageFns<JoinRoomMessage>;
export declare const UserJoinedZoneMessage: MessageFns<UserJoinedZoneMessage>;
export declare const UserJoinedZoneMessage_VariablesEntry: MessageFns<UserJoinedZoneMessage_VariablesEntry>;
export declare const UserLeftZoneMessage: MessageFns<UserLeftZoneMessage>;
export declare const GroupUpdateZoneMessage: MessageFns<GroupUpdateZoneMessage>;
export declare const GroupLeftZoneMessage: MessageFns<GroupLeftZoneMessage>;
export declare const PlayerDetailsUpdatedMessage: MessageFns<PlayerDetailsUpdatedMessage>;
export declare const Zone: MessageFns<Zone>;
export declare const SubscribeZoneMessage: MessageFns<SubscribeZoneMessage>;
export declare const UnsubscribeZoneMessage: MessageFns<UnsubscribeZoneMessage>;
export declare const RoomMessage: MessageFns<RoomMessage>;
export declare const PusherToBackRoomMessage: MessageFns<PusherToBackRoomMessage>;
export declare const InitRoomMessage: MessageFns<InitRoomMessage>;
export declare const PusherToBackMessage: MessageFns<PusherToBackMessage>;
export declare const BatchToPusherRoomMessage: MessageFns<BatchToPusherRoomMessage>;
export declare const SubToPusherRoomMessage: MessageFns<SubToPusherRoomMessage>;
export declare const UserJoinedRoomMessage: MessageFns<UserJoinedRoomMessage>;
export declare const UserLeftRoomMessage: MessageFns<UserLeftRoomMessage>;
export declare const ServerToAdminClientMessage: MessageFns<ServerToAdminClientMessage>;
export declare const AdminPusherToBackMessage: MessageFns<AdminPusherToBackMessage>;
export declare const MapStorageRefreshMessage: MessageFns<MapStorageRefreshMessage>;
export declare const MapStorageToBackMessage: MessageFns<MapStorageToBackMessage>;
export declare const MapStorageUrlMessage: MessageFns<MapStorageUrlMessage>;
export declare const MapStorageClearAfterUploadMessage: MessageFns<MapStorageClearAfterUploadMessage>;
export declare const AdminMessage: MessageFns<AdminMessage>;
export declare const AdminRoomMessage: MessageFns<AdminRoomMessage>;
export declare const AdminGlobalMessage: MessageFns<AdminGlobalMessage>;
export declare const BanMessage: MessageFns<BanMessage>;
export declare const RoomDescription: MessageFns<RoomDescription>;
export declare const RoomsList: MessageFns<RoomsList>;
export declare const DispatchGlobalEventRequest: MessageFns<DispatchGlobalEventRequest>;
export declare const ExternalModuleMessage: MessageFns<ExternalModuleMessage>;
export declare const PusherToBackSpaceMessage: MessageFns<PusherToBackSpaceMessage>;
export declare const BackToPusherSpaceMessage: MessageFns<BackToPusherSpaceMessage>;
export declare const JoinSpaceMessage: MessageFns<JoinSpaceMessage>;
export declare const LeaveSpaceMessage: MessageFns<LeaveSpaceMessage>;
export declare const SpaceUser: MessageFns<SpaceUser>;
export declare const AddSpaceUserMessage: MessageFns<AddSpaceUserMessage>;
export declare const InitSpaceUsersMessage: MessageFns<InitSpaceUsersMessage>;
export declare const UpdateSpaceUserMessage: MessageFns<UpdateSpaceUserMessage>;
export declare const UpdateSpaceUserPusherToFrontMessage: MessageFns<UpdateSpaceUserPusherToFrontMessage>;
export declare const RemoveSpaceUserMessage: MessageFns<RemoveSpaceUserMessage>;
export declare const RemoveSpaceUserPusherToFrontMessage: MessageFns<RemoveSpaceUserPusherToFrontMessage>;
export declare const UpdateSpaceMetadataMessage: MessageFns<UpdateSpaceMetadataMessage>;
export declare const SyncSpaceUsersMessage: MessageFns<SyncSpaceUsersMessage>;
export declare const AddSpaceUserToNotifyMessage: MessageFns<AddSpaceUserToNotifyMessage>;
export declare const DeleteSpaceUserToNotifyMessage: MessageFns<DeleteSpaceUserToNotifyMessage>;
export declare const SpaceDestroyedMessage: MessageFns<SpaceDestroyedMessage>;
export declare const KickOffMessage: MessageFns<KickOffMessage>;
export declare const AddSpaceFilterMessage: MessageFns<AddSpaceFilterMessage>;
export declare const RemoveSpaceFilterMessage: MessageFns<RemoveSpaceFilterMessage>;
export declare const SpaceFilterMessage: MessageFns<SpaceFilterMessage>;
export declare const SpaceFilterContainName: MessageFns<SpaceFilterContainName>;
export declare const SpaceFilterLiveStreaming: MessageFns<SpaceFilterLiveStreaming>;
export declare const SpaceFilterEverybody: MessageFns<SpaceFilterEverybody>;
export declare const VariableRequest: MessageFns<VariableRequest>;
export declare const SaveVariableRequest: MessageFns<SaveVariableRequest>;
export declare const EventRequest: MessageFns<EventRequest>;
export declare const EventResponse: MessageFns<EventResponse>;
export declare const DispatchEventRequest: MessageFns<DispatchEventRequest>;
type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;
export type DeepPartial<T> = T extends Builtin ? T : T extends globalThis.Array<infer U> ? globalThis.Array<DeepPartial<U>> : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>> : T extends {} ? {
    [K in keyof T]?: DeepPartial<T[K]>;
} : Partial<T>;
type KeysOfUnion<T> = T extends T ? keyof T : never;
export type Exact<P, I extends P> = P extends Builtin ? P : P & {
    [K in keyof P]: Exact<P[K], I[K]>;
} & {
    [K in Exclude<keyof I, KeysOfUnion<P>>]: never;
};
export interface MessageFns<T> {
    encode(message: T, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): T;
    fromJSON(object: any): T;
    toJSON(message: T): unknown;
    create<I extends Exact<DeepPartial<T>, I>>(base?: I): T;
    fromPartial<I extends Exact<DeepPartial<T>, I>>(object: I): T;
}
export {};
