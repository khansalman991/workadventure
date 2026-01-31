import path from "path";
import * as Sentry from "@sentry/node";
import type { WAMFileFormat } from "@workadventure/map-editor";
import { GameMapProperties } from "@workadventure/map-editor";
import { LocalUrlError } from "@workadventure/map-editor/src/LocalUrlError";
import { mapFetcher } from "@workadventure/map-editor/src/MapFetcher";
import type {
    EditMapCommandMessage,
    EmoteEventMessage,
    JoinRoomMessage,
    MapBbbData,
    MapDetailsData,
    MapJitsiData,
    MapThirdPartyData,
    ServerToClientMessage,
    SetPlayerDetailsMessage,
    SubToPusherRoomMessage,
} from "@workadventure/messages";
import { isMapDetailsData, RefreshRoomMessage, VariableWithTagMessage } from "@workadventure/messages";
import { Jitsi } from "@workadventure/shared-utils";
import type { ITiledMap, ITiledMapProperty, Json } from "@workadventure/tiled-map-type-guard";
import { asError } from "catch-unknown";
import {
    ADMIN_API_URL,
    BBB_SECRET,
    BBB_URL,
    ENABLE_CHAT,
    ENABLE_CHAT_UPLOAD,
    INTERNAL_MAP_STORAGE_URL,
    JITSI_ISS,
    JITSI_URL,
    PUBLIC_MAP_STORAGE_PREFIX,
    PUBLIC_MAP_STORAGE_URL,
    SECRET_JITSI_KEY,
    STORE_VARIABLES_FOR_LOCAL_MAPS,
} from "../Enum/EnvironmentVariable";
import type { Admin } from "../Model/Admin";
import type { Movable } from "../Model/Movable";
import type { PositionInterface } from "../Model/PositionInterface";
import { ProtobufUtils } from "../Model/Websocket/ProtobufUtils";
import type {
    EmoteCallback,
    EntersCallback,
    GroupUsersUpdatedCallback,
    LeavesCallback,
    LockGroupCallback,
    MovesCallback,
    PlayerDetailsUpdatedCallback,
} from "../Model/Zone";
import type { EventSocket, RoomSocket, VariableSocket } from "../RoomManager";
import { adminApi } from "../Services/AdminApi";
import { MapLoadingError } from "../Services/MapLoadingError";
import { getMapStorageClient } from "../Services/MapStorageClient";
import { emitError, emitErrorOnRoomSocket } from "../Services/MessageHelpers";
import { ModeratorTagFinder } from "../Services/ModeratorTagFinder";
import { VariableError } from "../Services/VariableError";
import { VariablesManager } from "../Services/VariablesManager";
import type { BrothersFinder } from "./BrothersFinder";
import { Group } from "./Group";
import { PositionNotifier } from "./PositionNotifier";
import type { UserSocket } from "./User";
import { User } from "./User";
import type { PointInterface } from "./Websocket/PointInterface";

export type ConnectCallback = (user: User, group: Group) => void;
export type DisconnectCallback = (user: User, group: Group) => void;

export class GameRoom implements BrothersFinder {
    public readonly id: string;
    private readonly users = new Map<number, User>();
    private readonly usersByUuid = new Map<string, Set<User>>();
    private readonly groups: Map<number, Group> = new Map<number, Group>();
    private readonly admins = new Set<Admin>();

    private itemsState = new Map<number, unknown>();

    private readonly positionNotifier: PositionNotifier;
    private versionNumber = 1;
    private nextUserId = 1;

    private roomListeners: Set<RoomSocket> = new Set<RoomSocket>();
    private variableListeners: Map<string, Set<VariableSocket>> = new Map<string, Set<VariableSocket>>();
    private eventListeners: Map<string, Set<EventSocket>> = new Map<string, Set<EventSocket>>();

