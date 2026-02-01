import { isAxiosError } from "axios";
import type { LegalsData, OpidWokaNamePolicy } from "@workadventure/messages";
import { isMapDetailsData, isRoomRedirect, ErrorApiData } from "@workadventure/messages";
import {
    CONTACT_URL,
    DISABLE_ANONYMOUS,
    ENABLE_CHAT,
    ENABLE_CHAT_DISCONNECTED_LIST,
    ENABLE_CHAT_ONLINE_LIST,
    ENABLE_CHAT_UPLOAD,
    ENABLE_ISSUE_REPORT,
    ENABLE_OPENID,
    ENABLE_SAY,
    OPID_WOKA_NAME_POLICY,
    PUBLIC_MAP_STORAGE_PREFIX,
} from "../Enum/EnvironmentVariable";
import { ApiError } from "../Stores/Errors/ApiError";
import { ABSOLUTE_PUSHER_URL } from "../Enum/ComputedConst";
import { axiosWithRetry } from "./AxiosUtils";
import { localUserStore } from "./LocalUserStore";

export class MapDetail {
    constructor(public readonly mapUrl?: string, public readonly wamUrl?: string) {}
}

export interface RoomRedirect {
    redirectUrl: string;
}

export class Room {
    public readonly id: string;
    private _authenticationMandatory: boolean = DISABLE_ANONYMOUS;
    private _opidLogoutRedirectUrl: string = new URL("logout", ABSOLUTE_PUSHER_URL).toString();
    private _opidWokaNamePolicy: OpidWokaNamePolicy | undefined;
    private _mapUrl: string | undefined;
    private _wamUrl: string | undefined;
    private readonly _search: URLSearchParams;
    private _contactPage: string | undefined;
    private _group: string | null = null;
    private _expireOn: Date | undefined;
    private _canReport = false;
    private _loadingLogo: string | undefined;
    private _loginSceneLogo: string | undefined;
    private _metadata: unknown;
    private _backgroundSceneImage: string | undefined;
    private _showPoweredBy: boolean | undefined = true;
    private _roomName: string | undefined;
    private _pricingUrl: string | undefined;
    private _enableChat: boolean | undefined;
    private _isMatrixChatEnabled: boolean | undefined;
    private _enableChatUpload: boolean | undefined;
    private _enableChatOnlineList: boolean | undefined;
    private _enableChatDisconnectedList: boolean | undefined;
    private _enableSay: boolean | undefined;
    private _enableIssueReport: boolean | undefined;
    private _legals: LegalsData | undefined;
    private _backgroundColor: string | undefined;
    private _primaryColor: string | undefined;
    private _iconClothes: string | undefined;
    private _iconAccessory: string | undefined;
    private _iconHat: string | undefined;
    private _iconHair: string | undefined;
    private _iconEyes: string | undefined;
    private _iconBody: string | undefined;
    private _iconTurn: string | undefined;
    private _reportIssuesUrl: string | undefined;
    private _entityCollectionsUrls: string[] | undefined;
    private _errorSceneLogo: string | undefined;
    private _modules: string[] = [];
    private _isLogged: boolean | undefined;

    private constructor(private roomUrl: URL) {
        this.id = roomUrl.pathname;

        if (this.id.startsWith("/")) {
            this.id = this.id.substring(1);
        }

        if (this.roomUrl.pathname.endsWith("/")) {
            this.roomUrl.pathname = this.roomUrl.pathname.slice(0, -1);
        }

        this._search = new URLSearchParams(roomUrl.search);
    }

    public static async createRoom(roomUrl: URL): Promise<Room> {
        let redirectCount = 0;
        while (redirectCount < 32) {
            const room = new Room(roomUrl);
            const result = await room.getMapDetail();
            if (result instanceof MapDetail) {
                return room;
            }
            redirectCount++;
            roomUrl = new URL(result.redirectUrl, window.location.href);
        }
        throw new Error("Room resolving seems stuck in a redirect loop after 32 redirect attempts");
    }

    public static getRoomPathFromExitUrl(exitUrl: string, currentRoomUrl: string): URL {
        return new URL(exitUrl, currentRoomUrl);
    }

