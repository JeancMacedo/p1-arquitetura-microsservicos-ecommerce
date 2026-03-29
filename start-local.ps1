param(
  [switch]$DryRun
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path

$targets = @(
  @{ Name = "catalog-service";   Path = "services/catalog-service";   Cmd = "npm start" },
  @{ Name = "user-service";      Path = "services/user-service";      Cmd = "npm start" },
  @{ Name = "order-service";     Path = "services/order-service";     Cmd = "npm start" },
  @{ Name = "inventory-service"; Path = "services/inventory-service"; Cmd = "npm start" },
  @{ Name = "payment-service";   Path = "services/payment-service";   Cmd = "npm start" },
  @{ Name = "frontend";          Path = "frontend";                   Cmd = "npx --yes http-server . -p 8080 -c-1" }
)

Write-Host "Iniciando stack local..." -ForegroundColor Cyan

$started = @()

foreach ($target in $targets) {
  $workingDir = Join-Path $root $target.Path

  if (-not (Test-Path $workingDir)) {
    Write-Host "Pulando $($target.Name): pasta nao encontrada em $workingDir" -ForegroundColor Yellow
    continue
  }

  if ($DryRun) {
    Write-Host "[DRY-RUN] $($target.Name): $($target.Cmd) (cwd=$workingDir)" -ForegroundColor DarkCyan
    continue
  }

  $process = Start-Process -FilePath "pwsh" -ArgumentList @("-NoExit", "-Command", $target.Cmd) -WorkingDirectory $workingDir -PassThru

  $started += [PSCustomObject]@{
    Name = $target.Name
    Pid = $process.Id
    Path = $workingDir
  }

  Write-Host "OK: $($target.Name) iniciado (PID=$($process.Id))" -ForegroundColor Green
}

if ($DryRun) {
  Write-Host "Dry-run concluido. Nenhum processo foi iniciado." -ForegroundColor Cyan
  exit 0
}

Write-Host "" 
Write-Host "Stack local iniciada." -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:8080" -ForegroundColor Cyan
Write-Host "Health checks:" -ForegroundColor Cyan
Write-Host "  - http://localhost:3001/health"
Write-Host "  - http://localhost:3002/health"
Write-Host "  - http://localhost:3003/health"
Write-Host "  - http://localhost:3004/health"
Write-Host "  - http://localhost:3005/health"
Write-Host ""
Write-Host "PIDs iniciados nesta execucao:" -ForegroundColor Cyan
$started | Format-Table -AutoSize
