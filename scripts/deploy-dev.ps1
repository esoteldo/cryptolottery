# Deploy del frontend DEV a GitHub Pages (repo cryptolottery-dev).
#
# Flujo: build con .env.development -> docs-dev/ -> espejo en
# ..\cryptolottery-dev\docs -> commit + push (GitHub Pages sirve de ahi).
#
# Prerequisito (una sola vez): clonar el repo dev como hermano de este:
#   git clone https://github.com/esoteldo/cryptolottery-dev ..\cryptolottery-dev
#
# Uso:
#   npm run deploy:dev
#   npm run deploy:dev -- -Message "fix del header"

param(
    [string]$Message = "deploy dev"
)

$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$devRepo = Join-Path (Split-Path -Parent $root) 'cryptolottery-dev'

if (-not (Test-Path (Join-Path $devRepo '.git'))) {
    Write-Host "ERROR: no existe el repo dev en $devRepo" -ForegroundColor Red
    Write-Host "Clonalo primero: git clone https://github.com/esoteldo/cryptolottery-dev `"$devRepo`"" -ForegroundColor Yellow
    exit 1
}

Write-Host "Build dev (docs-dev/)..." -ForegroundColor Cyan
Push-Location $root
npm run build:dev
if ($LASTEXITCODE -ne 0) { Pop-Location; exit 1 }
Pop-Location

Write-Host "Sincronizando docs-dev/ -> cryptolottery-dev/docs/..." -ForegroundColor Cyan
robocopy (Join-Path $root 'docs-dev') (Join-Path $devRepo 'docs') /MIR /NFL /NDL /NJH | Out-Null
# robocopy: exit codes 0-7 son exito (0=sin cambios, 1=copiado, etc), >=8 error
if ($LASTEXITCODE -ge 8) {
    Write-Host "ERROR: robocopy fallo con codigo $LASTEXITCODE" -ForegroundColor Red
    exit 1
}

Push-Location $devRepo
git add -A
$pending = git status --porcelain
if (-not $pending) {
    Write-Host "Sin cambios respecto al ultimo deploy." -ForegroundColor Yellow
    Pop-Location
    exit 0
}
git commit -m $Message
if ($LASTEXITCODE -ne 0) { Pop-Location; exit 1 }
git push
if ($LASTEXITCODE -ne 0) { Pop-Location; exit 1 }
Pop-Location

Write-Host "Deploy dev OK -> https://esoteldo.github.io/cryptolottery-dev/ (~1-2 min en propagar)" -ForegroundColor Green