    /** @deprecated */
    public static getRoomPathFromExitSceneUrl(
        exitSceneUrl: string,
        currentRoomUrl: string,
        currentMapUrl: string
    ): URL {
        const absoluteExitSceneUrl = new URL(exitSceneUrl, currentMapUrl);
        const baseUrl = new URL(currentRoomUrl);

        const currentRoom = new Room(baseUrl);
        let instance = "global";
        if (currentRoom.id.startsWith("_/") || currentRoom.id.startsWith("*/")) {
            const match = /[_*]\/([^/]+)\/.+/.exec(currentRoom.id);
            if (!match) throw new Error('Could not extract instance from "' + currentRoom.id + '"');
            instance = match[1];
        }

        baseUrl.pathname = "/_/" + instance + "/" + absoluteExitSceneUrl.host + absoluteExitSceneUrl.pathname;
        baseUrl.hash = absoluteExitSceneUrl.hash;

        return baseUrl;
    }

    private async getMapDetail(): Promise<MapDetail | RoomRedirect> {
        try {
            /**
             * FIX: We use the defined API_URL or relative 'map' endpoint.
             * If ERR_CONNECTION_REFUSED persists, verify the Backend is on 8081.
             */
            const result = await axiosWithRetry.get<unknown>("map", {
                params: {
                    playUri: this.roomUrl.toString(),
                    authToken: localUserStore.getAuthToken(),
                },
            });

            const data = result.data;
            const roomRedirectChecking = isRoomRedirect.safeParse(data);
            const mapDetailsDataChecking = isMapDetailsData.safeParse(data);
            const errorApiDataChecking = ErrorApiData.safeParse(data);

            if (roomRedirectChecking.success) {
                return { redirectUrl: roomRedirectChecking.data.redirectUrl };
            } else if (mapDetailsDataChecking.success) {
                const data = mapDetailsDataChecking.data;

                if (data.authenticationMandatory !== undefined) {
                    data.authenticationMandatory = Boolean(data.authenticationMandatory);
                }

                this._mapUrl = data.mapUrl;
                this._wamUrl = data.wamUrl;
                this._group = data.group;
                this._authenticationMandatory = data.authenticationMandatory ?? DISABLE_ANONYMOUS;
                this._opidLogoutRedirectUrl = data.opidLogoutRedirectUrl || new URL("logout", ABSOLUTE_PUSHER_URL).toString();
                this._contactPage = data.contactPage || CONTACT_URL;
                if (data.expireOn) this._expireOn = new Date(data.expireOn);
                this._opidWokaNamePolicy = data.opidWokaNamePolicy ?? OPID_WOKA_NAME_POLICY;
                this._canReport = data.canReport ?? false;
                this._loadingLogo = data.loadingLogo ?? undefined;
                this._loginSceneLogo = data.loginSceneLogo ?? undefined;
                this._backgroundSceneImage = data.backgroundSceneImage ?? undefined;
                this._showPoweredBy = data.showPoweredBy ?? true;
                this._backgroundColor = data.backgroundColor ?? undefined;
                this._primaryColor = data.primaryColor ?? undefined;
                this._metadata = data.metadata ?? undefined;
                this._roomName = data.roomName ?? undefined;
                this._pricingUrl = data.pricingUrl ?? undefined;
                this._legals = data.legals ?? undefined;
                this._enableChat = (data.enableChat ?? true) && ENABLE_CHAT;
                this._isMatrixChatEnabled = (data.enableMatrixChat ?? true) && ENABLE_OPENID;
                this._enableChatUpload = (data.enableChatUpload ?? true) && ENABLE_CHAT_UPLOAD;
                this._enableChatOnlineList = (data.enableChatOnlineList ?? true) && ENABLE_CHAT_ONLINE_LIST;
                this._enableChatDisconnectedList = (data.enableChatDisconnectedList ?? true) && ENABLE_CHAT_DISCONNECTED_LIST;
                this._enableSay = (data.enableSay ?? true) && ENABLE_SAY;
                this._enableIssueReport = (data.enableIssueReport ?? true) && ENABLE_ISSUE_REPORT;
                this._iconClothes = data.customizeWokaScene?.clothesIcon ?? undefined;
                this._iconAccessory = data.customizeWokaScene?.accessoryIcon ?? undefined;
                this._iconBody = data.customizeWokaScene?.bodyIcon ?? undefined;
                this._iconEyes = data.customizeWokaScene?.eyesIcon ?? undefined;
                this._iconHair = data.customizeWokaScene?.hairIcon ?? undefined;
                this._iconHat = data.customizeWokaScene?.hatIcon ?? undefined;
                this._iconTurn = data.customizeWokaScene?.turnIcon ?? undefined;
                this._reportIssuesUrl = data.reportIssuesUrl ?? undefined;
                this._entityCollectionsUrls = data.entityCollectionsUrls ?? undefined;
                this._errorSceneLogo = data.errorSceneLogo ?? undefined;
                this._modules = data.modules ?? [];
                this._isLogged = data.isLogged ?? localUserStore.isLogged();

                return new MapDetail(data.mapUrl, data.wamUrl);
            } else if (errorApiDataChecking.success) {
                throw new ApiError(errorApiDataChecking.data);
            } else {
                throw new Error("Invalid format received from Pusher /map endpoint.");
            }
        } catch (e) {
            if (isAxiosError(e) && e.response?.status == 401) {
                localUserStore.setAuthToken(null);
                window.location.reload();
            }
            throw e;
        }
    }

