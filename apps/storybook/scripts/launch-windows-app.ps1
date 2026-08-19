param(
  [ValidateSet('Debug', 'Release')]
  [string]$Configuration = 'Debug'
)

$ErrorActionPreference = 'Stop'

$packageRoot = Split-Path -Parent $PSScriptRoot
$manifestPath = Join-Path $packageRoot "windows\ReactApp.Package\bin\x64\$Configuration\AppxManifest.xml"

if (-not (Test-Path -LiteralPath $manifestPath)) {
  throw "$Configuration manifest not found at '$manifestPath'. Build and deploy the Windows app first."
}

[xml]$manifest = Get-Content -LiteralPath $manifestPath
$identityName = [string]$manifest.Package.Identity.Name
$appId = [string]$manifest.Package.Applications.Application.Id
$registeredPackage = Get-AppxPackage -Name $identityName

if (-not $registeredPackage) {
  throw "Package '$identityName' is not registered. Run yarn windows:deploy first."
}

$target = "shell:AppsFolder\$($registeredPackage.PackageFamilyName)!$appId"
Start-Process explorer.exe $target
