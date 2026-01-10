# --- CONFIGURATION ---
$MAP_STORAGE_TOKEN = "123"
$BACK_URL = "http://localhost:8081"
$PUSHER_URL = "ws://localhost:8081"
$MAP_STORAGE_URL = "http://localhost:8080"
$PLAY_URL = "http://localhost:3000"

# --- TERMINAL 1: MAP STORAGE ---
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd map-storage; `$env:PORT='8080'; `$env:MAP_STORAGE_API_TOKEN='$MAP_STORAGE_TOKEN'; `$env:API_URL='$BACK_URL'; `$env:PUSHER_URL='$PUSHER_URL'; `$env:ESBK_TSCONFIG_PATH='tsconfig-node.json'; npm run dev"

# --- TERMINAL 2: BACKEND ---
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd back; `$env:PLAY_URL='$PLAY_URL'; `$env:MAP_STORAGE_URL='$MAP_STORAGE_URL'; `$env:MAP_STORAGE_API_TOKEN='$MAP_STORAGE_TOKEN'; `$env:AUTHENTICATION_STRATEGY='none'; `$env:IGNORE_ADMIN_API='true'; `$env:ADMIN_API_TOKEN='$MAP_STORAGE_TOKEN'; npm run dev"

# --- TERMINAL 3: FRONTEND ---
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd play; npx vite --port 3000 --force"

Write-Host "All services starting... Please wait a few seconds, then open:" -ForegroundColor Cyan
Write-Host "$PLAY_URL/_/global/localhost:8080/Floor0/floor0.json" -ForegroundColor Yellow