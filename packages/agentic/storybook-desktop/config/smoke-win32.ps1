$ErrorActionPreference = 'Stop'

$Component = $env:STORYBOOK_WIN32_COMPONENT
$WindowTitle = $env:STORYBOOK_WIN32_WINDOW_TITLE
$TestIDPrefix = $env:STORYBOOK_TEST_ID_PREFIX
$RequiredStoryIds = $env:STORYBOOK_WIN32_REQUIRED_STORIES
$SmokeMode = if ($env:STORYBOOK_SMOKE_MODE) { $env:STORYBOOK_SMOKE_MODE } else { 'stories' }
if (-not $Component -or -not $WindowTitle -or -not $TestIDPrefix) {
  throw 'STORYBOOK_WIN32_COMPONENT, STORYBOOK_WIN32_WINDOW_TITLE, and STORYBOOK_TEST_ID_PREFIX are required.'
}
if ($SmokeMode -notin @('stories', 'stories-and-tests')) {
  throw "STORYBOOK_SMOKE_MODE must be stories or stories-and-tests. Received '$SmokeMode'."
}

$projectRoot = (Get-Location).Path
$artifactRoot = Join-Path $projectRoot 'artifacts\win32'
$logRoot = Join-Path $artifactRoot 'smoke-logs'
$storybookPort = if ($env:STORYBOOK_WS_PORT) { [int]$env:STORYBOOK_WS_PORT } else { 7007 }
$driverPort = if ($env:STORYBOOK_DRIVER_PORT) { [int]$env:STORYBOOK_DRIVER_PORT } else { 0 }
$cliPath = Join-Path $PSScriptRoot 'cli.cjs'
$controlPath = Join-Path $PSScriptRoot 'storybook-control.cjs'
$hostPath = Join-Path $PSScriptRoot 'run-win32.cjs'
$requiredStories = @($RequiredStoryIds -split ',' | Where-Object { $_ })
$applicationLeasePath = $null

if ($SmokeMode -eq 'stories-and-tests' -and (-not $driverPort -or -not $env:STORYBOOK_DRIVER_MANIFEST)) {
  throw 'STORYBOOK_DRIVER_PORT and STORYBOOK_DRIVER_MANIFEST are required for stories-and-tests smoke mode.'
}

New-Item -ItemType Directory -Path $logRoot -Force | Out-Null

function Invoke-DesktopCli {
  param([Parameter(Mandatory)][string[]]$Arguments)

  & node $cliPath @Arguments
  if ($LASTEXITCODE -ne 0) {
    throw "storybook-desktop $($Arguments -join ' ') failed with exit code $LASTEXITCODE."
  }
}

function Start-OwnedCommand {
  param(
    [Parameter(Mandatory)]
    [string]$FilePath,
    [Parameter(Mandatory)]
    [string[]]$ArgumentList,
    [Parameter(Mandatory)]
    [string]$LogName
  )

  return Start-Process -FilePath $FilePath -ArgumentList $ArgumentList -WorkingDirectory $projectRoot `
    -RedirectStandardOutput (Join-Path $logRoot "$LogName.out.log") `
    -RedirectStandardError (Join-Path $logRoot "$LogName.err.log") -PassThru -WindowStyle Hidden
}

