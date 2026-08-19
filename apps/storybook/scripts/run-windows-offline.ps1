param(
  [switch]$NoLaunch
)

$ErrorActionPreference = 'Stop'

$packageRoot = Split-Path -Parent $PSScriptRoot
$manifestPath = Join-Path $packageRoot 'windows\ReactApp.Package\bin\x64\Release\AppxManifest.xml'

if (-not (Test-Path -LiteralPath $manifestPath)) {
  throw "Release manifest not found at '$manifestPath'. Build the Windows Release app first."
}

[xml]$manifest = Get-Content -LiteralPath $manifestPath
$identityName = [string]$manifest.Package.Identity.Name
$appId = [string]$manifest.Package.Applications.Application.Id

$installedPackage = Get-AppxPackage -Name $identityName
if ($installedPackage) {
  Remove-AppxPackage -Package $installedPackage.PackageFullName
}

Add-AppxPackage -Register $manifestPath

if (-not $NoLaunch) {
  $registeredPackage = Get-AppxPackage -Name $identityName
  $target = "shell:AppsFolder\$($registeredPackage.PackageFamilyName)!$appId"
  Start-Process explorer.exe $target
}
