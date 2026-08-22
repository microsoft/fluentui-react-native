$ErrorActionPreference = 'Stop'

$packageRoot = Split-Path -Parent $PSScriptRoot
$sessionPath = Join-Path $packageRoot 'artifacts\windows\agent-session.json'

if (-not (Test-Path -LiteralPath $sessionPath)) {
  throw "No agent session manifest exists at '$sessionPath'."
}

$session = Get-Content -LiteralPath $sessionPath -Raw | ConvertFrom-Json
$currentProcessId = $PID
$desktopHostLauncherId = $session.processes | Where-Object { $_.role -eq 'desktop-host-launcher' } | Select-Object -First 1 -ExpandProperty id
$desktopHostId = $session.processes | Where-Object { $_.role -eq 'desktop-host' } | Select-Object -First 1 -ExpandProperty id

if ($session.desktopHostShutdownPath) {
  Set-Content -LiteralPath $session.desktopHostShutdownPath -Value 'stop'
  $deadline = (Get-Date).AddSeconds(15)
  while ((Get-Date) -lt $deadline) {
    $host = Get-Process -Id $desktopHostId -ErrorAction SilentlyContinue
    if (-not $host) {
      break
    }
    Start-Sleep -Milliseconds 250
  }
}

if ($desktopHostLauncherId -and (Get-Process -Id $desktopHostLauncherId -ErrorAction SilentlyContinue)) {
  & taskkill.exe /PID $desktopHostLauncherId /T /F | Out-Null
}
if ($desktopHostId -and (Get-Process -Id $desktopHostId -ErrorAction SilentlyContinue)) {
  & taskkill.exe /PID $desktopHostId /T /F | Out-Null
}

$session.processes |
  Where-Object { $_.role -notlike 'desktop-host*' -and $_.id -and $_.id -ne $currentProcessId } |
  Select-Object -ExpandProperty id -Unique |
  ForEach-Object {
    $process = Get-Process -Id $_ -ErrorAction SilentlyContinue
    if ($process) {
      Stop-Process -Id $_
    }
  }

if ($session.desktopHostShutdownPath) {
  Remove-Item -LiteralPath $session.desktopHostShutdownPath -Force -ErrorAction SilentlyContinue
}
Remove-Item -LiteralPath $sessionPath
Write-Host 'Windows agent session stopped.'