function Write-ApplicationLease {
  param(
    [Parameter(Mandatory)]
    [System.Diagnostics.Process]$Process,
    [Parameter(Mandatory)]
    [Microsoft.Management.Infrastructure.CimInstance]$ProcessInfo
  )

  $driverManifest = Get-Content -LiteralPath $env:STORYBOOK_DRIVER_MANIFEST -Raw | ConvertFrom-Json
  if (
    $driverManifest.schemaVersion -ne 2 -or
    -not $driverManifest.application.leasePath -or
    -not $driverManifest.application.leaseNonce
  ) {
    throw "Invalid native Desktop Driver manifest at '$($env:STORYBOOK_DRIVER_MANIFEST)'."
  }
  $leasePath = [string]$driverManifest.application.leasePath
  $leaseDirectory = Split-Path -Parent $leasePath
  New-Item -ItemType Directory -Path $leaseDirectory -Force | Out-Null
  $temporaryPath = "$leasePath.$PID.tmp"
  @{
    schemaVersion = 1
    endpoint = 'win32'
    nonce = [string]$driverManifest.application.leaseNonce
    processId = $Process.Id
    processStartedAt = $Process.StartTime.ToUniversalTime().ToString('o')
    windowTitle = $WindowTitle
    executablePath = [string]$ProcessInfo.ExecutablePath
  } | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath $temporaryPath -Encoding utf8NoBOM
  Move-Item -LiteralPath $temporaryPath -Destination $leasePath -Force
  return $leasePath
}

function Wait-ForTcpPort {
  param(
    [Parameter(Mandatory)]
    [int]$Port,
    [int]$TimeoutSeconds = 120
  )

  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
  while ((Get-Date) -lt $deadline) {
    $client = [System.Net.Sockets.TcpClient]::new()
    try {
      $task = $client.ConnectAsync('127.0.0.1', $Port)
      if ($task.Wait(500) -and $client.Connected) {
        return
      }
    } finally {
      $client.Dispose()
    }
    Start-Sleep -Milliseconds 250
  }

  throw "Timed out waiting for port $Port."
}

function Wait-ForApp {
  param([int]$TimeoutSeconds = 120)

  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
  while ((Get-Date) -lt $deadline) {
    $process = Get-Process -Name ReactTest -ErrorAction SilentlyContinue |
      Where-Object { $_.MainWindowHandle -ne 0 -and $_.MainWindowTitle -eq $WindowTitle } |
      Select-Object -First 1
    if ($process) {
      return $process
    }
    Start-Sleep -Milliseconds 500
  }

  throw "Timed out waiting for the '$WindowTitle' window."
}

function Find-AutomationElement {
  param(
    [Parameter(Mandatory)]
    [System.Diagnostics.Process]$Process,
    [Parameter(Mandatory)]
    [string]$AutomationId
  )

  Add-Type -AssemblyName UIAutomationClient
  $condition = New-Object System.Windows.Automation.PropertyCondition(
    [System.Windows.Automation.AutomationElement]::AutomationIdProperty,
    $AutomationId
  )
  $root = [System.Windows.Automation.AutomationElement]::RootElement
  $elements = $root.FindAll([System.Windows.Automation.TreeScope]::Descendants, $condition)
  return $elements | Where-Object { $_.Current.ProcessId -eq $Process.Id } | Select-Object -First 1
}

function Wait-ForAutomationId {
  param(
    [Parameter(Mandatory)]
    [System.Diagnostics.Process]$Process,
    [Parameter(Mandatory)]
    [string]$AutomationId,
    [int]$TimeoutSeconds = 30
  )

  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
  while ((Get-Date) -lt $deadline) {
    if (Find-AutomationElement -Process $Process -AutomationId $AutomationId) {
      return
    }
    Start-Sleep -Milliseconds 250
    $Process.Refresh()
  }

  throw "Timed out waiting for automation id '$AutomationId'."
}

function StorybookId {
  param([Parameter(Mandatory)][string]$Suffix)
  return "$TestIDPrefix-win32-$Suffix"
}

$ownedProcessIds = [System.Collections.Generic.List[int]]::new()

function Add-OwnedProcess {
  param([int]$Id)

  if ($Id -and -not $ownedProcessIds.Contains($Id)) {
    $ownedProcessIds.Add($Id)
  }
}

