import type { Express } from "express";
import express from "express";
import cors from "cors"; // ADDED: To fix CORS error
import * as grpc from "@grpc/grpc-js";
import { RoomManagerDefinition, SpaceManagerDefinition } from "./ManualDefinitions";
import { SharedAdminApi } from "@workadventure/shared-utils/src/SharedAdminApi";
import { DebugController } from "./Controller/DebugController";
import { PrometheusController } from "./Controller/PrometheusController";
import { roomManager } from "./RoomManager";
import {
    HTTP_PORT,
    PROMETHEUS_PORT,
    GRPC_PORT,
    ADMIN_API_RETRY_DELAY,
    ADMIN_API_URL,
    GRPC_MAX_MESSAGE_SIZE,
} from "./Enum/EnvironmentVariable";
import { PingController } from "./Controller/PingController";
import { spaceManager } from "./SpaceManager";
import { setCapabilities } from "./Services/Capabilities";

// ADDED: Import the missing controllers
import { MapController } from "./Controller/MapController";
import { LoginController } from "./Controller/LoginController";

const sharedAdminApi = new SharedAdminApi(ADMIN_API_RETRY_DELAY, ADMIN_API_URL);

class App {
    private app: Express;
    private prometheusApp: Express | undefined;
    private prometheusController: PrometheusController;
    private debugController: DebugController;
    private pingController: PingController;
    
    // ADDED: Define types for the new controllers
    private mapController: MapController;
    private loginController: LoginController;

    constructor() {
        this.app = express();

        // ADDED: Enable CORS so Frontend (8080) can talk to Backend (8081)
        this.app.use(cors({ origin: true, credentials: true })); 

        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));

        if (PROMETHEUS_PORT) {
            this.prometheusApp = express();
            this.prometheusApp.use(express.json());
            this.prometheusApp.use(express.urlencoded({ extended: true }));
            this.prometheusController = new PrometheusController(this.prometheusApp);
        } else {
            this.prometheusController = new PrometheusController(this.app);
        }

        this.debugController = new DebugController(this.app);
        this.pingController = new PingController(this.app);

        // ADDED: Activate the controllers so /map and /login work
        this.mapController = new MapController(this.app);
        this.loginController = new LoginController(this.app);
    }

    public listen(): void {
        this.app.listen(HTTP_PORT, () => console.info(`WorkAdventure HTTP API starting on port ${HTTP_PORT}!`));

        if (PROMETHEUS_PORT && this.prometheusApp) {
            this.prometheusApp.listen(PROMETHEUS_PORT, () =>
                console.info(`WorkAdventure Prometheus API starting on port ${PROMETHEUS_PORT}!`)
            );
        }
    }

    public async init() {
        setCapabilities(await sharedAdminApi.initialise());
    }

    public grpcListen(): void {
        const server = new grpc.Server({
            "grpc.max_receive_message_length": GRPC_MAX_MESSAGE_SIZE,
            "grpc.max_send_message_length": GRPC_MAX_MESSAGE_SIZE,
        });

        // @ts-ignore
        server.commonServerOptions.streamResetBurst = 10000;
        // @ts-ignore
        server.commonServerOptions.streamResetRate = 1000;

        // @ts-ignore
        server.addService(RoomManagerDefinition, roomManager);
        // @ts-ignore
        server.addService(SpaceManagerDefinition, spaceManager);

        server.bindAsync(`0.0.0.0:${GRPC_PORT}`, grpc.ServerCredentials.createInsecure(), (err) => {
            if (err) {
                throw err;
            }
            console.log("WorkAdventure HTTP/2 API starting on port %d!", GRPC_PORT);
            server.start();
        });
    }
}

export default new App();