import dnsPromises from "dns/promises";
import path from "path";
import ipaddr from "ipaddr.js";
import axios from "axios";
import { ITiledMap } from "@workadventure/tiled-map-type-guard";
import { LocalUrlError } from "./LocalUrlError";
import { WAMFileFormat } from "./types";
import { wamFileMigration } from "./Migrations/WamFileMigration";

class MapFetcher {
    async getMapUrl(
        mapUrl: string | undefined,
        wamUrl: string | undefined,
        internalMapStorageUrl: string | undefined = undefined,
        stripPrefix: string | undefined = undefined
    ): Promise<string> {
        if (mapUrl) {
            return mapUrl;
        }
        if (!wamUrl) {
            throw new Error("Both mapUrl and wamUrl are undefined. Can't get mapUrl.");
        }
        const mapPath = (await this.fetchWamFile(wamUrl, internalMapStorageUrl, stripPrefix)).mapUrl;
        return new URL(mapPath, wamUrl).toString();
    }

    normalizeMapUrl(mapUrl: string, wamUrl: string): string {
        return path.normalize(`${path.dirname(wamUrl)}/${mapUrl}`);
    }

    async fetchWamFile(
        wamUrl: string,
        internalMapStorageUrl: string | undefined,
        stripPrefix: string | undefined
    ): Promise<WAMFileFormat> {
        try {
            const result = await this.fetchFile(wamUrl, true, true, internalMapStorageUrl, stripPrefix);
            const parseResult = WAMFileFormat.safeParse(wamFileMigration.migrate(result.data));
            if (!parseResult.success) {
                throw new LocalUrlError(`Invalid wam file format for: ${wamUrl}`);
            }
            return result.data as WAMFileFormat;
        } catch {
            throw new LocalUrlError(`Invalid wam file format for: ${wamUrl}`);
        }
    }

    async fetchMap(
        mapUrl: string | undefined,
        wamUrl: string | undefined,
        canLoadLocalUrl = false,
        storeVariableForLocalMaps = false,
        internalMapStorageUrl: string | undefined = undefined,
        stripPrefix: string | undefined = undefined
    ): Promise<ITiledMap> {
        const url = await this.getMapUrl(mapUrl, wamUrl, internalMapStorageUrl, stripPrefix);
        
        const res = await this.fetchFile(url, canLoadLocalUrl, storeVariableForLocalMaps);

        const parseResult = ITiledMap.safeParse(res.data);
        if (!parseResult.success) {
            console.error("Invalid map format for map '" + url + "':", parseResult.error);
        }

        return res.data as ITiledMap;
    }

    public async fetchFile(
        url: string,
        canLoadLocalUrl = false,
        storeVariableForLocalMaps = false,
        internalUrl: string | undefined = undefined,
        stripPrefix: string | undefined = undefined
    ) {
        if (
            internalUrl === undefined &&
            (await this.isLocalUrl(url)) &&
            !storeVariableForLocalMaps &&
            !canLoadLocalUrl
        ) {
            throw new LocalUrlError('URL for map "' + url + '" targets a local map');
        }

        const headers: Record<string, string> = {};
        if (internalUrl) {
            const urlObj = new URL(url, internalUrl);
            const domainUrl = urlObj.host;

            headers["X-Forwarded-Host"] = domainUrl;

            let path = urlObj.pathname;
            if (stripPrefix && stripPrefix !== "/" && path.startsWith(stripPrefix)) {
                path = path.substring(stripPrefix.length);
            }

            url = internalUrl + path + urlObj.search;
        }

        return await axios.get<unknown>(url, {
            maxContentLength: 50 * 1024 * 1024,
            timeout: 10000,
            headers,
        });
    }

    async isLocalUrl(url: string): Promise<boolean> {
        if (
            [
                "http://play.workadventure.localhost/_/global/maps.workadventure.localhost/tests/Variables/shared_variables.json",
                "http://maps.workadventure.localhost/tests/Properties/mapProperties.json",
                "http://play.workadventure.localhost/~/maps/areas.wam",
            ].includes(url)
        ) {
            return false;
        }

        const urlObj = new URL(url);
        if (urlObj.hostname === "localhost" || urlObj.hostname.endsWith(".localhost")) {
            return true;
        }

        // FIXED: Explicitly type the array to avoid 'never[]' inference
        let addresses: string[] = []; 
        
        if (urlObj.hostname.startsWith("[") && urlObj.hostname.endsWith("]")) {
            addresses = [urlObj.hostname.slice(1, -1)];
        } else if (!ipaddr.isValid(urlObj.hostname)) {
            addresses = (await dnsPromises.lookup(urlObj.hostname, { all: true })).map((x) => x.address);
        } else {
            addresses = [urlObj.hostname];
        }

        for (const address of addresses) {
            const addr = ipaddr.parse(address);
            if (addr.range() !== "unicast") {
                return true;
            }
        }

        return false;
    }
}

export const mapFetcher = new MapFetcher();