try {
  if (Get-NetTCPConnection -State Listen -LocalPort $storybookPort -ErrorAction SilentlyContinue) {
    throw "Storybook port $storybookPort is already in use."
  }
  if (
    Get-Process -Name ReactTest -ErrorAction SilentlyContinue |
      Where-Object { $_.MainWindowHandle -ne 0 -and $_.MainWindowTitle -eq $WindowTitle }
  ) {
    throw "A '$WindowTitle' window is already running."
  }

  Invoke-DesktopCli -Arguments @('bundle', '--win32')

  $serverLauncher = Start-OwnedCommand -FilePath 'node' `
    -ArgumentList @($cliPath, 'server', '--win32', '--port', [string]$storybookPort) -LogName 'storybook-server'
  Add-OwnedProcess -Id $serverLauncher.Id
  Wait-ForTcpPort -Port $storybookPort
  $serverProcessId = Get-NetTCPConnection -State Listen -LocalPort $storybookPort |
    Select-Object -First 1 -ExpandProperty OwningProcess
  Add-OwnedProcess -Id $serverProcessId
  if ($SmokeMode -eq 'stories-and-tests') {
    Wait-ForTcpPort -Port $driverPort
    $driverProcessId = Get-NetTCPConnection -State Listen -LocalPort $driverPort |
      Select-Object -First 1 -ExpandProperty OwningProcess
    Add-OwnedProcess -Id $driverProcessId
  }

  $index = Invoke-RestMethod -Uri "http://127.0.0.1:$storybookPort/index.json"
  $storyCount = @($index.entries.PSObject.Properties).Count
  if ($storyCount -eq 0) {
    throw 'The Win32 Storybook server exposed no stories.'
  }
  foreach ($requiredStoryId in $requiredStories) {
    if (-not $index.entries.PSObject.Properties[$requiredStoryId]) {
      throw "The Win32 Storybook server did not expose required story '$requiredStoryId'."
    }
  }

  $hostLauncher = Start-OwnedCommand -FilePath 'node' `
    -ArgumentList @($hostPath, '--ci') -LogName 'win32-host'
  Add-OwnedProcess -Id $hostLauncher.Id
  $appProcess = Wait-ForApp
  $appProcessInfo = Get-CimInstance Win32_Process -Filter "ProcessId=$($appProcess.Id)"
  Add-OwnedProcess -Id $appProcessInfo.ParentProcessId
  Add-OwnedProcess -Id $appProcess.Id
  if ($SmokeMode -eq 'stories-and-tests') {
    $applicationLeasePath = Write-ApplicationLease -Process $appProcess -ProcessInfo $appProcessInfo
  }

  Wait-ForAutomationId -Process $appProcess -AutomationId (StorybookId 'sidebar-header')
  Wait-ForAutomationId -Process $appProcess -AutomationId (StorybookId 'sidebar-resize')
  Wait-ForAutomationId -Process $appProcess -AutomationId (StorybookId 'addons-panel-header')
  Wait-ForAutomationId -Process $appProcess -AutomationId (StorybookId 'addons-resize')
  Wait-ForAutomationId -Process $appProcess -AutomationId (StorybookId 'addon-storybook-actions-panel')

  $env:STORYBOOK_WS_PORT = [string]$storybookPort
  $env:STORYBOOK_SMOKE_FAIL_FAST = '1'
  $env:STORYBOOK_SMOKE_SETTLE_MS = '250'
  & node $controlPath
  if ($LASTEXITCODE -ne 0) {
    throw 'Win32 Storybook smoke validation failed.'
  }

  if (-not (Get-Process -Id $appProcess.Id -ErrorAction SilentlyContinue)) {
    throw 'The Win32 Storybook host exited during the smoke test.'
  }
} finally {
  if ($applicationLeasePath) {
    Remove-Item -LiteralPath $applicationLeasePath -Force -ErrorAction SilentlyContinue
  }
  for ($index = $ownedProcessIds.Count - 1; $index -ge 0; $index -= 1) {
    $ownedProcessId = $ownedProcessIds[$index]
    if ($ownedProcessId -and $ownedProcessId -ne $PID) {
      $process = Get-Process -Id $ownedProcessId -ErrorAction SilentlyContinue
      if ($process) {
        Stop-Process -Id $ownedProcessId -ErrorAction Continue
      }
    }
  }
}
