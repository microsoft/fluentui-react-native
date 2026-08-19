param(
  [ValidateSet('Debug', 'Release')]
  [string]$Configuration = 'Debug'
)

$ErrorActionPreference = 'Stop'

$packageRoot = Split-Path -Parent $PSScriptRoot
$manifestPath = Join-Path $packageRoot "windows\ReactApp.Package\bin\x64\$Configuration\AppxManifest.xml"

if (-not (Test-Path -LiteralPath $manifestPath)) {
  throw "$Configuration manifest not found at '$manifestPath'. Build the Windows app first."
}

[xml]$manifest = Get-Content -LiteralPath $manifestPath
$identityName = [string]$manifest.Package.Identity.Name
$installedPackage = Get-AppxPackage -Name $identityName

if ($installedPackage) {
  Remove-AppxPackage -Package $installedPackage.PackageFullName
}

Add-AppxPackage -Register $manifestPath