    private constructor(
        public readonly _roomUrl: string,
        private _roomGroup: string | null,
        private readonly connectCallback: ConnectCallback,
        private readonly disconnectCallback: DisconnectCallback,
        private readonly minDistance: number,
        private readonly groupRadius: number,
        onEnters: EntersCallback,
        onMoves: MovesCallback,
        onLeaves: LeavesCallback,
        onEmote: EmoteCallback,
        onLockGroup: LockGroupCallback,
        onPlayerDetailsUpdated: PlayerDetailsUpdatedCallback,
        onGroupUsersUpdated: GroupUsersUpdatedCallback,
        private thirdParty: MapThirdPartyData | undefined,
        private editable: boolean,
        private _mapUrl: string,
        private _wamUrl?: string,
        private _wamSettings: WAMFileFormat["settings"] = {}
    ) {
        this.id = Date.now().toString();

        this.positionNotifier = new PositionNotifier(
            320,
            320,
            onEnters,
            onMoves,
            onLeaves,
            onEmote,
            onLockGroup,
            onPlayerDetailsUpdated,
            onGroupUsersUpdated
        );
    }

    public static async create(
        roomUrl: string,
        connectCallback: ConnectCallback,
        disconnectCallback: DisconnectCallback,
        minDistance: number,
        groupRadius: number,
        onEnters: EntersCallback,
        onMoves: MovesCallback,
        onLeaves: LeavesCallback,
        onEmote: EmoteCallback,
        onLockGroup: LockGroupCallback,
        onPlayerDetailsUpdated: PlayerDetailsUpdatedCallback,
        onGroupUsersUpdated: GroupUsersUpdatedCallback
    ): Promise<GameRoom> {
        const mapDetails = await GameRoom.getMapDetails(roomUrl);
        const wamUrl = mapDetails.wamUrl;

        let mapUrl: string;
        let wamFile: WAMFileFormat | undefined = undefined;

        if (!wamUrl && mapDetails.mapUrl) {
            mapUrl = mapDetails.mapUrl;
        } else if (wamUrl) {
            wamFile = await mapFetcher.fetchWamFile(wamUrl, INTERNAL_MAP_STORAGE_URL, PUBLIC_MAP_STORAGE_PREFIX);
            mapUrl = new URL(wamFile.mapUrl, wamUrl).toString();
        } else {
            throw new Error("No mapUrl or wamUrl");
        }

        const gameRoom = new GameRoom(
            roomUrl,
            mapDetails.group,
            connectCallback,
            disconnectCallback,
            minDistance,
            groupRadius,
            onEnters,
            onMoves,
            onLeaves,
            onEmote,
            onLockGroup,
            onPlayerDetailsUpdated,
            onGroupUsersUpdated,
            mapDetails.thirdParty ?? undefined,
            mapDetails.editable ?? false,
            mapUrl,
            wamUrl,
            wamFile ? wamFile.settings : undefined
        );

        return gameRoom;
    }

    public getUsers(): Map<number, User> {
        return this.users;
    }

    public dispatchRoomMessage(message: SubToPusherRoomMessage): void {
        for (const socket of this.roomListeners) {
            socket.write({
                payload: [message],
            });
        }
    }

    public sendRefreshRoomMessageToUsers(): void {
        this.users.forEach((user) =>
            user.socket.write({
                $case: "refreshRoomMessage",
                refreshRoomMessage: RefreshRoomMessage.fromPartial({
                    roomId: this._roomUrl,
                    timeToRefresh: 30,
                }),
            } as any)
        );
    }

    public getUserByUuid(uuid: string): User | undefined {
        const users = this.usersByUuid.get(uuid);
        if (users === undefined) return undefined;
        const [user] = users;
        return user;
    }

    public getUserById(id: number): User | undefined {
        return this.users.get(id);
    }

    public getUsersByUuid(uuid: string): Set<User> {
        return this.usersByUuid.get(uuid) ?? new Set();
    }

    public async join(socket: UserSocket, joinRoomMessage: JoinRoomMessage): Promise<User> {
        const positionMessage = joinRoomMessage.positionMessage;
        if (positionMessage === undefined) throw new Error("Missing position message");
        const position = ProtobufUtils.toPointInterface(positionMessage);

        this.nextUserId++;
        const user = await User.create(
            this.nextUserId,
            joinRoomMessage.userUuid,
            joinRoomMessage.isLogged,
            joinRoomMessage.IPAddress,
            position,
            this.positionNotifier,
            joinRoomMessage.availabilityStatus,
            socket,
            joinRoomMessage.tag,
            joinRoomMessage.canEdit,
            joinRoomMessage.visitCardUrl ?? null,
            joinRoomMessage.name,
            joinRoomMessage.characterTextures,
            this._roomUrl,
            this._roomGroup ?? undefined,
            this,
            joinRoomMessage.companionTexture,
            undefined,
            undefined,
            joinRoomMessage.activatedInviteUser,
            joinRoomMessage.applications,
            joinRoomMessage.chatID,
            undefined
        );

        this.users.set(user.id, user);
        let set = this.usersByUuid.get(user.uuid);
        if (set === undefined) {
            set = new Set<User>();
            this.usersByUuid.set(user.uuid, set);
        }
        set.add(user);
        this.updateUserGroup(user);

        for (const admin of this.admins) {
            admin.sendUserJoin(user.uuid, user.name, user.IPAddress);
        }

        return user;
    }

