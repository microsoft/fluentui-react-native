$ErrorActionPreference = 'Stop'
$configuration = $env:STORYBOOK_WINDOWS_CONFIGURATION
if ($configuration -notin @('Debug', 'Release')) {
  throw 'STORYBOOK_WINDOWS_CONFIGURATION must be Debug or Release.'
}

function Install-FrameworkPackage {
  param([string]$Name, [Version]$MinimumVersion, [string]$SdkName, [string]$FileName)
  $installed = @(Get-AppxPackage -Name $Name |
    Where-Object { $_.Architecture -eq 'X64' -and [Version]$_.Version -ge $MinimumVersion })
  if ($installed.Count) { return }
  $sdkRoot = Join-Path ${env:ProgramFiles(x86)} "Microsoft SDKs\Windows Kits\10\ExtensionSDKs\$SdkName"
  $package = Get-ChildItem -LiteralPath $sdkRoot -Filter $FileName -Recurse |
    Sort-Object FullName -Descending | Select-Object -First 1
  if (-not $package) { throw "Could not find the $Name framework beneath '$sdkRoot'." }
  Add-AppxPackage -Path $package.FullName
  $installed = @(Get-AppxPackage -Name $Name |
    Where-Object { $_.Architecture -eq 'X64' -and [Version]$_.Version -ge $MinimumVersion })
  if (-not $installed.Count) { throw "$Name $MinimumVersion or newer was not registered." }
}

$manifest = Join-Path (Get-Location).Path "windows\ReactApp.Package\bin\x64\$configuration\AppxManifest.xml"
if (-not (Test-Path -LiteralPath $manifest)) { throw "Built manifest not found at '$manifest'." }
if ($configuration -eq 'Debug') {
  Install-FrameworkPackage -Name 'Microsoft.VCLibs.140.00.Debug' -MinimumVersion ([Version]'14.0.33519.0') `
    -SdkName 'Microsoft.VCLibs' -FileName 'Microsoft.VCLibs.x64.Debug.14.00.appx'
  Install-FrameworkPackage -Name 'Microsoft.VCLibs.140.00.Debug.UWPDesktop' -MinimumVersion ([Version]'14.0.33728.0') `
    -SdkName 'Microsoft.VCLibs.Desktop' -FileName 'Microsoft.VCLibs.x64.Debug.14.00.Desktop.appx'
}
# Registration must fail rather than unregister or terminate another running application.
$manifestIdentity = ([xml](Get-Content -LiteralPath $manifest -Raw)).Package.Identity
$identity = $manifestIdentity.Name
$expectedLocation = [System.IO.Path]::GetDirectoryName($manifest)
$existing = @(Get-AppxPackage -Name $identity)
# Never replace a registration owned by another checkout; its owner must unregister it first.
foreach ($package in $existing) {
  if ($package.InstallLocation -ne $expectedLocation) {
    throw "The Windows package '$identity' is registered from '$($package.InstallLocation)', not '$expectedLocation'; refusing to replace another checkout's registration."
  }
}
# Registering the same development manifest twice can fail with 0x80073CFB.
if ($existing.Count -ne 1 -or -not $existing[0].IsDevelopmentMode -or
    [Version]$existing[0].Version -ne [Version]$manifestIdentity.Version -or
    $existing[0].Publisher -ne $manifestIdentity.Publisher -or $existing[0].Architecture -ne 'X64' -or
    $existing[0].Status -ne 'Ok') {
  Add-AppxPackage -Register $manifest -ForceUpdateFromAnyVersion
}
$registered = @(Get-AppxPackage -Name $identity)
if ($registered.Count -ne 1 -or $registered[0].InstallLocation -ne $expectedLocation) {
  throw "The Windows package is not registered from '$expectedLocation'; refusing to launch another checkout."
}
