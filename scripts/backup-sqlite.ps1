# Respaldo SQLite — EmpleaNet / Continental Oportunidades
# Uso: .\scripts\backup-sqlite.ps1

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot
$dbPath = Join-Path $repoRoot "database\empleanet.db"
$backupDir = Join-Path $repoRoot "database\backups"

if (-not (Test-Path $dbPath)) {
  Write-Error "No se encontró la base de datos en $dbPath"
}

New-Item -ItemType Directory -Force -Path $backupDir | Out-Null
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$dest = Join-Path $backupDir "empleanet-$timestamp.db"

Copy-Item -Path $dbPath -Destination $dest
Write-Host "Respaldo creado: $dest"