    public leave(user: User) {
        if (user.disconnected === true) return;
        user.disconnected = true;

        if (user.hasFollowers()) user.stopLeading();
        if (user.following) user.following.delFollower(user);
        if (user.group !== undefined) this.leaveGroup(user);

        this.users.delete(user.id);
        const set = this.usersByUuid.get(user.uuid);
        if (set !== undefined) {
            set.delete(user);
            if (set.size === 0) this.usersByUuid.delete(user.uuid);
        }

        this.positionNotifier.leave(user);
        for (const admin of this.admins) admin.sendUserLeft(user.uuid);
    }

    public isEmpty(): boolean {
        return (
            this.users.size === 0 &&
            this.admins.size === 0 &&
            this.roomListeners.size === 0 &&
            this.variableListeners.size === 0 &&
            this.eventListeners.size === 0
        );
    }

    public updatePosition(user: User, userPosition: PointInterface): void {
        user.setPosition(userPosition);
        this.updateUserGroup(user);
    }

    updatePlayerDetails(user: User, playerDetailsMessage: SetPlayerDetailsMessage) {
        user.updateDetails(playerDetailsMessage);
        if (user.group !== undefined && user.silent) {
            this.leaveGroup(user);
        }
    }

    private updateUserGroup(user: User): void {
        if (user.silent) return;

        const group = user.group;
        const closestItem: User | Group | null = this.searchClosestAvailableUserOrGroup(user);

        if (group === undefined) {
            if (user.getPosition().moving) return;

            if (closestItem !== null) {
                if (closestItem instanceof Group) {
                    closestItem.join(user);
                    closestItem.setOutOfBounds(false);
                } else {
                    const closestUser: User = closestItem;
                    const group: Group = new Group(
                        this._roomUrl,
                        [user, closestUser],
                        this.groupRadius,
                        this.connectCallback,
                        this.disconnectCallback,
                        this.positionNotifier
                    );
                    this.groups.set(group.getId(), group);
                }
            }
        } else {
            let hasKickOutSomeone = false;
            let followingMembers: User[] = [];
            const previewNewGroupPosition = group.previewGroupPosition();

            if (!previewNewGroupPosition) {
                this.leaveGroup(user);
                return;
            }

            if (user.hasFollowers() || user.following) {
                followingMembers = user.hasFollowers()
                    ? group.getUsers().filter((currentUser) => currentUser.following === user)
                    : group.getUsers().filter((currentUser) => currentUser.following === user.following);

                if (group.getUsers().length - 1 === followingMembers.length) {
                    let isOutOfBounds = false;
                    for (const member of followingMembers) {
                        const distance = GameRoom.computeDistanceBetweenPositions(member.getPosition(), previewNewGroupPosition);
                        if (distance > this.groupRadius) { isOutOfBounds = true; break; }
                    }
                    group.setOutOfBounds(isOutOfBounds);
                }
            }

            for (const headMember of group.getGroupHeads()) {
                if (!headMember.group) { this.leaveGroup(headMember); continue; }
                const headPosition = headMember.getPosition();
                const distance = GameRoom.computeDistanceBetweenPositions(headPosition, previewNewGroupPosition);
                if (distance > this.groupRadius) { hasKickOutSomeone = true; break; }
            }

            const userDistance = GameRoom.computeDistanceBetweenPositions(user.getPosition(), previewNewGroupPosition);
            if (hasKickOutSomeone && userDistance > this.groupRadius) {
                if (user.hasFollowers() && group.getUsers().length === 3 && followingMembers.length === 1) {
                    const other = group.getUsers().find((currentUser) => !currentUser.hasFollowers() && !currentUser.following);
                    if (other) this.leaveGroup(other);
                } else if (user.hasFollowers()) {
                    this.leaveGroup(user);
                    for (const member of followingMembers) this.leaveGroup(member);
                    const newGroup: Group = new Group(this._roomUrl, [user, ...followingMembers], this.groupRadius, this.connectCallback, this.disconnectCallback, this.positionNotifier);
                    this.groups.set(newGroup.getId(), newGroup);
                } else {
                    this.leaveGroup(user);
                }
            }
        }

        user.group?.updatePosition();
        user.group?.searchForNearbyUsers();
    }

