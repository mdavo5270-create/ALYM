# ALYM — démarrage Windows (PowerShell)
# Usage:  .\start.ps1

Write-Host "=== ALYM Setup ===" -ForegroundColor Yellow

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Host "Node.js manquant. Installe https://nodejs.org/ (LTS) puis relance." -ForegroundColor Red
  exit 1
}

Write-Host "Node: $(node -v)  npm: $(npm -v)"

if (-not (Test-Path "node_modules")) {
  Write-Host "Installation des dependances..." -ForegroundColor Cyan
  npm install
  if ($LASTEXITCODE -ne 0) { exit 1 }
}

if (-not (Test-Path "apps\api\.env")) {
  Copy-Item "apps\api\.env.example" "apps\api\.env"
  Write-Host ".env cree" -ForegroundColor Green
}

Write-Host "Prisma generate + migrate..." -ForegroundColor Cyan
npm run db:generate
npm run db:migrate -- --name init

Write-Host ""
Write-Host "OK. Lance dans DEUX terminaux :" -ForegroundColor Green
Write-Host "  Terminal 1:  npm run dev" -ForegroundColor White
Write-Host "  Terminal 2:  npm run dev:api" -ForegroundColor White
Write-Host ""
Write-Host "Front: http://localhost:5173" -ForegroundColor Yellow
Write-Host "API:   http://localhost:3001/health" -ForegroundColor Yellow
