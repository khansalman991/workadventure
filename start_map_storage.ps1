Write-Host "Setting Environment Variables..." -ForegroundColor Cyan

# Authentication Settings (Updated for new version)
$env:ENABLE_BEARER_AUTHENTICATION = "true"
$env:AUTHENTICATION_TOKEN = "123456"

# Deprecated but sometimes still checked
$env:MAP_STORAGE_API_TOKEN = "123456"

# Network / Dummy URLs
$env:API_URL = "http://localhost:8080"
$env:PUSHER_URL = "http://localhost:8080" 

# Storage Settings (Minio/S3)
$env:S3_ACCESS_KEY_ID = "minio"
$env:S3_SECRET_ACCESS_KEY = "minio123"
$env:S3_ENDPOINT = "http://localhost:9000"
$env:S3_BUCKET = "workadventure"

Write-Host "Starting Map Storage Server..." -ForegroundColor Green
npm run start --workspace=map-storage