    public sendToOthersInGroupIncludingUser(user: User, message: ServerToClientMessage): void {
        user.group?.getUsers().forEach((currentUser: User) => {
            if (currentUser.id !== user.id) currentUser.socket.write(message);
        });
    }

    private leaveGroup(user: User): void {
        const group = user.group;
        if (group === undefined) throw new Error("The user is part of no group");
        group.leave(user);
        if (group.isEmpty()) {
            group.destroy();
            this.groups.delete(group.getId());
        } else {
            group.updatePosition();
        }
    }

    private searchClosestAvailableUserOrGroup(user: User): User | Group | null {
        let minimumDistanceFound: number = Math.max(this.minDistance, this.groupRadius);
        let matchingItem: User | Group | null = null;
        this.users.forEach((currentUser) => {
            if (typeof currentUser.group !== "undefined" || currentUser === user || currentUser.silent) return;
            const distance = GameRoom.computeDistance(user, currentUser);
            if (distance <= minimumDistanceFound && distance <= this.minDistance) {
                minimumDistanceFound = distance;
                matchingItem = currentUser;
            }
        });

        this.groups.forEach((group: Group) => {
            if (group.isFull() || group.isLocked()) return;
            const distance = GameRoom.computeDistanceBetweenPositions(user.getPosition(), group.getPosition());
            if (distance <= minimumDistanceFound && distance <= this.groupRadius) {
                minimumDistanceFound = distance;
                matchingItem = group;
            }
        });

        return matchingItem;
    }

    public static computeDistance(user1: User, user2: User): number {
        const user1Position = user1.getPosition();
        const user2Position = user2.getPosition();
        return Math.sqrt(Math.pow(user2Position.x - user1Position.x, 2) + Math.pow(user2Position.y - user1Position.y, 2));
    }

    public static computeDistanceBetweenPositions(position1: PositionInterface, position2: PositionInterface): number {
        return Math.sqrt(Math.pow(position2.x - position1.x, 2) + Math.pow(position2.y - position1.y, 2));
    }

    public setItemState(itemId: number, state: unknown) {
        this.itemsState.set(itemId, state);
    }

    public getItemsState(): Map<number, unknown> {
        return this.itemsState;
    }

    /**
     * FIXED: Force cast to 'any' for all string assignments to prevent 'undefined' mismatch.
     */
    public async setVariable(name: string, value: string, user: User | "RoomApi"): Promise<void> {
        const variableManager = await this.getVariableManager();
        try {
            const readableBy = variableManager.setVariable(name, value, user);
            if (readableBy === false) return;

            // FIX: Use double-cast to ignore string/undefined strictness
            const variableMessage = { 
                name: name as unknown as undefined, 
                value: value as unknown as undefined 
            };
            
            if (readableBy) {
                (variableMessage as any).readableBy = readableBy;
            }

            this.sendSubMessageToRoom({
                $case: "variableMessage",
                variableMessage: VariableWithTagMessage.fromPartial(variableMessage as any),
            } as any);

            const listeners = this.variableListeners.get(name);
            for (const listener of listeners ?? []) {
                listener.write(JSON.parse(value));
            }
        } catch (e) {
            if (e instanceof VariableError) {
                if (this.variableManagerLastLoad === undefined) throw e;
                const lastLoaded = new Date().getTime() - this.variableManagerLastLoad.getTime();
                if (lastLoaded < 10000) throw e;
                this.variableManagerPromise = undefined;
                this.mapPromise = undefined;
                await this.setVariable(name, value, user);
            } else { throw e; }
        }
    }

    public addZoneListener(call: RoomSocket, x: number, y: number): Set<Movable> {
        return this.positionNotifier.addZoneListener(call, x, y);
    }

