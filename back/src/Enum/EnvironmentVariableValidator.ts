import { z } from "zod";

/**
 * Utility functions for environment variable parsing.
 */
const emptyStringToUndefined = (val: string | undefined) => (val === "" ? undefined : val);

const toNumber = (val: string | undefined, defaultValue: number): number => {
    if (val === undefined || val === "") return defaultValue;
    const parsed = parseInt(val, 10);
    return isNaN(parsed) ? defaultValue : parsed;
};

const toBool = (val: string | undefined, defaultValue: boolean): boolean => {
    if (val === undefined || val === "") return defaultValue;
    return val.toLowerCase() === "true" || val === "1";
};

// Custom Zod types for WorkAdventure strings
const PositiveIntAsString = z.string().regex(/^\d+$/).optional();
const BoolAsString = z.string().regex(/^(true|false|0|1)$/i).optional();
const AbsoluteOrRelativeUrl = z.string().min(1);

export const EnvironmentVariables = z.object({
    // Core URLs
    PLAY_URL: z.string().url().describe("Public URL of the play/frontend service"),
    
    // Proximity Settings
    MINIMUM_DISTANCE: PositiveIntAsString.optional()
        .transform((val) => toNumber(val, 64))
        .describe("Minimum distance (in pixels) before users are considered to be in proximity. Defaults to 64"),
    GROUP_RADIUS: PositiveIntAsString.optional()
        .transform((val) => toNumber(val, 48))
        .describe("Radius (in pixels) of a group/bubble. Defaults to 48"),
    MAX_PER_GROUP: PositiveIntAsString.optional()
        .or(z.string().max(0))
        .transform((val) => toNumber(val, 4))
        .describe("Maximum number of users in a bubble/group. Defaults to 4"),

    // Admin API
    ADMIN_API_URL: AbsoluteOrRelativeUrl.optional()
        .transform(emptyStringToUndefined)
        .describe("URL of the admin API for centralized configuration"),
    ADMIN_API_TOKEN: z.string().optional()
        .transform(emptyStringToUndefined)
        .describe("Authentication token for the admin API"),

    // Hardware & Performance
    CPU_OVERHEAT_THRESHOLD: PositiveIntAsString.optional()
        .transform((val) => toNumber(val, 80))
        .describe("CPU usage threshold (%) for dropping packets. Defaults to 80"),

    // Video Conferencing (Jitsi)
    JITSI_URL: z.string().optional()
        .transform(emptyStringToUndefined)
        .describe("URL of the Jitsi Meet server"),
    JITSI_ISS: z.string().optional()
        .transform(emptyStringToUndefined)
        .describe("Jitsi JWT issuer"),
    SECRET_JITSI_KEY: z.string().optional()
        .transform(emptyStringToUndefined)
        .describe("Secret key for Jitsi JWT"),

    // Video Conferencing (BBB)
    BBB_URL: z.string().url().or(z.literal("")).optional()
        .transform(emptyStringToUndefined)
        .describe("BigBlueButton server URL"),
    BBB_SECRET: z.string().optional()
        .transform(emptyStringToUndefined)
        .describe("BigBlueButton shared secret"),

    // Networking & Ports
    HTTP_PORT: PositiveIntAsString.optional()
        .transform((val) => toNumber(val, 8080))
        .describe("HTTP port for the back service. Defaults to 8080"),
    GRPC_PORT: PositiveIntAsString.optional()
        .transform((val) => toNumber(val, 50051))
        .describe("gRPC port for the back service. Defaults to 50051"),
    GRPC_MAX_MESSAGE_SIZE: PositiveIntAsString.optional()
        .or(z.string().max(0))
        .transform((val) => toNumber(val, 20 * 1024 * 1024))
        .describe("Max size of a gRPC message (default 20MB)"),

    // Redis Configuration
    REDIS_HOST: z.string().optional()
        .transform(emptyStringToUndefined)
        .describe("Redis server hostname"),
    REDIS_PORT: PositiveIntAsString.optional()
        .transform((val) => toNumber(val, 6379))
        .describe("Redis server port. Defaults to 6379"),
    REDIS_PASSWORD: z.string().optional()
        .transform(emptyStringToUndefined)
        .describe("Redis authentication password"),

    // Map Storage
    MAP_STORAGE_URL: z.string().optional()
        .transform(emptyStringToUndefined)
        .describe('gRPC endpoint of the map-storage server'),
    PUBLIC_MAP_STORAGE_URL: z.string().url().optional()
        .transform(emptyStringToUndefined)
        .describe('Public URL to the map-storage server'),
    INTERNAL_MAP_STORAGE_URL: AbsoluteOrRelativeUrl.optional()
        .transform(emptyStringToUndefined)
        .describe('Internal URL to the map-storage server'),

    // Features
    ENABLE_MAP_EDITOR: BoolAsString.optional()
        .transform((val) => toBool(val, false))
        .describe("Enable built-in map editor"),
    ENABLE_CHAT: BoolAsString.optional()
        .transform((val) => toBool(val, true))
        .describe("Enable chat feature"),
    ENABLE_CHAT_UPLOAD: BoolAsString.optional()
        .transform((val) => toBool(val, true))
        .describe("Enable file upload in chat"),
    STORE_VARIABLES_FOR_LOCAL_MAPS: BoolAsString.optional()
        .transform((val) => toBool(val, false))
        .describe("Store player variables for local maps"),

    /**
     * ADDED: PLAYER_VARIABLES_MAX_TTL
     * This fixes the "Property does not exist" error in EnvironmentVariable.ts
     */
    PLAYER_VARIABLES_MAX_TTL: PositiveIntAsString.optional()
        .transform((val) => toNumber(val, 3600))
        .describe("Maximum time to live for player variables (in seconds)"),

    // Livekit
    LIVEKIT_HOST: z.string().optional().describe("Livekit host"),
    LIVEKIT_API_KEY: z.string().optional().describe("Livekit API key"),
    LIVEKIT_API_SECRET: z.string().optional().describe("Livekit API secret"),
    MAX_USERS_FOR_WEBRTC: PositiveIntAsString.optional()
        .or(z.string().max(0))
        .transform((val) => toNumber(val, 4))
        .describe("Max number of users for WebRTC"),

    // Sentry Monitoring
    SENTRY_DSN: z.string().optional().describe("Sentry DSN"),
    SENTRY_RELEASE: z.string().optional().describe("Sentry release version"),
    SENTRY_ENVIRONMENT: z.string().optional().describe("Sentry environment"),
    SENTRY_TRACES_SAMPLE_RATE: z.string().optional()
        .transform((val) => toNumber(val, 0.1))
        .describe("Sentry traces sample rate (default 0.1)"),

    // Telemetry & Security
    ENABLE_TELEMETRY: BoolAsString.optional()
        .transform((val) => toBool(val, true))
        .describe("Enable WorkAdventure telemetry"),
    SECURITY_EMAIL: z.string().email().optional()
        .describe("Email for security flaw notifications"),
    TELEMETRY_URL: z.string().optional()
        .default("https://stats.workadventu.re"),
    
    // Prometheus Metrics
    PROMETHEUS_AUTHORIZATION_TOKEN: z.string().optional().describe("Prometheus access token"),
    PROMETHEUS_PORT: PositiveIntAsString.optional()
        .transform((val) => toNumber(val, 0))
        .describe("Prometheus metrics port"),
});

export type EnvironmentVariables = z.infer<typeof EnvironmentVariables>;