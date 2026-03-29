param(
  [switch]$DryRun
)

$ErrorActionPreference = "Stop"

$ports = @(3001, 3002, 3003, 3004, 3005, 8080)

Write-Host "Encerrando stack local..." -ForegroundColor Cyan

$connections = Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue |
  Where-Object { $ports -contains $_.LocalPort }

if (-not $connections) {
  Write-Host "Nenhum processo em escuta nas portas alvo foi encontrado." -ForegroundColor Yellow
  exit 0
}

$processIds = $connections | Select-Object -ExpandProperty OwningProcess -Unique

foreach ($processId in $processIds) {
  try {
    $process = Get-Process -Id $processId -ErrorAction Stop

    if ($DryRun) {
      Write-Host "[DRY-RUN] Encerraria PID=$processId Nome=$($process.ProcessName)" -ForegroundColor DarkCyan
      continue
    }

    Stop-Process -Id $processId -Force -ErrorAction Stop
    Write-Host "OK: Encerrado PID=$processId Nome=$($process.ProcessName)" -ForegroundColor Green
  } catch {
    Write-Host "Falha ao encerrar PID=${processId}: $($_.Exception.Message)" -ForegroundColor Red
  }
}

if ($DryRun) {
  Write-Host "Dry-run concluido. Nenhum processo foi encerrado." -ForegroundColor Cyan
  exit 0
}

Write-Host "Stack local encerrada." -ForegroundColor Cyan
