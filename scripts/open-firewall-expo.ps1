# PowerShell COMO ADMINISTRADOR:
#   cd "...\Goi App"
#   .\scripts\open-firewall-expo.ps1

$ErrorActionPreference = "Stop"

if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole(
    [Security.Principal.WindowsBuiltInRole]::Administrator)) {
  Write-Host "ERROR: Ejecuta PowerShell como Administrador." -ForegroundColor Red
  exit 1
}

# Red en Publico bloquea casi todo el trafico entrante (muy comun con el QR de Expo).
Get-NetConnectionProfile | ForEach-Object {
  if ($_.NetworkCategory -ne "Private") {
    Set-NetConnectionProfile -InterfaceIndex $_.InterfaceIndex -NetworkCategory Private
    Write-Host "Red '$($_.Name)' pasada a PRIVADO." -ForegroundColor Green
  }
}

$rules = @(
  @{ Name = "Goi Expo Metro 8081"; Port = 8081 },
  @{ Name = "Goi API Server 4000"; Port = 4000 }
)

foreach ($r in $rules) {
  $existing = Get-NetFirewallRule -DisplayName $r.Name -ErrorAction SilentlyContinue
  if ($existing) {
    Set-NetFirewallRule -DisplayName $r.Name -Profile Any -Enabled True | Out-Null
    Write-Host "Actualizado: $($r.Name) (todos los perfiles)" -ForegroundColor Yellow
    continue
  }
  New-NetFirewallRule -DisplayName $r.Name -Direction Inbound -Protocol TCP `
    -LocalPort $r.Port -Action Allow -Profile Any | Out-Null
  Write-Host "OK: $($r.Name) puerto $($r.Port)" -ForegroundColor Green
}

Write-Host ""
Write-Host "Listo. Ejecuta en Goi App:  npm run start:qr" -ForegroundColor Cyan
