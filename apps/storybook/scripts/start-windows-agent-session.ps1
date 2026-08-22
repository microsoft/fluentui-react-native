param(
  [switch]$Generate,
  [switch]$RunSmokeTest
)

$ErrorActionPreference = 'Stop'

$packageRoot = Split-Path -Parent $PSScriptRoot
$artifactRoot = Join-Path $packageRoot 'artifacts\windows'
$logRoot = Join-Path $artifactRoot 'logs'
$sessionPath = Join-Path $artifactRoot 'agent-session.json'
$desktopHostShutdownPath = Join-Path $artifactRoot 'desktop-host.stop'
$storybookPort = 7007
$metroPort = 8081
$defaultWinAppDriverPath = "${env:ProgramFiles(x86)}\Windows Application Driver\WinAppDriver.exe"
$localWinAppDriverPath = Join-Path $artifactRoot 'winappdriver\SourceDir\Windows Application Driver\WinAppDriver.exe'

New-Item -ItemType Directory -Path $logRoot -Force | Out-Null
$desktopHostProcess = $null
$desktopHostPid = $null
$metroProcess = $null
$metroPid = $null
$appProcess = $null
$sessionWritten = $false

function Start-YarnScript {
  param(
    [Parameter(Mandatory)]
    [string]$Script,
    [Parameter(Mandatory)]
    [string]$LogName
  )

  $stdout = Join-Path $logRoot "$LogName.out.log"
  $stderr = Join-Path $logRoot "$LogName.err.log"
  $arguments = "/d /s /c `"yarn $Script`""

  return Start-Process -FilePath $env:ComSpec -ArgumentList $arguments -WorkingDirectory $packageRoot `
    -RedirectStandardOutput $stdout -RedirectStandardError $stderr -PassThru -WindowStyle Hidden
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
    } catch {
    } finally {
      $client.Dispose()
    }
    Start-Sleep -Milliseconds 250
  }

  throw "Timed out waiting for port $Port."
}

function Get-PortOwner {
  param([Parameter(Mandatory)][int]$Port)

  return Get-NetTCPConnection -State Listen -LocalPort $Port -ErrorAction SilentlyContinue |
    Select-Object -First 1 -ExpandProperty OwningProcess
}

function Get-DescendantProcessIds {
  param([Parameter(Mandatory)][int]$ProcessId)

  $all = @(Get-CimInstance Win32_Process)
  $result = @()
  $frontier = @($ProcessId)
  while ($frontier.Count -gt 0) {
    $children = @($all | Where-Object { $_.ParentProcessId -in $frontier } | Select-Object -ExpandProperty ProcessId)
    $result += $children
    $frontier = $children
  }
  return $result
}

function Stop-OwnedProcessTree {
  param([int]$ProcessId)

  if ($ProcessId -and (Get-Process -Id $ProcessId -ErrorAction SilentlyContinue)) {
    & taskkill.exe /PID $ProcessId /T /F | Out-Null
  }
}

function Wait-ForApp {
  param(
    [int[]]$ExcludedProcessIds = @(),
    [int]$TimeoutSeconds = 120
  )

  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
  while ((Get-Date) -lt $deadline) {
    $process = Get-Process -Name ReactApp -ErrorAction SilentlyContinue |
      Where-Object {
        $_.Id -notin $ExcludedProcessIds -and
        $_.MainWindowHandle -ne 0 -and
        $_.MainWindowTitle
      } |
      Select-Object -First 1
    if ($process) {
      return $process
    }
    Start-Sleep -Milliseconds 500
  }

  throw 'Timed out waiting for the ReactApp window.'
}

