$ErrorActionPreference = 'Stop'

$packageRoot = Split-Path -Parent $PSScriptRoot
$artifactRoot = Join-Path $packageRoot 'artifacts\win32'
$logRoot = Join-Path $artifactRoot 'ci-logs'
$storybookPort = 7007
$windowTitle = 'Agentic Components Storybook (Win32)'

New-Item -ItemType Directory -Path $logRoot -Force | Out-Null

Add-Type @'
using System;
using System.Runtime.InteropServices;
public static class StorybookNativeMouse
{
    [DllImport("user32.dll")]
    public static extern bool SetCursorPos(int x, int y);
    [DllImport("user32.dll")]
    public static extern void mouse_event(uint flags, uint dx, uint dy, uint data, UIntPtr extraInfo);
}
'@

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

function Wait-ForAutomationIdToClose {
  param(
    [Parameter(Mandatory)]
    [System.Diagnostics.Process]$Process,
    [Parameter(Mandatory)]
    [string]$AutomationId,
    [int]$TimeoutSeconds = 30
  )

  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
  while ((Get-Date) -lt $deadline) {
    if (-not (Find-AutomationElement -Process $Process -AutomationId $AutomationId)) {
      return
    }
    Start-Sleep -Milliseconds 250
    $Process.Refresh()
  }

  throw "Timed out waiting for automation id '$AutomationId' to close."
}

function Invoke-AutomationId {
  param(
    [Parameter(Mandatory)]
    [System.Diagnostics.Process]$Process,
    [Parameter(Mandatory)]
    [string]$AutomationId
  )

  $element = Find-AutomationElement -Process $Process -AutomationId $AutomationId
  if (-not $element) {
    throw "Could not find automation id '$AutomationId'."
  }

  $point = $element.GetClickablePoint()
  [StorybookNativeMouse]::SetCursorPos([int]$point.X, [int]$point.Y) | Out-Null
  [StorybookNativeMouse]::mouse_event(0x0002, 0, 0, 0, [UIntPtr]::Zero)
  [StorybookNativeMouse]::mouse_event(0x0004, 0, 0, 0, [UIntPtr]::Zero)
}

