$ErrorActionPreference = 'Stop'

$Configuration = if ($env:STORYBOOK_WINDOWS_CONFIGURATION) { $env:STORYBOOK_WINDOWS_CONFIGURATION } else { 'Debug' }
$WindowTitle = $env:STORYBOOK_WINDOWS_WINDOW_TITLE
$SmokeMode = if ($env:STORYBOOK_SMOKE_MODE) { $env:STORYBOOK_SMOKE_MODE } else { 'stories' }
if ($Configuration -notin @('Debug', 'Release')) {
  throw "STORYBOOK_WINDOWS_CONFIGURATION must be Debug or Release. Received '$Configuration'."
}
if (-not $WindowTitle) {
  throw 'STORYBOOK_WINDOWS_WINDOW_TITLE is required.'
}
if ($SmokeMode -notin @('stories', 'stories-and-tests')) {
  throw "STORYBOOK_SMOKE_MODE must be stories or stories-and-tests. Received '$SmokeMode'."
}

$projectRoot = (Get-Location).Path
$artifactRoot = Join-Path $projectRoot 'artifacts\windows'
$logRoot = Join-Path $artifactRoot 'smoke-logs'
$storybookPort = if ($env:STORYBOOK_WS_PORT) { [int]$env:STORYBOOK_WS_PORT } else { 7007 }
$metroPort = if ($env:RCT_METRO_PORT) { [int]$env:RCT_METRO_PORT } else { 8081 }
$driverPort = if ($env:STORYBOOK_DRIVER_PORT) { [int]$env:STORYBOOK_DRIVER_PORT } else { 0 }
$cliPath = Join-Path $PSScriptRoot 'cli.cjs'
$controlPath = Join-Path $PSScriptRoot 'storybook-control.cjs'

if ($SmokeMode -eq 'stories-and-tests' -and (-not $driverPort -or -not $env:STORYBOOK_DRIVER_MANIFEST)) {
  throw 'STORYBOOK_DRIVER_PORT and STORYBOOK_DRIVER_MANIFEST are required for stories-and-tests smoke mode.'
}

New-Item -ItemType Directory -Path $logRoot -Force | Out-Null

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

function Get-PortOwner {
  param([Parameter(Mandatory)][int]$Port)

  return Get-NetTCPConnection -State Listen -LocalPort $Port -ErrorAction SilentlyContinue |
    Select-Object -First 1 -ExpandProperty OwningProcess
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
        $_.MainWindowTitle -eq $WindowTitle
      } |
      Select-Object -First 1
    if ($process) {
      return $process
    }
    Start-Sleep -Milliseconds 500
  }

  throw "Timed out waiting for the '$WindowTitle' window."
}

function Invoke-DesktopCli {
  param([Parameter(Mandatory)][string[]]$Arguments)

  & node $cliPath @Arguments
  if ($LASTEXITCODE -ne 0) {
    throw "storybook-desktop $($Arguments -join ' ') failed with exit code $LASTEXITCODE."
  }
}

function Register-WindowsApp {
  $manifestPath = Join-Path $projectRoot "windows\ReactApp.Package\bin\x64\$Configuration\AppxManifest.xml"
  if (-not (Test-Path -LiteralPath $manifestPath)) {
    throw "$Configuration manifest not found at '$manifestPath'."
  }

  [xml]$manifest = Get-Content -LiteralPath $manifestPath
  $identityName = [string]$manifest.Package.Identity.Name
  $appId = [string]$manifest.Package.Applications.Application.Id
  $installedPackage = Get-AppxPackage -Name $identityName
  if ($installedPackage) {
    Remove-AppxPackage -Package $installedPackage.PackageFullName
  }
  Add-AppxPackage -Register $manifestPath

  $registeredPackage = Get-AppxPackage -Name $identityName
  return "shell:AppsFolder\$($registeredPackage.PackageFamilyName)!$appId"
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
  if (Get-NetTCPConnection -State Listen -LocalPort $metroPort -ErrorAction SilentlyContinue) {
    throw "Metro port $metroPort is already in use."
  }

  Invoke-DesktopCli -Arguments @('bundle', '--windows')
  Invoke-DesktopCli -Arguments @('prep', '--windows')

  $serverLauncher = Start-OwnedCommand -FilePath 'node' `
    -ArgumentList @($cliPath, 'server', '--windows', '--port', [string]$storybookPort) -LogName 'storybook-server'
  Add-OwnedProcess -Id $serverLauncher.Id
  Wait-ForTcpPort -Port $storybookPort
  Add-OwnedProcess -Id (Get-PortOwner -Port $storybookPort)
  if ($SmokeMode -eq 'stories-and-tests') {
    Wait-ForTcpPort -Port $driverPort
    Add-OwnedProcess -Id (Get-PortOwner -Port $driverPort)
  }

  Invoke-DesktopCli -Arguments @('build', '--windows')
  $launchTarget = Register-WindowsApp

  $metroLauncher = Start-OwnedCommand -FilePath 'rnx-cli' `
    -ArgumentList @('start', '--no-interactive', '--port', [string]$metroPort) -LogName 'metro'
  Add-OwnedProcess -Id $metroLauncher.Id
  Wait-ForTcpPort -Port $metroPort
  Add-OwnedProcess -Id (Get-PortOwner -Port $metroPort)

  $existingAppIds = @(Get-Process -Name ReactApp -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Id)
  Start-Process explorer.exe $launchTarget
  $appProcess = Wait-ForApp -ExcludedProcessIds $existingAppIds
  Add-OwnedProcess -Id $appProcess.Id

  $env:STORYBOOK_WS_PORT = [string]$storybookPort
  $env:STORYBOOK_SMOKE_FAIL_FAST = '1'
  & node $controlPath
  if ($LASTEXITCODE -ne 0) {
    if (-not (Get-Process -Id $appProcess.Id -ErrorAction SilentlyContinue)) {
      throw 'Windows Storybook host terminated during smoke validation.'
    }
    throw "Windows Storybook smoke validation failed with exit code $LASTEXITCODE."
  }
} finally {
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
