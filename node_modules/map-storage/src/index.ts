import * as fs from "fs";
import path from "path";
import * as Sentry from "@sentry/node";
import * as grpc from "@grpc/grpc-js";
import express from "express";
import cors from "cors";
// FIXED: Import from our ManualDefinitions file
import { MapStorageDefinition } from "./ManualDefinitions";
import passport from "passport";
import bodyParser from "body-parser";
import { setErrorHandler } from "@workadventure/shared-utils/src/ErrorHandler";
import { mapStorageServer } from "./MapStorageServer";
import { mapsManager } from "./MapsManager";
import { proxyFiles } from "./FileFetcher/FileFetcher";
import { UploadController } from "./Upload/UploadController";
import { fileSystem } from "./fileSystem";
import { passportStrategies } from "./Services/Authentication";
import { mapPathUsingDomain } from "./Services/PathMapper";
import { ValidatorController } from "./Upload/ValidatorController";
import {
    SENTRY_DSN,
    SENTRY_RELEASE,
    WEB_HOOK_URL,
    SENTRY_TRACES_SAMPLE_RATE,
    SENTRY_ENVIRONMENT,
    GRPC_MAX_MESSAGE_SIZE,
    BODY_PARSER_JSON_SIZE_LIMIT,
} from "./Enum/EnvironmentVariable";

// Sentry integration
if (SENTRY_DSN != undefined) {
    try {
        const sentryOptions: Sentry.NodeOptions = {
            dsn: SENTRY_DSN,
            release: SENTRY_RELEASE,
            environment: SENTRY_ENVIRONMENT,
            tracesSampleRate: SENTRY_TRACES_SAMPLE_RATE,
            attachStacktrace: true,
        };

        Sentry.init(sentryOptions);

        setErrorHandler((error: Error) => {
            console.error(`[${new Date().toISOString()}]`, error);
            Sentry.captureException(error);
        });

        console.info(`[${new Date().toISOString()}] Sentry initialized`);
    } catch (e) {
        console.error(`[${new Date().toISOString()}] Error while initializing Sentry`, e);
    }
}
import { MapListService } from "./Services/MapListService";
import { WebHookService } from "./Services/WebHookService";
import { PingController } from "./Upload/PingController";
import { ResourceUrlModule } from "./Modules/ResourceUrlModule";
import { hookManager } from "./Modules/HookManager";
import { FileModule } from "./Modules/FileModule";
import { verifyJWT } from "./Services/VerifyJwt";

const resourceUrlModule = new ResourceUrlModule();
resourceUrlModule.init(hookManager);

const fileModule = new FileModule();
fileModule.init(hookManager);

const server = new grpc.Server({
    "grpc.max_receive_message_length": GRPC_MAX_MESSAGE_SIZE, // 20 MB
    "grpc.max_send_message_length": GRPC_MAX_MESSAGE_SIZE, // 20 MB
});

// FIXED: Use the ManualDefinition directly.
// @ts-ignore
server.addService(MapStorageDefinition, mapStorageServer);

server.bindAsync(`0.0.0.0:50053`, grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
        throw err;
    }
    console.info(`[${new Date().toISOString()}] Application is running`);
    console.info(`[${new Date().toISOString()}] gRPC port is 50053`);
    server.start();
});

const app = express();
app.set("trust proxy", true);
app.use(cors());
app.use((request, response, next) => {
    response.set("X-Content-Type-Options", "nosniff");
    next();
});
app.use(
    bodyParser.json({
        type: ["application/json", "application/json-patch+json"],
        limit: BODY_PARSER_JSON_SIZE_LIMIT,
    })
);

for (const passportStrategy of passportStrategies) {
    passport.use(passportStrategy);
}
app.use(passport.initialize());

// Serve the public folder using an absolute path (FIXED)
app.use(express.static(path.join(__dirname, "../public")));

app.get(/.*\.wam$/, (req, res, next) => {
    const wamPath = req.path;
    const domain = req.hostname;
    if (wamPath.includes("..") || domain.includes("..")) {
        res.status(400).send("Invalid request");
        return;
    }
    const key = mapPathUsingDomain(wamPath, domain);

    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", "max-age=5");

    const gameMap = mapsManager.getGameMap(key);
    if (gameMap) {
        res.send(gameMap.getWam());
    } else {
        fileSystem.serveStaticFile(key, res, next);
    }
});

app.get("/ping", (req, res) => {
    res.send("pong");
});

const mapListService = new MapListService(fileSystem, new WebHookService(WEB_HOOK_URL));
new UploadController(app, fileSystem, mapListService);
new ValidatorController(app);
new PingController(app);

app.get(
    "/private/files/{*splat}",
    (req, res, next) => {
        Promise.resolve(verifyJWT(req, res, next)).catch(next);
    },
    proxyFiles(fileSystem)
);

app.use(proxyFiles(fileSystem));

if (fs.existsSync("dist-ui")) {
    app.use("/ui", express.static("dist-ui"));
    app.get("/ui/{*splat}", (req, res, next) => {
        res.sendFile("index.html", { root: "dist-ui" });
    });
}

app.listen(3000, () => {
    console.info(`[${new Date().toISOString()}] Application is running on port 3000`);
});