    public isDisconnected(): boolean {
        const alone = this._search.get("alone");
        return !!(alone && alone !== "0" && alone.toLowerCase() !== "false");
    }

    public get search(): URLSearchParams { return this._search; }
    public isEqual(room: Room): boolean { return room.key === this.key; }

    public get key(): string {
        const newUrl = new URL(this.roomUrl.toString());
        newUrl.search = "";
        newUrl.hash = "";
        return newUrl.toString();
    }

    public get href(): string { return this.roomUrl.toString(); }
    get mapUrl(): string | undefined { return this._mapUrl; }
    get wamUrl(): string | undefined { return this._wamUrl; }

    get mapStorageUrl(): URL | undefined {
        if (!this._wamUrl) return undefined;
        return new URL(`${PUBLIC_MAP_STORAGE_PREFIX}`, this._wamUrl);
    }

    get authenticationMandatory(): boolean { return this._authenticationMandatory; }
    get opidLogoutRedirectUrl(): string { return this._opidLogoutRedirectUrl; }
    get contactPage(): string | undefined { return this._contactPage; }
    get group(): string | null { return this._group; }
    get expireOn(): Date | undefined { return this._expireOn; }
    get canReport(): boolean { return this._canReport; }
    get opidWokaNamePolicy(): OpidWokaNamePolicy | undefined { return this._opidWokaNamePolicy; }
    get loadingLogo(): string | undefined { return this._loadingLogo; }
    get loginSceneLogo(): string | undefined { return this._loginSceneLogo; }
    get backgroundSceneImage(): string | undefined { return this._backgroundSceneImage; }
    get metadata(): unknown { return this._metadata; }
    get roomName(): string | undefined { return this._roomName; }
    get showPoweredBy(): boolean | undefined { return this._showPoweredBy; }
    get pricingUrl(): string | undefined { return this._pricingUrl; }
    get legals(): LegalsData | undefined { return this._legals; }
    get backgroundColor(): string | undefined { return this._backgroundColor; }
    get primaryColor(): string | undefined { return this._primaryColor; }
    get iconClothes(): string | undefined { return this._iconClothes; }
    get iconAccessory(): string | undefined { return this._iconAccessory; }
    get iconHat(): string | undefined { return this._iconHat; }
    get iconHair(): string | undefined { return this._iconHair; }
    get iconEyes(): string | undefined { return this._iconEyes; }
    get iconBody(): string | undefined { return this._iconBody; }
    get iconTurn(): string | undefined { return this._iconTurn; }
    get reportIssuesUrl(): string | undefined { return this._reportIssuesUrl; }
    get entityCollectionsUrls(): string[] | undefined { return this._entityCollectionsUrls; }
    get errorSceneLogo(): string | undefined { return this._errorSceneLogo; }
    get modules(): string[] { return this._modules; }

    get isChatEnabled(): boolean { return this._enableChat ?? true; }
    get isMatrixChatEnabled(): boolean { return this._isMatrixChatEnabled ?? true; }
    get isChatUploadEnabled(): boolean { return this._enableChatUpload ?? true; }
    get isChatOnlineListEnabled(): boolean { return this._enableChatOnlineList ?? true; }
    get isChatDisconnectedListEnabled(): boolean { return this._enableChatDisconnectedList ?? true; }
    get isSayEnabled(): boolean { return this._enableSay ?? true; }
    get isIssueReportEnabled(): boolean { return this._enableIssueReport ?? true; }

    get isLogged(): boolean {
        if (this._isLogged === undefined) throw new Error("isLogged not yet initialized.");
        return this._isLogged;
    }
}