function Resize-AutomationId {
  param(
    [Parameter(Mandatory)]
    [System.Diagnostics.Process]$Process,
    [Parameter(Mandatory)]
    [string]$AutomationId,
    [int]$DeltaX = 0,
    [int]$DeltaY = 0
  )

  $element = Find-AutomationElement -Process $Process -AutomationId $AutomationId
  if (-not $element) {
    throw "Could not find resize automation id '$AutomationId'."
  }

  $before = $element.Current.BoundingRectangle
  $startX = [int]($before.X + ($before.Width / 2))
  $startY = [int]($before.Y + ($before.Height / 2))
  [StorybookNativeMouse]::SetCursorPos($startX, $startY) | Out-Null
  [StorybookNativeMouse]::mouse_event(0x0002, 0, 0, 0, [UIntPtr]::Zero)
  for ($step = 1; $step -le 5; $step += 1) {
    [StorybookNativeMouse]::SetCursorPos(
      $startX + [int](($DeltaX * $step) / 5),
      $startY + [int](($DeltaY * $step) / 5)
    ) | Out-Null
    Start-Sleep -Milliseconds 50
  }
  [StorybookNativeMouse]::mouse_event(0x0004, 0, 0, 0, [UIntPtr]::Zero)
  Start-Sleep -Milliseconds 500

  $after = (Find-AutomationElement -Process $Process -AutomationId $AutomationId).Current.BoundingRectangle
  if ($DeltaX -ne 0 -and [Math]::Abs($after.X - $before.X) -lt 20) {
    throw "Resize handle '$AutomationId' did not move horizontally."
  }
  if ($DeltaY -ne 0 -and [Math]::Abs($after.Y - $before.Y) -lt 20) {
    throw "Resize handle '$AutomationId' did not move vertically."
  }
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
  foreach ($requiredStoryId in @('primitives-callout--default', 'primitives-callout--placement', 'primitives-callout--window-commands')) {
    if (-not $index.entries.PSObject.Properties[$requiredStoryId]) {
      throw "The Win32 Storybook server did not expose required story '$requiredStoryId'."
    }
  }

  $hostLauncher = Start-YarnScript -Script 'win32:ci:host' -LogName 'win32-host'
  Add-OwnedProcess -Id $hostLauncher.Id
  $appProcess = Wait-ForApp
  $appProcessInfo = Get-CimInstance Win32_Process -Filter "ProcessId=$($appProcess.Id)"
  Add-OwnedProcess -Id $appProcessInfo.ParentProcessId
  Add-OwnedProcess -Id $appProcess.Id
  Wait-ForAutomationId -Process $appProcess -AutomationId 'agentic-storybook-win32-sidebar-header'
  Wait-ForAutomationId -Process $appProcess -AutomationId 'agentic-storybook-win32-sidebar-resize'
  Wait-ForAutomationId -Process $appProcess -AutomationId 'agentic-storybook-win32-addons-panel-header'
  Wait-ForAutomationId -Process $appProcess -AutomationId 'agentic-storybook-win32-addons-resize'
  Wait-ForAutomationId -Process $appProcess -AutomationId 'agentic-storybook-win32-addon-storybook-actions-panel'

  Resize-AutomationId -Process $appProcess -AutomationId 'agentic-storybook-win32-sidebar-resize' -DeltaX 40
  Resize-AutomationId -Process $appProcess -AutomationId 'agentic-storybook-win32-addons-resize' -DeltaY -40

  Invoke-AutomationId -Process $appProcess -AutomationId 'agentic-storybook-win32-hide-sidebar'
  Wait-ForAutomationId -Process $appProcess -AutomationId 'agentic-storybook-win32-desktop-toolbar'
  Invoke-AutomationId -Process $appProcess -AutomationId 'agentic-storybook-win32-popout-stories'
  Wait-ForAutomationId -Process $appProcess -AutomationId 'agentic-storybook-win32-story-drawer'
  Invoke-AutomationId -Process $appProcess -AutomationId 'agentic-storybook-win32-close-stories'
  Wait-ForAutomationIdToClose -Process $appProcess -AutomationId 'agentic-storybook-win32-story-drawer'
  Wait-ForAutomationId -Process $appProcess -AutomationId 'agentic-storybook-win32-sidebar-header'

  Invoke-AutomationId -Process $appProcess -AutomationId 'agentic-storybook-win32-hide-sidebar'
  Wait-ForAutomationId -Process $appProcess -AutomationId 'agentic-storybook-win32-desktop-toolbar'
  Invoke-AutomationId -Process $appProcess -AutomationId 'agentic-storybook-win32-popout-addons'
  Wait-ForAutomationId -Process $appProcess -AutomationId 'agentic-storybook-win32-addons-drawer'
  Wait-ForAutomationId -Process $appProcess -AutomationId 'agentic-storybook-win32-addon-rncontrols'
  Wait-ForAutomationId -Process $appProcess -AutomationId 'agentic-storybook-win32-addon-storybook-actions-panel'
  Invoke-AutomationId -Process $appProcess -AutomationId 'agentic-storybook-win32-addon-storybook-actions-panel'
  Invoke-AutomationId -Process $appProcess -AutomationId 'agentic-storybook-win32-close-addons'
  Wait-ForAutomationIdToClose -Process $appProcess -AutomationId 'agentic-storybook-win32-addons-drawer'
  Wait-ForAutomationId -Process $appProcess -AutomationId 'agentic-storybook-win32-addons-panel-header'
  Invoke-AutomationId -Process $appProcess -AutomationId 'agentic-storybook-win32-show-sidebar'
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
