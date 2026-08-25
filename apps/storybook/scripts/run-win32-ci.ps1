$ErrorActionPreference = 'Stop'

$packageRoot = Split-Path -Parent $PSScriptRoot
$artifactRoot = Join-Path $packageRoot 'artifacts\win32'
$logRoot = Join-Path $artifactRoot 'ci-logs'
$storybookPort = 7007
$windowTitle = 'Agentic Components Storybook (Win32)'

New-Item -ItemType Directory -Path $logRoot -Force | Out-Null

if (Get-NetTCPConnection -State Listen -LocalPort $storybookPort -ErrorAction SilentlyContinue) {
  throw "Port $storybookPort is already in use."
}

if (
  Get-Process -Name ReactTest -ErrorAction SilentlyContinue |
    Where-Object { $_.MainWindowHandle -ne 0 -and $_.MainWindowTitle -eq $windowTitle }
) {
  throw "A '$windowTitle' window is already running."
}

function Start-YarnScript {
  param(
    [Parameter(Mandatory)]
    [string]$Script,
    [Parameter(Mandatory)]
    [string]$LogName
  )

  return Start-Process -FilePath $env:ComSpec -ArgumentList "/d /s /c `"yarn $Script`"" -WorkingDirectory $packageRoot `
    -RedirectStandardOutput (Join-Path $logRoot "$LogName.out.log") `
    -RedirectStandardError (Join-Path $logRoot "$LogName.err.log") -PassThru -WindowStyle Hidden
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
      Where-Object { $_.MainWindowHandle -ne 0 -and $_.MainWindowTitle -eq $windowTitle } |
      Select-Object -First 1
    if ($process) {
      return $process
    }
    Start-Sleep -Milliseconds 500
  }

  throw "Timed out waiting for the '$windowTitle' window."
}

function Wait-ForAutomationId {
  param(
    [Parameter(Mandatory)]
    [System.Diagnostics.Process]$Process,
    [Parameter(Mandatory)]
    [string]$AutomationId,
    [int]$TimeoutSeconds = 30
  )

  Add-Type -AssemblyName UIAutomationClient
  $condition = New-Object System.Windows.Automation.PropertyCondition(
    [System.Windows.Automation.AutomationElement]::AutomationIdProperty,
    $AutomationId
  )
  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
  while ((Get-Date) -lt $deadline) {
    $root = [System.Windows.Automation.AutomationElement]::FromHandle($Process.MainWindowHandle)
    if ($root.FindFirst([System.Windows.Automation.TreeScope]::Descendants, $condition)) {
      return
    }
    Start-Sleep -Milliseconds 250
    $Process.Refresh()
  }

  throw "Timed out waiting for automation id '$AutomationId'."
}

$ownedProcessIds = [System.Collections.Generic.List[int]]::new()

function Add-OwnedProcess {
  param([Parameter(Mandatory)][int]$Id)

  if (-not $ownedProcessIds.Contains($Id)) {
    $ownedProcessIds.Add($Id)
  }
}

try {
  $serverLauncher = Start-YarnScript -Script 'storybook-server:win32' -LogName 'storybook-server'
  Add-OwnedProcess -Id $serverLauncher.Id
  Wait-ForTcpPort -Port $storybookPort

  $serverProcessId = Get-NetTCPConnection -State Listen -LocalPort $storybookPort |
    Select-Object -First 1 -ExpandProperty OwningProcess
  Add-OwnedProcess -Id $serverProcessId

  $index = Invoke-RestMethod -Uri "http://127.0.0.1:$storybookPort/index.json"
  $storyCount = @($index.entries.PSObject.Properties).Count
  if ($storyCount -eq 0) {
    throw 'The Win32 Storybook server exposed no stories.'
  }

  $hostLauncher = Start-YarnScript -Script 'win32:ci:host' -LogName 'win32-host'
  Add-OwnedProcess -Id $hostLauncher.Id
  $appProcess = Wait-ForApp
  $appProcessInfo = Get-CimInstance Win32_Process -Filter "ProcessId=$($appProcess.Id)"
  Add-OwnedProcess -Id $appProcessInfo.ParentProcessId
  Add-OwnedProcess -Id $appProcess.Id
  Wait-ForAutomationId -Process $appProcess -AutomationId 'agentic-storybook-win32-sidebar-header'

  & yarn storybook:smoke:win32
  if ($LASTEXITCODE -ne 0) {
    throw 'Win32 Storybook smoke test failed.'
  }

  if (-not (Get-Process -Id $appProcess.Id -ErrorAction SilentlyContinue)) {
    throw 'The Win32 Storybook host exited during the smoke test.'
  }
} finally {
  for ($index = $ownedProcessIds.Count - 1; $index -ge 0; $index -= 1) {
    $ownedProcessId = $ownedProcessIds[$index]
    if ($ownedProcessId -and $ownedProcessId -ne $PID) {
      if (Get-Process -Id $ownedProcessId -ErrorAction SilentlyContinue) {
        Stop-Process -Id $ownedProcessId
      }
    }
  }
}
