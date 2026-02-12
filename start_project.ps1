# Startup Script for Bot Beacon Central
Write-Host "Starting MongoDB..." -ForegroundColor Cyan
if (!(Test-Path "mongodb_data")) {
    New-Item -ItemType Directory -Path "mongodb_data" | Out-Null
}

$mongodPath = "C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe"
if (Test-Path $mongodPath) {
    Start-Process -FilePath $mongodPath -ArgumentList "--dbpath mongodb_data --port 27017" -NoNewWindow
    Write-Host "MongoDB starting in background..." -ForegroundColor Green
} else {
    Write-Host "Error: MongoDB not found at $mongodPath" -ForegroundColor Red
    exit
}

Write-Host "Waiting for MongoDB to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host "Starting Backend Server..." -ForegroundColor Cyan
cd server
npm run dev
