// lib/server.ts
import * as Sentry from "@sentry/node";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import App from "./App";
import {
    ENABLE_TELEMETRY,
    SENTRY_DSN,
    SENTRY_RELEASE,
    SENTRY_ENVIRONMENT,
    SENTRY_TRACES_SAMPLE_RATE,
} from "./Enum/EnvironmentVariable";
import { telemetryService } from "./Services/TelemetryService";

/** * IMPORTANT: PRISMA 7 ADAPTER SETUP 
 * Prisma 7 requires you to explicitly provide a database driver.
 */
import { PrismaClient } from "../src/generated/client";

// 1. Create a standard connection pool using your .env variable
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// 2. Create the Prisma PostgreSQL adapter
const adapter = new PrismaPg(pool);

// 3. Pass the adapter into the PrismaClient constructor (Fixes the "0 arguments" error)
const prisma = new PrismaClient({ adapter });

// Telemetry Logic
if (ENABLE_TELEMETRY) {
    telemetryService.startTelemetry().catch((e) => console.error(e));
}

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
        console.info("Sentry initialized");
    } catch (e) {
        console.error("Error while initializing Sentry", e);
    }
}

// Main Bootstrapping Function
(async () => {
    try {
        // Test the database connection
        await prisma.$connect();
        console.info("✅ Database connected successfully via Prisma 7 Adapter.");
    } catch (error) {
        console.error("❌ Database connection failed:", error);
        process.exit(1);
    }

    await App.init();
    App.listen();
    App.grpcListen();
})().catch((e) => {
    console.error("Fatal error during app startup:", e);
    Sentry.captureException(e);
});

export { prisma };