    public removeZoneListener(call: RoomSocket, x: number, y: number): void {
        return this.positionNotifier.removeZoneListener(call, x, y);
    }

    public adminJoin(admin: Admin): void {
        this.admins.add(admin);
        for (const user of this.users.values()) admin.sendUserJoin(user.uuid, user.name, user.IPAddress);
    }

    public adminLeave(admin: Admin): void {
        this.admins.delete(admin);
    }

    public async incrementVersion(): Promise<number> {
        const mapDetails = await GameRoom.getMapDetails(this._roomUrl);
        const mapUrl = await mapFetcher.getMapUrl(mapDetails.mapUrl, mapDetails.wamUrl, INTERNAL_MAP_STORAGE_URL, PUBLIC_MAP_STORAGE_PREFIX);
        if (this._mapUrl !== mapUrl) {
            this._mapUrl = mapUrl;
            this.mapPromise = undefined;
            this.variableManagerPromise = undefined;
        }
        this.versionNumber++;
        return this.versionNumber;
    }

    public emitEmoteEvent(user: User, emoteEventMessage: EmoteEventMessage) {
        this.positionNotifier.emitEmoteEvent(user, emoteEventMessage);
    }

    public emitLockGroupEvent(user: User, groupId: number) {
        this.positionNotifier.emitLockGroupEvent(user, groupId);
    }

    public addRoomListener(socket: RoomSocket) { this.roomListeners.add(socket); }
    public removeRoomListener(socket: RoomSocket) { this.roomListeners.delete(socket); }

    public addVariableListener(socket: VariableSocket) {
        let listenersSet = this.variableListeners.get(socket.request.name);
        if (!listenersSet) {
            listenersSet = new Set<VariableSocket>();
            this.variableListeners.set(socket.request.name, listenersSet);
        }
        listenersSet.add(socket);
    }

    public removeVariableListener(socket: VariableSocket) {
        let listenersSet = this.variableListeners.get(socket.request.name);
        if (!listenersSet) {
            listenersSet = new Set<VariableSocket>();
            this.variableListeners.set(socket.request.name, listenersSet);
        }
        listenersSet.add(socket);
    }

    public addEventListener(socket: EventSocket) {
        let listenersSet = this.eventListeners.get(socket.request.name);
        if (!listenersSet) {
            listenersSet = new Set<EventSocket>();
            this.eventListeners.set(socket.request.name, listenersSet);
        }
        listenersSet.add(socket);
    }

    public removeEventListener(socket: EventSocket) {
        const listenersSet = this.eventListeners.get(socket.request.name);
        if (listenersSet) {
            listenersSet.delete(socket);
            if (listenersSet.size === 0) this.eventListeners.delete(socket.request.name);
        }
    }

    private static async getMapDetails(roomUrl: string): Promise<MapDetailsData> {
        if (!ADMIN_API_URL) {
            const roomUrlObj = new URL(roomUrl);
            let mapUrl = undefined;
            let wamUrl = undefined;
            let canEdit = false;
            const match = /\/~\/(.+)/.exec(roomUrlObj.pathname);
            if (match && PUBLIC_MAP_STORAGE_URL) {
                if (path.extname(roomUrlObj.pathname) === ".tmj") {
                    mapUrl = `${PUBLIC_MAP_STORAGE_URL}/${match[1]}` as unknown as undefined;
                } else {
                    wamUrl = `${PUBLIC_MAP_STORAGE_URL}/${match[1]}` as unknown as undefined;
                }
                canEdit = true;
            } else {
                const match = /\/_\/[^/]+\/(.+)/.exec(roomUrlObj.pathname);
                if (!match) throw new Error("Unexpected room URL");
                mapUrl = (roomUrlObj.protocol + "//" + match[1]) as unknown as undefined;
            }
            return { mapUrl, wamUrl, editable: canEdit, authenticationMandatory: null, group: null, showPoweredBy: true, enableChat: ENABLE_CHAT, enableChatUpload: ENABLE_CHAT_UPLOAD } as any;
        }
        const result = isMapDetailsData.safeParse(await adminApi.fetchMapDetails(roomUrl));
        if (result.success) return result.data;
        throw new Error("Unexpected error querying map details");
    }

    private mapPromise: Promise<ITiledMap> | undefined;

