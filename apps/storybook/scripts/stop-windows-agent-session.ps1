$ErrorActionPreference = 'Stop'

$packageRoot = Split-Path -Parent $PSScriptRoot
$sessionPath = Join-Path $packageRoot 'artifacts\windows\agent-session.json'

if (-not (Test-Path -LiteralPath $sessionPath)) {
  throw "No agent session manifest exists at '$sessionPath'."
}

$session = Get-Content -LiteralPath $sessionPath -Raw | ConvertFrom-Json
$currentProcessId = $PID

$session.processes |
  Where-Object { $_.id -and $_.id -ne $currentProcessId } |
  Select-Object -ExpandProperty id -Unique |
  ForEach-Object {
    $process = Get-Process -Id $_ -ErrorAction SilentlyContinue
    if ($process) {
      Stop-Process -Id $_
    }
  }

Remove-Item -LiteralPath $sessionPath
Write-Host 'Windows agent session stopped.'
