# Arranque para escanear QR con Expo Go (sin túnel).
# Uso: .\scripts\start-qr.ps1

$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "..")

$ip = (
  Get-NetIPAddress -AddressFamily IPv4 |
    Where-Object {
      $_.IPAddress -notmatch "^127\." -and
      $_.IPAddress -notmatch "^169\.254\." -and
      $_.PrefixOrigin -ne "WellKnown"
    } |
    Sort-Object InterfaceMetric |
    Select-Object -First 1
).IPAddress

if (-not $ip) {
  Write-Host "No se encontro IPv4 local. Conectate a la red e intentalo de nuevo." -ForegroundColor Red
  exit 1
}

$profile = Get-NetConnectionProfile | Where-Object { $_.IPv4Connectivity -eq "Internet" -or $_.IPv4Connectivity -eq "LocalNetwork" } | Select-Object -First 1
if ($profile -and $profile.NetworkCategory -eq "Public") {
  Write-Host ""
  Write-Host "AVISO: Tu red '$($profile.Name)' esta en perfil PUBLICO." -ForegroundColor Yellow
  Write-Host "Windows suele bloquear el QR. Ejecuta COMO ADMIN:" -ForegroundColor Yellow
  Write-Host "  .\scripts\open-firewall-expo.ps1" -ForegroundColor Yellow
  Write-Host ""
}

$env:REACT_NATIVE_PACKAGER_HOSTNAME = $ip

Write-Host "IP para QR y .env: $ip" -ForegroundColor Cyan
Write-Host "URL Expo: exp://${ip}:8081" -ForegroundColor Cyan
Write-Host "API (.env): EXPO_PUBLIC_API_URL=http://${ip}:4000/api" -ForegroundColor Cyan
Write-Host ""
Write-Host "Tras escanear el QR, aqui debe aparecer 'Android Bundled ...'." -ForegroundColor DarkGray
Write-Host "Si no aparece nada, el movil no llega a Metro (firewall/router)." -ForegroundColor DarkGray
Write-Host ""

$clear = $args -contains "-c" -or $args -contains "--clear"
if ($clear) {
  npx expo start --lan -c
} else {
  npx expo start --lan
}