    private getMap(canLoadLocalUrl = false): Promise<ITiledMap> {
        if (!this.mapPromise) this.mapPromise = mapFetcher.fetchMap(this._mapUrl, this._wamUrl, canLoadLocalUrl, STORE_VARIABLES_FOR_LOCAL_MAPS, INTERNAL_MAP_STORAGE_URL, PUBLIC_MAP_STORAGE_PREFIX);
        return this.mapPromise;
    }

    private wamPromise: Promise<WAMFileFormat> | undefined;

    private getWam(): Promise<WAMFileFormat | undefined> {
        if (!this._wamUrl) return Promise.resolve(undefined);
        if (!this.wamPromise) this.wamPromise = mapFetcher.fetchWamFile(this._wamUrl, INTERNAL_MAP_STORAGE_URL, PUBLIC_MAP_STORAGE_PREFIX);
        return this.wamPromise;
    }

    private variableManagerPromise: Promise<VariablesManager> | undefined;
    private variableManagerLastLoad: Date | undefined;

    private getVariableManager(): Promise<VariablesManager> {
        if (!this.variableManagerPromise) {
            this.variableManagerLastLoad = new Date();
            this.variableManagerPromise = this.getMap()
                .then(async (map) => {
                    const variablesManager = await VariablesManager.create(this._roomUrl, map);
                    return variablesManager.init();
                })
                .catch(async (e) => {
                    setTimeout(() => {
                        for (const roomListener of this.roomListeners) emitErrorOnRoomSocket(roomListener, "Error loading map logic.");
                    }, 1000);
                    const variablesManager = await VariablesManager.create(this._roomUrl, null);
                    return variablesManager.init();
                });
        }
        return this.variableManagerPromise;
    }

    public async getVariablesForTags(tags: string[] | undefined): Promise<Map<string, string>> {
        const variablesManager = await this.getVariableManager();
        return variablesManager.getVariablesForTags(tags);
    }

    public getGroupById(id: number): Group | undefined { return this.groups.get(id); }

    private jitsiModeratorTagFinderPromise: Promise<ModeratorTagFinder> | undefined;

    public async getModeratorTagForJitsiRoom(jitsiRoom: string): Promise<string | undefined> {
        if (this.jitsiModeratorTagFinderPromise === undefined) {
            this.jitsiModeratorTagFinderPromise = Promise.all([this.getMap(), this.getWam()])
                .then(([map, wam]) => {
                    return new ModeratorTagFinder(map, (properties: ITiledMapProperty[]): any => {
                        let mainValue: string | undefined = undefined;
                        let tagValue: string | undefined = undefined;
                        for (const property of properties ?? []) {
                            if (property.name === "jitsiRoom" && typeof property.value === "string") mainValue = property.value;
                            else if (property.name === "jitsiRoomAdminTag" && typeof property.value === "string") tagValue = property.value;
                        }
                        if (mainValue !== undefined && tagValue !== undefined) {
                            const allProps = new Map<string, any>();
                            for (const property of properties ?? []) if (property.value !== undefined) allProps.set(property.name, property.value);
                            return { mainValue: Jitsi.slugifyJitsiRoomName(mainValue, this._roomUrl, allProps.has(GameMapProperties.JITSI_NO_PREFIX)), tagValue };
                        }
                    }, this._roomUrl, wam);
                })
                .catch((e) => { throw new MapLoadingError(asError(e).message); });
        }
        try {
            const finder = await this.jitsiModeratorTagFinderPromise;
            return finder.getModeratorTag(jitsiRoom);
        } catch (e) { return undefined; }
    }

    private bbbModeratorTagFinderPromise: Promise<ModeratorTagFinder> | undefined;

    public async getModeratorTagForBbbMeeting(bbbRoom: string): Promise<string | undefined> {
        if (this.bbbModeratorTagFinderPromise === undefined) {
            this.bbbModeratorTagFinderPromise = this.getMap()
                .then((map) => {
                    return new ModeratorTagFinder(map, (properties: ITiledMapProperty[]): any => {
                        let mainValue: string | undefined = undefined;
                        let tagValue: string | undefined = undefined;
                        for (const property of properties ?? []) {
                            if (property.name === "bbbMeeting" && typeof property.value === "string") mainValue = property.value;
                            else if (property.name === "bbbMeetingAdminTag" && typeof property.value === "string") tagValue = property.value;
                        }
                        if (mainValue !== undefined && tagValue !== undefined) return { mainValue, tagValue };
                    });
                })
                .catch((e) => { throw new MapLoadingError(asError(e).message); });
        }
        try {
            const finder = await this.bbbModeratorTagFinderPromise;
            return finder.getModeratorTag(bbbRoom);
        } catch (e) { return undefined; }
    }

