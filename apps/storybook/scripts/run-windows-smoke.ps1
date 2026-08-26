$ErrorActionPreference = 'Stop'

$sessionStarted = $false
$primaryError = $null

try {
  & yarn windows:agent:start
  if ($LASTEXITCODE -ne 0) {
    throw "Windows Storybook session failed to start with exit code $LASTEXITCODE."
  }
  $sessionStarted = $true

  & yarn storybook:smoke
  if ($LASTEXITCODE -ne 0) {
    throw "Windows Storybook traversal failed with exit code $LASTEXITCODE."
  }
} catch {
  $primaryError = $_
} finally {
  $sessionState = Join-Path $PSScriptRoot '..\artifacts\windows\agent-session.json'
  if ($sessionStarted -or (Test-Path $sessionState)) {
    & yarn windows:agent:stop
    if ($LASTEXITCODE -ne 0) {
      $cleanupError = "Windows Storybook session cleanup failed with exit code $LASTEXITCODE."
      $primaryError = if ($null -eq $primaryError) { $cleanupError } else { "$primaryError`n$cleanupError" }
    }
  }
}

if ($null -ne $primaryError) {
  throw $primaryError
}
