# Expo Go en Android por USB (evita Wi‑Fi / router / "Failed to download remote update").
# Requisitos: depuración USB activa, cable, adb en PATH (Android platform-tools).
# Uso: .\scripts\start-phone-usb.ps1

$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "..")

function Test-Adb {
  $adb = Get-Command adb -ErrorAction SilentlyContinue
  if (-not $adb) {
    Write-Host "ERROR: 'adb' no está en el PATH." -ForegroundColor Red
    Write-Host "Instala Android platform-tools o Android Studio." -ForegroundColor Yellow
    exit 1
  }
}

Test-Adb

Write-Host "Comprobando dispositivo USB..." -ForegroundColor Cyan
$devices = adb devices 2>&1 | Out-String
if ($devices -notmatch "device\s*$" -or $devices -match "unauthorized") {
  Write-Host $devices
  Write-Host ""
  Write-Host "ERROR: Conecta el móvil por USB, activa Depuración USB y acepta la huella RSA en el teléfono." -ForegroundColor Red
  exit 1
}

Write-Host "Redirigiendo puertos 8081 (Metro) y 4000 (API)..." -ForegroundColor Cyan
adb reverse tcp:8081 tcp:8081
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
adb reverse tcp:4000 tcp:4000
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

$env:EXPO_PUBLIC_API_URL = "http://127.0.0.1:4000/api"

Write-Host ""
Write-Host "=== Expo Go (USB) ===" -ForegroundColor Green
Write-Host "1. Deja esta ventana abierta (Metro)." -ForegroundColor White
Write-Host "2. Backend Goi Web: cd server && npm run dev  (puerto 4000)" -ForegroundColor White
Write-Host "3. En Expo Go: Enter URL manually ->  exp://127.0.0.1:8081" -ForegroundColor Cyan
Write-Host "   (NO uses el QR de 192.168.x.x con USB)" -ForegroundColor DarkGray
Write-Host "4. API en esta sesión: $env:EXPO_PUBLIC_API_URL" -ForegroundColor DarkGray
Write-Host ""

$clear = $args -contains "-c" -or $args -contains "--clear" -or $args -contains "clean"
if ($clear) {
  npx expo start --localhost -c
} else {
  npx expo start --localhost
}
