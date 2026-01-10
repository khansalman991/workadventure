# Get all folders that contain a package.json file
$folders = Get-ChildItem -Path . -Recurse -Filter "package.json" | Select-Object -ExpandProperty DirectoryName

foreach ($folder in $folders) {
    if ($folder -match "node_modules") { continue } # Skip node_modules
    
    Write-Host "--------------------------------------------------" -ForegroundColor Cyan
    Write-Host "Processing: $folder" -ForegroundColor Yellow
    
    cd $folder
    
    Write-Host "Running: npm install..."
    npm install --quiet
    
    # Check if a build script exists in package.json before running
    $packageJson = Get-Content "package.json" | ConvertFrom-Json
    if ($packageJson.scripts.build) {
        Write-Host "Running: npm run build..."
        npm run build
    }
}

Write-Host "--------------------------------------------------" -ForegroundColor Cyan
Write-Host "All folders processed!" -ForegroundColor Green