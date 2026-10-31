# Registers the Debug package that `rnx-cli build` produced so desktop-test can launch it by AUMID.
$ErrorActionPreference = 'Stop'

function Install-FrameworkPackage {
  param(
    [Parameter(Mandatory)][string]$PackageName,
    [Parameter(Mandatory)][Version]$MinimumVersion,
    [Parameter(Mandatory)][string]$SdkName,
    [Parameter(Mandatory)][string]$FileName
  )

  $installed = Get-AppxPackage -Name $PackageName |
    Where-Object { $_.Architecture -eq 'X64' -and [Version]$_.Version -ge $MinimumVersion } |
    Select-Object -First 1
  if ($installed) {
    return
  }

  $sdkRoot = Join-Path ${env:ProgramFiles(x86)} "Microsoft SDKs\Windows Kits\10\ExtensionSDKs\$SdkName"
  $framework = Get-ChildItem -LiteralPath $sdkRoot -Filter $FileName -Recurse -ErrorAction SilentlyContinue |
    Sort-Object FullName -Descending |
    Select-Object -First 1
  if (-not $framework) {
    throw "Could not find the $PackageName framework beneath '$sdkRoot'."
  }

  Add-AppxPackage -Path $framework.FullName
  $installed = Get-AppxPackage -Name $PackageName |
    Where-Object { $_.Architecture -eq 'X64' -and [Version]$_.Version -ge $MinimumVersion } |
    Select-Object -First 1
  if (-not $installed) {
    throw "$PackageName $MinimumVersion or newer was not registered for the current user."
  }
}

$manifestPath = Join-Path $PSScriptRoot '..\windows\ReactApp.Package\bin\x64\Debug\AppxManifest.xml'
if (-not (Test-Path -LiteralPath $manifestPath)) {
  throw "Debug manifest not found at '$manifestPath'. Build the app first."
}

[xml]$manifest = Get-Content -LiteralPath $manifestPath
$identityName = [string]$manifest.Package.Identity.Name
foreach ($existing in @(Get-AppxPackage -Name $identityName)) {
  Remove-AppxPackage -Package $existing.PackageFullName
}

Install-FrameworkPackage -PackageName 'Microsoft.VCLibs.140.00.Debug' `
  -MinimumVersion ([Version]'14.0.33519.0') `
  -SdkName 'Microsoft.VCLibs' `
  -FileName 'Microsoft.VCLibs.x64.Debug.14.00.appx'
Install-FrameworkPackage -PackageName 'Microsoft.VCLibs.140.00.Debug.UWPDesktop' `
  -MinimumVersion ([Version]'14.0.33728.0') `
  -SdkName 'Microsoft.VCLibs.Desktop' `
  -FileName 'Microsoft.VCLibs.x64.Debug.14.00.Desktop.appx'
Add-AppxPackage -Register $manifestPath

$registered = @(Get-AppxPackage -Name $identityName)
if ($registered.Count -ne 1) {
  throw "Expected one registered '$identityName' package but found $($registered.Count)."
}
Write-Host "Registered $($registered[0].PackageFullName)"
