# npm start — Expo Go por Wi‑Fi (LAN + QR).
# Uso: npm start  |  npm run start:clear  |  npm start clean

$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "..")

function Test-IsWifiAdapter {
  param([string]$InterfaceAlias)
  return $InterfaceAlias -match "Wi-Fi|WLAN|Wireless|WiFi"
}

$candidates = @(
  Get-NetIPAddress -AddressFamily IPv4 |
    Where-Object {
      $_.IPAddress -notmatch "^127\." -and
      $_.IPAddress -notmatch "^169\.254\." -and
      $_.PrefixOrigin -ne "WellKnown"
    }
)

if ($candidates.Count -eq 0) {
  Write-Host "No se encontro IPv4 local. Conectate al Wi-Fi e intentalo de nuevo." -ForegroundColor Red
  exit 1
}

# PC con cable + Wi-Fi: preferir Ethernet en el QR. Muchos routers (TP-Link) aislan
# clientes Wi-Fi entre sí; el movil suele poder hablar con el PC por cable (192.168.1.31)
# pero no con la IP Wi-Fi del propio PC (192.168.1.37).
$chosen = $candidates | Sort-Object @{
  Expression = {
    if (Test-IsWifiAdapter $_.InterfaceAlias) { 2 } else { 0 }
  }
}, InterfaceMetric | Select-Object -First 1

$ip = $chosen.IPAddress
$iface = $chosen.InterfaceAlias

if ($candidates.Count -gt 1) {
  Write-Host "IPs en este PC:" -ForegroundColor DarkGray
  foreach ($c in $candidates) {
    $mark = if ($c.IPAddress -eq $ip) { " <- QR (Expo Go)" } else { "" }
    Write-Host "  $($c.IPAddress)  ($($c.InterfaceAlias))$mark" -ForegroundColor DarkGray
  }
  if ((Test-IsWifiAdapter $iface) -eq $false) {
    Write-Host "  (Ethernet priorizado: evita aislamiento AP movil→Wi-Fi del PC)" -ForegroundColor DarkGray
  }
  Write-Host ""
}

$profile = Get-NetConnectionProfile | Where-Object {
  $_.IPv4Connectivity -eq "Internet" -or $_.IPv4Connectivity -eq "LocalNetwork"
} | Select-Object -First 1

if ($profile -and $profile.NetworkCategory -eq "Public") {
  Write-Host ""
  Write-Host "AVISO: La red '$($profile.Name)' esta en PUBLICO (Windows bloquea el movil)." -ForegroundColor Yellow
  Write-Host "  Panel Wi-Fi -> Propiedades -> Perfil: Privado" -ForegroundColor Yellow
  Write-Host "  O como admin: .\scripts\open-firewall-expo.ps1" -ForegroundColor Yellow
  Write-Host ""
}

$metroRule = Get-NetFirewallRule -DisplayName "Goi Expo Metro 8081" -ErrorAction SilentlyContinue
if (-not $metroRule) {
  Write-Host "AVISO: Firewall sin reglas Goi. Una vez, PowerShell como admin:" -ForegroundColor Yellow
  Write-Host "  .\scripts\open-firewall-expo.ps1" -ForegroundColor Yellow
  Write-Host ""
}

$env:REACT_NATIVE_PACKAGER_HOSTNAME = $ip
$env:EXPO_PUBLIC_API_URL = "http://${ip}:4000/api"

Write-Host "Metro (QR):  exp://${ip}:8081  [$iface]" -ForegroundColor Cyan
Write-Host "API:         $env:EXPO_PUBLIC_API_URL" -ForegroundColor Cyan
Write-Host ""
Write-Host "Prueba en el movil (Chrome):  http://${ip}:8081" -ForegroundColor Yellow
Write-Host "  Si no carga, el QR tampoco funcionara." -ForegroundColor DarkGray
Write-Host ""
Write-Host "1. Backend: cd '..\Goi Web\server' && npm run dev" -ForegroundColor DarkGray
Write-Host "2. Escanea el QR con Expo Go (misma Wi-Fi, datos moviles apagados)" -ForegroundColor DarkGray
Write-Host "3. Debe salir aqui: Android Bundled ..." -ForegroundColor DarkGray
Write-Host ""

$clear =
  $args -contains "-c" -or
  $args -contains "--clear" -or
  $args -contains "clean"

if ($clear) {
  npx expo start --lan -c
} else {
  npx expo start --lan
}
