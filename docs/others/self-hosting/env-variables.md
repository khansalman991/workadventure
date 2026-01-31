# Environment Variables

This document lists all environment variables used by WorkAdventure services. These variables are defined in the `.env` file.

> ⚠️ **Auto-generated file** - Do not edit manually. Run `npm run generate-env-docs` to update.

## Play Service

Environment variables for the Play service (frontend and pusher).

| Variable | Required | Description |
|----------|----------|-------------|
| `SECRET_KEY` | Yes | Secret key used to encode JWT tokens. Set this to a random unguessable string. |
| `API_URL` | Yes | URL of the back server API |
| `ADMIN_API_URL` | Yes | The URL to the admin API. If in the same network, you can use a local name here. |
| `ADMIN_URL` | Yes | The URL to the admin. This should be a publicly accessible URL. |
| `ADMIN_BO_URL` | Yes | The URL to the admin dashboard. Will be used to redirect the user to the admin dashboard. You can put it a URL that will automatically connect the user. |
| `ADMIN_API_TOKEN` | Yes | Authentication token for the admin API |
| `AUTOLOGIN_URL` | Yes | The URL to be used to automatically log someone given a token. |
| `ADMIN_SOCKETS_TOKEN` | Yes | Authentication token to connect to 'play' admin websocket endpoint. This endpoint is typically used to list users connected to a given room. |
| `CPU_OVERHEAT_THRESHOLD` | Yes | CPU usage threshold (in %) that triggers performance warnings. Defaults to 80 |
| `PUSHER_HTTP_PORT` | Yes | HTTP port for the pusher service. Defaults to 3000 |
| `PUSHER_WS_PORT` | Yes | WebSocket port for the pusher service. Defaults to 3001 |
| `SOCKET_IDLE_TIMER` | Yes | maximum time (in second) without activity before a socket is closed. Should be greater than 60 seconds in order to cope for Chrome intensive throttling (https://developer.chrome.com/blog/timer-throttling-in-chrome-88/#intensive-throttling) |
| `VITE_URL` | Yes | URL of the Vite development server (development only) |
| `ALLOWED_CORS_ORIGIN` | Yes | Allowed CORS origin for API requests. Use '*' to allow any domain |
| `PUSHER_URL` | Yes | Public URL of the pusher service |
| `FRONT_URL` | Yes | Public URL of the frontend application |
| `MAP_STORAGE_API_TOKEN` | Yes | API token for authenticating with the map-storage service |
| `PUBLIC_MAP_STORAGE_URL` | Yes | The public URL to the map-storage server (for instance: "https://map-storage.example.com") |
| `INTERNAL_MAP_STORAGE_URL` | Yes | The internal URL to the map-storage server (for instance: "https://map-storage:3000") |
| `OPENID_CLIENT_ID` | Yes | OAuth2 client ID for OpenID Connect authentication |
| `OPENID_CLIENT_SECRET` | Yes | OAuth2 client secret for OpenID Connect authentication |
| `OPENID_CLIENT_ISSUER` | Yes | OpenID Connect issuer URL (identity provider) |
| `OPENID_CLIENT_REDIRECT_URL` | Yes | OAuth2 redirect URL after successful authentication |
| `OPENID_CLIENT_REDIRECT_LOGOUT_URL` | Yes | Redirect URL after user logout |
| `OPENID_PROFILE_SCREEN_PROVIDER` | Yes | URL of the 'profile' page (typically part of the optionnal Admin component) |
| `OPENID_SCOPE` | Yes | OAuth2 scopes to request (space-separated). Defaults to 'openid email profile' |
| `OPENID_PROMPT` | Yes | OpenID Connect prompt parameter (e.g., 'login', 'consent') |
| `OPENID_USERNAME_CLAIM` | Yes | JWT claim to use as the username. Defaults to 'preferred_username' |
| `OPENID_LOCALE_CLAIM` | Yes | JWT claim to use for user locale. Defaults to 'locale' |
| `OPENID_WOKA_NAME_POLICY` | Yes | Policy for avatar naming: 'user_input' or 'openid_nickname' |
| `OPENID_TAGS_CLAIM` | Yes | JWT claim containing user tags/roles |
| `DISABLE_ANONYMOUS` | Yes | If true, anonymous users cannot access the platform. Defaults to false |
| `PROMETHEUS_AUTHORIZATION_TOKEN` | Yes | The token to access the Prometheus metrics. |
| `PROMETHEUS_PORT` | Yes | The port to access the Prometheus metrics. If not set, the default port is used AND an authorization token is required. |
| `ENABLE_CHAT` | Yes | Enable/disable the chat feature. Defaults to true |
| `ENABLE_CHAT_UPLOAD` | Yes | Enable/disable file upload in chat. Defaults to true |
| `ENABLE_CHAT_ONLINE_LIST` | Yes | Enable/disable online users list in chat. Defaults to true |
| `ENABLE_CHAT_DISCONNECTED_LIST` | Yes | Enable/disable offline users list in chat. Defaults to true |
| `ENABLE_SAY` | Yes | Whether the users can communicate via comics-style bubbles. |
| `ENABLE_ISSUE_REPORT` | Yes | Whether the feature 'issue report' is enabled or not on this room. Defaults to true. |
| `ENABLE_OPENAPI_ENDPOINT` | Yes | Enable/disable the OpenAPI documentation endpoint. Defaults to false |
| `START_ROOM_URL` | Yes | Default room URL where users start when accessing the platform |
| `DEBUG_MODE` | Yes | Enable debug mode with additional console logging. Defaults to false |
| `UPLOADER_URL` | Yes | URL of the file uploader service |
| `ICON_URL` | Yes | Base URL for icon resources |
| `STUN_SERVER` | Yes | Comma separated list of STUN server URLs for WebRTC NAT traversal (format: 'stun:hostname:port') |
| `TURN_SERVER` | Yes | Comma separated list of TURN server URLs for WebRTC relay (format: 'turn:hostname:port') |
| `SKIP_RENDER_OPTIMIZATIONS` | Yes | Skip rendering optimizations (useful for debugging). Defaults to false |
| `DISABLE_NOTIFICATIONS` | Yes | Disable browser notifications. Defaults to false |
| `TURN_USER` | Yes | Username for TURN server authentication |
| `TURN_PASSWORD` | Yes | Password for TURN server authentication |
| `TURN_STATIC_AUTH_SECRET` | Yes | The auth secret to generate TURN credentials on the fly (enabled by the --use-auth-secret and --auth-secret in Coturn). |
| `JITSI_URL` | Yes | URL of the Jitsi Meet server for video conferencing |
| `JITSI_PRIVATE_MODE` | Yes | If true, Jitsi rooms are private and require authentication. Defaults to false |
| `MAX_USERNAME_LENGTH` | Yes | Maximum allowed length for usernames. Defaults to 10 |
| `MAX_PER_GROUP` | Yes | Maximum number of users in a bubble/group. Defaults to 4 |
| `MAX_DISPLAYED_VIDEOS` | Yes | An approximation of the maximum number of videos displayed at once. If there are more videos to display, the user will have to scroll. The number of videos can sometimes be slightly greater (MAX_DISPLAYED_VIDEOS + number of videos to display % number of videos per row). This is useful to avoid overloading the Livekit server when a lot of people are in the same room. |
| `NODE_ENV` | Yes | Node.js environment: 'development', 'production', or 'test' |
| `CONTACT_URL` | Yes | URL for users to contact support or administrators |
| `POSTHOG_API_KEY` | Yes | PostHog API key for analytics tracking |
| `POSTHOG_URL` | Yes | PostHog server URL for analytics. Defaults to PostHog cloud |
| `FALLBACK_LOCALE` | Yes | Default locale/language code when user's locale is not available (e.g., 'en', 'fr') |
| `ENABLE_REPORT_ISSUES_MENU` | Yes | Enable the 'Report Issues' menu option. Defaults to false |
| `REPORT_ISSUES_URL` | Yes | URL where users can report issues (e.g., GitHub issues, support portal) |
| `LOGROCKET_ID` | Yes | LogRocket application ID for session recording and monitoring |
| `SENTRY_DSN_FRONT` | Yes | Sentry DSN for frontend error tracking |
| `SENTRY_DSN_PUSHER` | Yes | Sentry DSN for pusher service error tracking |
| `SENTRY_RELEASE` | Yes | Sentry release version identifier for error tracking |
| `SENTRY_ENVIRONMENT` | Yes | Sentry environment name (e.g., 'production', 'staging', 'development') |
| `SENTRY_TRACES_SAMPLE_RATE` | Yes | The sampling rate for Sentry traces. Only used if SENTRY_DSN is configured. Defaults to 0.1 |
| `ROOM_API_PORT` | Yes | Port for the Room API gRPC server. Defaults to 50051 |
| `ROOM_API_SECRET_KEY` | Yes | Secret key for Room API authentication |
| `ENABLE_MAP_EDITOR` | Yes | Enable the built-in map editor. Defaults to false |
| `MAP_EDITOR_ALLOWED_USERS` | Yes | Comma-separated list of user IDs allowed to edit maps |
| `MAP_EDITOR_ALLOW_ALL_USERS` | Yes | If set to true, all users can edit the map. If set to false, only the users in MAP_EDITOR_ALLOWED_USERS or users with the "admin" or "editor" tag can edit the map. Note: this setting is ignored if an Admin API is configured. |
| `WOKA_SPEED` | Yes | Avatar (WOKA) movement speed. Defaults to 9 |
| `FEATURE_FLAG_BROADCAST_AREAS` | Yes | Enable broadcast areas feature. Defaults to false |
| `KLAXOON_ENABLED` | Yes | Enable Klaxoon embedded application integration. Defaults to false |
| `KLAXOON_CLIENT_ID` | Yes | Klaxoon OAuth2 client ID |
| `YOUTUBE_ENABLED` | Yes | Enable YouTube map editor tool. Defaults to false |
| `GOOGLE_DRIVE_ENABLED` | Yes | Enable Google Drive map editor tool. Defaults to false |
| `GOOGLE_DOCS_ENABLED` | Yes | Enable Google Docs map editor tool. Defaults to false |
| `GOOGLE_SHEETS_ENABLED` | Yes | Enable Google Sheets map editor tool. Defaults to false |
| `GOOGLE_SLIDES_ENABLED` | Yes | Enable Google Slides map editor tool. Defaults to false |
| `ERASER_ENABLED` | Yes | Enable Eraser.io embedded whiteboard. Defaults to false |
| `EXCALIDRAW_ENABLED` | Yes | Enable Excalidraw embedded whiteboard. Defaults to false |
| `EXCALIDRAW_DOMAINS` | Yes | Comma-separated list of allowed Excalidraw domains |
| `EMBEDDED_DOMAINS_WHITELIST` | Yes | Comma-separated list of domains allowed for embedded iframes |
| `CARDS_ENABLED` | Yes | Enable Cards embedded application. Defaults to false |
| `TLDRAW_ENABLED` | Yes | Enable tldraw embedded whiteboard. Defaults to false |
| `PEER_VIDEO_LOW_BANDWIDTH` | Yes | Low bandwidth threshold for peer video (in kbps) |
| `PEER_VIDEO_RECOMMENDED_BANDWIDTH` | Yes | Recommended bandwidth for peer video (in kbps) |
| `PEER_SCREEN_SHARE_LOW_BANDWIDTH` | Yes | Low bandwidth threshold for screen sharing (in kbps) |
| `PEER_SCREEN_SHARE_RECOMMENDED_BANDWIDTH` | Yes | Recommended bandwidth for screen sharing (in kbps) |
| `GOOGLE_DRIVE_PICKER_CLIENT_ID` | Yes | Google OAuth2 client ID for Drive Picker |
| `GOOGLE_DRIVE_PICKER_API_KEY` | Yes | Google API key for Drive Picker |
| `GOOGLE_DRIVE_PICKER_APP_ID` | Yes | Google application ID for Drive Picker |
| `MATRIX_API_URI` | Yes | Matrix homeserver API URI (internal) |
| `MATRIX_PUBLIC_URI` | Yes | Matrix homeserver public URI |
| `MATRIX_ADMIN_USER` | Yes | Matrix administrator username |
| `MATRIX_ADMIN_PASSWORD` | Yes | Matrix administrator password |
| `MATRIX_DOMAIN` | Yes | Matrix server domain |
| `EMBEDLY_KEY` | Yes | Embedly API key for rich link previews |
| `GRPC_MAX_MESSAGE_SIZE` | Yes | The maximum size of a gRPC message. Defaults to 20 MB. |
| `BACKGROUND_TRANSFORMER_ENGINE` | Yes | Virtual background transformer engine: 'tasks-vision' (GPU-accelerated, experimental) or 'selfie-segmentation' (CPU-based, stable). Currently defaults to 'selfie-segmentation'; 'tasks-vision' is intended as the future default once considered stable. |

## Back Service

Environment variables for the Back service (backend API).

| Variable | Required | Description |
|----------|----------|-------------|
| `PLAY_URL` | Yes | Public URL of the play/frontend service |
| `MINIMUM_DISTANCE` | Yes | Minimum distance (in pixels) before users are considered to be in proximity. Defaults to 64 |
| `GROUP_RADIUS` | Yes | Radius (in pixels) of a group/bubble. Defaults to 48 |
| `MAX_PER_GROUP` | Yes | Maximum number of users in a bubble/group. Defaults to 4 |
| `ADMIN_API_URL` | Yes | URL of the admin API for centralized configuration |
| `ADMIN_API_TOKEN` | Yes | Authentication token for the admin API |
| `CPU_OVERHEAT_THRESHOLD` | Yes | CPU usage threshold (%) for dropping packets. Defaults to 80 |
| `JITSI_URL` | Yes | URL of the Jitsi Meet server |
| `JITSI_ISS` | Yes | Jitsi JWT issuer |
| `SECRET_JITSI_KEY` | Yes | Secret key for Jitsi JWT |
| `BBB_URL` | Yes | BigBlueButton server URL |
| `BBB_SECRET` | Yes | BigBlueButton shared secret |
| `HTTP_PORT` | Yes | HTTP port for the back service. Defaults to 8080 |
| `GRPC_PORT` | Yes | gRPC port for the back service. Defaults to 50051 |
| `GRPC_MAX_MESSAGE_SIZE` | Yes | Max size of a gRPC message (default 20MB) |
| `REDIS_HOST` | Yes | Redis server hostname |
| `REDIS_PORT` | Yes | Redis server port. Defaults to 6379 |
| `REDIS_PASSWORD` | Yes | Redis authentication password |
| `MAP_STORAGE_URL` | Yes | gRPC endpoint of the map-storage server |
| `PUBLIC_MAP_STORAGE_URL` | Yes | Public URL to the map-storage server |
| `INTERNAL_MAP_STORAGE_URL` | Yes | Internal URL to the map-storage server |
| `ENABLE_MAP_EDITOR` | Yes | Enable built-in map editor |
| `ENABLE_CHAT` | Yes | Enable chat feature |
| `ENABLE_CHAT_UPLOAD` | Yes | Enable file upload in chat |
| `STORE_VARIABLES_FOR_LOCAL_MAPS` | Yes | Store player variables for local maps |
| `LIVEKIT_HOST` | Yes | Livekit host |
| `LIVEKIT_API_KEY` | Yes | Livekit API key |
| `LIVEKIT_API_SECRET` | Yes | Livekit API secret |
| `MAX_USERS_FOR_WEBRTC` | Yes | Max number of users for WebRTC |
| `SENTRY_DSN` | Yes | Sentry DSN |
| `SENTRY_RELEASE` | Yes | Sentry release version |
| `SENTRY_ENVIRONMENT` | Yes | Sentry environment |
| `SENTRY_TRACES_SAMPLE_RATE` | Yes | Sentry traces sample rate (default 0.1) |
| `ENABLE_TELEMETRY` | Yes | Enable WorkAdventure telemetry |
| `SECURITY_EMAIL` | Yes | Email for security flaw notifications |
| `TELEMETRY_URL` | Yes | - |
| `PROMETHEUS_AUTHORIZATION_TOKEN` | Yes | Prometheus access token |
| `PROMETHEUS_PORT` | Yes | Prometheus metrics port |

## Map Storage Service

Environment variables for the Map Storage service.

| Variable | Required | Description |
|----------|----------|-------------|
| `API_URL` | Yes | The URI(s) of the back server |
| `AWS_ACCESS_KEY_ID` | Yes | AWS access key ID for S3 storage. If empty, local storage is used instead. |
| `AWS_SECRET_ACCESS_KEY` | Yes | AWS secret access key for S3 storage. If empty, local storage is used instead. |
| `AWS_DEFAULT_REGION` | Yes | AWS region for S3 storage (e.g., 'us-east-1', 'eu-west-1') |
| `AWS_BUCKET` | Yes | S3 bucket name for map storage. If empty, local storage is used instead. |
| `AWS_URL` | Yes | URL of the S3 endpoint. |
| `S3_MAX_PARALLEL_REQUESTS` | Yes | The maximum parallel number of requests done to the S3 bucket. Defaults to 50. |
| `S3_CONNECTION_TIMEOUT` | Yes | The timeout in milliseconds for the S3 connection in milliseconds. Defaults to 5000 (5 seconds). |
| `S3_REQUEST_TIMEOUT` | Yes | The timeout in milliseconds for the S3 requests in milliseconds. Defaults to 60000 (60 seconds). |
| `S3_UPLOAD_CONCURRENCY_LIMIT` | Yes | Maximum number of concurrent S3 upload operations. Defaults to 100 |
| `MAX_UNCOMPRESSED_SIZE` | Yes | The maximum size of an uploaded file. This the total size of the uncompressed file (not the ZIP file). Defaults to 1GB |
| `USE_DOMAIN_NAME_IN_PATH` | Yes | If true, the domain name will be used as a top level directory when fetching/storing files |
| `PATH_PREFIX` | Yes | The prefix to strip if a reverse proxy is proxying calls to the map-storage from a path, e.g. /map-storage |
| `STORAGE_DIRECTORY` | Yes | Storage directory for the maps on physical disk. Used if S3 storage is not configured. |
| `CACHE_CONTROL` | Yes | The cache-control HTTP header to be used for "normal" resources. Note: resources containing a hash in the name will be set to "immutable", whatever this setting is. |
| `ENABLE_WEB_HOOK` | Yes | If true, the webhook will be called when a WAM file is created |
| `WEB_HOOK_URL` | Yes | The URL of the webhook to call when a WAM file is created / updated / deleted. The URL will be called using POST. |
| `WEB_HOOK_API_TOKEN` | Yes | The (optional) API token to use when calling the webhook. The token will be sent in the Authorization header of the POST request. |
| `MAX_SIMULTANEOUS_FS_READS` | Yes | The maximum number of simultaneous file system (local or S3) reads when regenerating the cache file. Defaults to 100. |
| `SENTRY_DSN` | Yes | If set, WorkAdventure will send errors to Sentry |
| `SENTRY_RELEASE` | Yes | The Sentry release we target. Only used if SENTRY_DSN is configured. |
| `SENTRY_ENVIRONMENT` | Yes | The Sentry environment we target. Only used if SENTRY_DSN is configured. |
| `SENTRY_TRACES_SAMPLE_RATE` | Yes | The sampling rate for Sentry traces. Only used if SENTRY_DSN is configured. Defaults to 0.1 |
| `AUTHENTICATION_STRATEGY` | Yes | Deprecated. Use ENABLE_BEARER_AUTHENTICATION, ENABLE_BASIC_AUTHENTICATION or ENABLE_DIGEST_AUTHENTICATION instead |
| `ENABLE_BEARER_AUTHENTICATION` | Yes | Enables bearer authentication. When true, you need to set either AUTHENTICATION_TOKEN or AUTHENTICATION_VALIDATOR_URL |
| `AUTHENTICATION_TOKEN` | Yes | The hard-coded bearer token to use for authentication |
| `AUTHENTICATION_VALIDATOR_URL` | Yes | The URL that will be used to remotely validate a bearer token |
| `ENABLE_BASIC_AUTHENTICATION` | Yes | Enables basic authentication. When true, you need to set both AUTHENTICATION_USER and AUTHENTICATION_PASSWORD |
| `ENABLE_DIGEST_AUTHENTICATION` | Yes | Enables basic authentication. When true, you need to set both AUTHENTICATION_USER and AUTHENTICATION_PASSWORD |
| `AUTHENTICATION_USER` | Yes | Username for Basic or Digest authentication |
| `AUTHENTICATION_PASSWORD` | Yes | Password for Basic or Digest authentication |
| `WAM_TEMPLATE_URL` | Yes | The URL to fetch an empty WAM template |
| `ENTITY_COLLECTION_URLS` | Yes | A comma separated list of entity collection URLs to be used when a new TMJ map is uploaded. Note: ignored if WAM_TEMPLATE_URL is set. |
| `MAP_STORAGE_API_TOKEN` | Yes | API token to access the map-storage REST API |
| `PUSHER_URL` | Yes | URL of the pusher service |
| `WHITELISTED_RESOURCE_URLS` | Yes | Comma-separated list of allowed URLs for loading external resources |
| `SECRET_KEY` | Yes | The JWT token to use when the map-storage is used as a file server. This token will be used to authenticate the user when accessing files. |
| `GRPC_MAX_MESSAGE_SIZE` | Yes | The maximum size of a gRPC message. Defaults to 20 MB. |
| `BODY_PARSER_JSON_SIZE_LIMIT` | Yes | The maximum size of JSON request bodies accepted by the body parser (used in PUT / PATCH HTTP requests). Defaults to 100mb. Examples: '50mb', '200mb', '1gb' |

## Deprecated Variables

The following variables are deprecated and will be removed in a future version. Please use the `OPENID_*` equivalents instead.

| Variable | Required | Description |
|----------|----------|-------------|
| `OPID_CLIENT_ID` | Yes | - |
| `OPID_CLIENT_SECRET` | Yes | - |
| `OPID_CLIENT_ISSUER` | Yes | - |
| `OPID_CLIENT_REDIRECT_URL` | Yes | - |
| `OPID_CLIENT_REDIRECT_LOGOUT_URL` | Yes | - |
| `OPID_PROFILE_SCREEN_PROVIDER` | Yes | - |
| `OPID_SCOPE` | Yes | - |
| `OPID_PROMPT` | Yes | - |
| `OPID_USERNAME_CLAIM` | Yes | - |
| `OPID_LOCALE_CLAIM` | Yes | - |
| `OPID_WOKA_NAME_POLICY` | Yes | - |
| `OPID_TAGS_CLAIM` | Yes | - |
