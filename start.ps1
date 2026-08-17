# ALYM — un seul terminal (Yarn)
# Usage:  .\start.ps1

Write-Host "=== ALYM ===" -ForegroundColor Yellow

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Host "Installe Node.js LTS: https://nodejs.org/" -ForegroundColor Red
  exit 1
}

if (-not (Get-Command yarn -ErrorAction SilentlyContinue)) {
  Write-Host "Installation de Yarn..." -ForegroundColor Cyan
  npm install -g yarn
}

Write-Host "Node $(node -v) | Yarn $(yarn -v)"

if (-not (Test-Path "apps\api\.env")) {
  Copy-Item "apps\api\.env.example" "apps\api\.env"
  Write-Host ".env cree" -ForegroundColor Green
}

Write-Host "Installation + base de donnees..." -ForegroundColor Cyan
yarn install
yarn db:generate
yarn db:migrate

Write-Host ""
Write-Host "Lancement front + API (1 terminal)..." -ForegroundColor Green
Write-Host "  Front: http://localhost:5173" -ForegroundColor Yellow
Write-Host "  API:   http://localhost:3001/health" -ForegroundColor Yellow
Write-Host ""

yarn dev