Push-Location $packageRoot
try {
  if (Test-Path -LiteralPath $sessionPath) {
    throw "An agent session manifest already exists at '$sessionPath'. Run yarn windows:agent:stop first."
  }

  if ($RunSmokeTest) {
    if (-not $env:WINAPPDRIVERPATH) {
      if (Test-Path -LiteralPath $defaultWinAppDriverPath) {
        $env:WINAPPDRIVERPATH = $defaultWinAppDriverPath
      } elseif (Test-Path -LiteralPath $localWinAppDriverPath) {
        $env:WINAPPDRIVERPATH = $localWinAppDriverPath
      } else {
        throw 'WinAppDriver 1.2.1 is required. Install it or set WINAPPDRIVERPATH before running windows:agent.'
      }
    }
  }

  $solutionPath = Join-Path $packageRoot 'windows\AgenticStorybook.sln'
  if ($Generate -or -not (Test-Path -LiteralPath $solutionPath)) {
    & yarn windows:generate
    if ($LASTEXITCODE -ne 0) {
      throw 'Windows project generation failed.'
    }
  }

  Remove-Item -LiteralPath $desktopHostShutdownPath -Force -ErrorAction SilentlyContinue
  $desktopHostProcess = Start-YarnScript `
    -Script "desktop:host:windows --port $storybookPort --shutdown-file `"$desktopHostShutdownPath`"" `
    -LogName 'desktop-host'
  Wait-ForTcpPort -Port $storybookPort
  Invoke-RestMethod -Uri "http://127.0.0.1:$storybookPort/index.json" | Out-Null
  $desktopHostProcess.Refresh()
  if ($desktopHostProcess.HasExited) {
    throw "The desktop host exited before readiness. See '$logRoot\\desktop-host.err.log'."
  }
  $desktopHostPid = Get-PortOwner -Port $storybookPort
  $desktopHostDescendants = @(Get-DescendantProcessIds -ProcessId $desktopHostProcess.Id)
  if (-not $desktopHostPid -or ($desktopHostPid -ne $desktopHostProcess.Id -and $desktopHostPid -notin $desktopHostDescendants)) {
    throw "Port $storybookPort is not owned by the desktop host process tree."
  }

  & yarn windows:deploy
  if ($LASTEXITCODE -ne 0) {
    throw 'Windows build or deployment failed.'
  }

  $metroProcess = Start-YarnScript -Script 'start' -LogName 'metro'
  Wait-ForTcpPort -Port $metroPort
  $metroProcess.Refresh()
  if ($metroProcess.HasExited) {
    throw "Metro exited before readiness. See '$logRoot\\metro.err.log'."
  }
  $metroPid = Get-PortOwner -Port $metroPort
  $metroDescendants = @(Get-DescendantProcessIds -ProcessId $metroProcess.Id)
  if (-not $metroPid -or ($metroPid -ne $metroProcess.Id -and $metroPid -notin $metroDescendants)) {
    throw "Port $metroPort is not owned by the Metro process tree."
  }

  $existingAppIds = @(Get-Process -Name ReactApp -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Id)
  & yarn windows:launch-only
  if ($LASTEXITCODE -ne 0) {
    throw 'Windows launch failed.'
  }

  $appProcess = Wait-ForApp -ExcludedProcessIds $existingAppIds
  $session = [ordered]@{
    startedAt = (Get-Date).ToString('o')
    storybookPort = $storybookPort
    metroPort = $metroPort
    desktopHostShutdownPath = $desktopHostShutdownPath
    appWindowTitle = $appProcess.MainWindowTitle
    processes = @(
      [ordered]@{ role = 'desktop-host-launcher'; id = $desktopHostProcess.Id }
      [ordered]@{ role = 'desktop-host'; id = $desktopHostPid }
      [ordered]@{ role = 'metro-launcher'; id = $metroProcess.Id }
      [ordered]@{ role = 'metro'; id = $metroPid }
      [ordered]@{ role = 'app'; id = $appProcess.Id }
    )
  }
  $session | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath $sessionPath
  $sessionWritten = $true

  if ($RunSmokeTest) {
    $env:STORYBOOK_WINDOWS_WINDOW_TITLE = $appProcess.MainWindowTitle
    $env:STORYBOOK_WINDOWS_PROCESS_ID = $appProcess.Id
    & yarn windows:test
    if ($LASTEXITCODE -ne 0) {
      throw "Windows smoke automation failed. The running session is recorded at '$sessionPath'."
    }
  }

  Write-Host "Windows agent session ready. Manifest: $sessionPath"
} catch {
  if (-not $sessionWritten) {
    if ($desktopHostProcess) {
      Set-Content -LiteralPath $desktopHostShutdownPath -Value 'stop'
      Start-Sleep -Seconds 2
    }
    @(
      $appProcess.Id
      $metroPid
      $metroProcess.Id
      $desktopHostPid
      $desktopHostProcess.Id
    ) |
      Where-Object { $_ } |
      Select-Object -Unique |
      ForEach-Object { Stop-OwnedProcessTree -ProcessId $_ }
    Remove-Item -LiteralPath $desktopHostShutdownPath -Force -ErrorAction SilentlyContinue
  }
  throw
} finally {
  Pop-Location
}