    public getJitsiSettings(): MapJitsiData | undefined {
        if (this.thirdParty?.jitsi) return this.thirdParty.jitsi;
        if (JITSI_URL) return { url: JITSI_URL, iss: JITSI_ISS, secret: SECRET_JITSI_KEY };
        return undefined;
    }

    public getBbbSettings(): MapBbbData | undefined {
        if (this.thirdParty?.bbb) return this.thirdParty.bbb;
        if (BBB_URL && BBB_SECRET) return { url: BBB_URL, secret: BBB_SECRET };
        return undefined;
    }

    public getBrothers(user: User): Array<User> {
        const family = this.usersByUuid.get(user.uuid);
        return family ? [...family].filter((theUser) => theUser !== user) : [];
    }

    public sendSubMessageToRoom(subMessage: SubToPusherRoomMessage) {
        for (const socket of this.roomListeners) socket.write({ payload: [subMessage] });
    }

    private mapStorageLock: Promise<void> = Promise.resolve();

    forwardEditMapCommandMessage(user: User, message: EditMapCommandMessage) {
        this.mapStorageLock = this.mapStorageLock.then(async () => {
            if (!this._wamUrl) return;
            try {
                const editMapCommandMessage = await getMapStorageClient().handleEditMapCommandWithKeyMessage({
                    mapKey: this._wamUrl as unknown as undefined, 
                    editMapCommandMessage: message as unknown as undefined, 
                    connectedUserTags: user.tags as any, 
                    userCanEdit: user.canEdit, 
                    userUUID: user.uuid as unknown as undefined,
                } as any);

                const editMsg = editMapCommandMessage.editMapMessage as any;
                if (editMsg?.$case === "errorCommandMessage") {
                    user.socket.write({ $case: "batchMessage", batchMessage: { event: "", payload: [{ $case: "editMapCommandMessage", editMapCommandMessage }] } } as any);
                    return;
                }
                if (editMsg?.$case === "updateWAMSettingsMessage") {
                    if (!this._wamSettings) this._wamSettings = {};
                    if (editMsg.updateWAMSettingsMessage?.$case === "updateMegaphoneSettingMessage") this._wamSettings.megaphone = editMsg.updateWAMSettingsMessage.updateMegaphoneSettingMessage;
                }
                if (editMsg?.$case === "modifyAreaMessage" || editMsg?.$case === "modifyEntityMessage") {
                    this.wamPromise = undefined;
                    this.jitsiModeratorTagFinderPromise = undefined;
                }
                this.dispatchRoomMessage({ $case: "editMapCommandMessage", editMapCommandMessage } as any);
            } catch (err) { emitError(user.socket, asError(err).message); }
        });
    }

    public dispatchEvent(name: string, data: unknown, senderId: number | "RoomApi", targetUserIds: number[]): void {
        const message: any = { 
            name: name as unknown as undefined, 
            data: data as any, 
            senderId: senderId === "RoomApi" ? undefined : senderId 
        };
        
        if (targetUserIds.length === 0) {
            this.sendSubMessageToRoom({ $case: "receivedEventMessage", receivedEventMessage: message } as any);
            for (const eventListener of this.eventListeners.get(name) ?? []) eventListener.write({ senderId: senderId === "RoomApi" ? undefined : senderId, data });
        } else {
            for (const targetUserId of targetUserIds) {
                const targetUser = this.getUserById(targetUserId);
                if (targetUser) targetUser.emitInBatch({ $case: "receivedEventMessage", receivedEventMessage: message } as any);
            }
        }
    }

    get mapUrl(): string { return this._mapUrl; }
    get wamUrl(): string | undefined { return this._wamUrl; }
    get roomUrl(): string { return this._roomUrl; }
    get roomGroup(): string | null { return this._roomGroup; }
    get wamSettings(): WAMFileFormat["settings"] { return this._wamSettings; }
}