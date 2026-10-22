$desktopServicePath = & node -p "require.resolve('@fluentui-react-native/desktop-test/service')"
if ($LASTEXITCODE -ne 0) { throw 'Could not resolve the shared desktop service supervisor.' }
if (-not $env:FURN_DESKTOP_REPORT_CONTEXT) { throw 'Desktop smoke services require an inherited reporting context.' }
$desktopReportRoot = ($env:FURN_DESKTOP_REPORT_CONTEXT | ConvertFrom-Json).artifactsRoot
$desktopControlRoot = Join-Path $desktopReportRoot 'control'
New-Item -ItemType Directory -Path $desktopControlRoot -Force | Out-Null
$desktopServices = [System.Collections.Generic.List[object]]::new()

function Start-OwnedCommand {
  param(
    [Parameter(Mandatory)][string]$FilePath,
    [Parameter(Mandatory)][string[]]$ArgumentList,
    [Parameter(Mandatory)][string]$LogName
  )
  $id = [Guid]::NewGuid().ToString()
  $descriptorPath = Join-Path $desktopControlRoot "$id.json"
  $stopPath = Join-Path $desktopControlRoot "$id.stop"
  $stderrPath = Join-Path $desktopControlRoot "$id.stderr.log"
  @{
    command = @{ command = $FilePath; args = $ArgumentList; cwd = $projectRoot }
    label = $LogName
    stopPath = $stopPath
  } | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath $descriptorPath -Encoding utf8NoBOM
  $service = Start-Process -FilePath 'node' -ArgumentList @("`"$desktopServicePath`"", "`"$descriptorPath`"") `
    -WorkingDirectory $projectRoot -PassThru -WindowStyle Hidden `
    -RedirectStandardOutput (Join-Path $desktopControlRoot "$id.stdout.log") -RedirectStandardError $stderrPath
  $desktopServices.Add(@{ Process = $service; StopPath = $stopPath; Label = $LogName; StderrPath = $stderrPath })
  return $service
}

function Assert-OwnedServices {
  foreach ($service in $desktopServices) {
    if ($service.Process.HasExited) {
      $diagnostic = if (Test-Path -LiteralPath $service.StderrPath) { Get-Content -LiteralPath $service.StderrPath -Raw } else { '' }
      throw "Required service '$($service.Label)' exited with code $($service.Process.ExitCode). $diagnostic"
    }
  }
}

function Wait-ForTcpPort {
  param([Parameter(Mandatory)][int]$Port, [int]$TimeoutSeconds = 120)

  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
  $lastFailure = 'Connection attempt timed out.'
  while ((Get-Date) -lt $deadline) {
    Assert-OwnedServices
    $client = [System.Net.Sockets.TcpClient]::new()
    try {
      $task = $client.ConnectAsync('127.0.0.1', $Port)
      if ($task.Wait(500) -and $client.Connected) { return }
    } catch {
      $cause = $_.Exception.GetBaseException()
      if ($cause -isnot [System.Net.Sockets.SocketException] -or
          $cause.SocketErrorCode -notin @([System.Net.Sockets.SocketError]::ConnectionRefused, [System.Net.Sockets.SocketError]::TimedOut)) { throw }
      $lastFailure = $cause.Message
    } finally { $client.Dispose() }
    Start-Sleep -Milliseconds 250
  }
  throw "Timed out waiting for port $Port. Last connection failure: $lastFailure"
}

function Stop-OwnedServices {
  $failures = [System.Collections.Generic.List[System.Exception]]::new()
  for ($index = $desktopServices.Count - 1; $index -ge 0; $index -= 1) {
    $service = $desktopServices[$index]
    try {
      if (-not $service.Process.HasExited) {
        Set-Content -LiteralPath $service.StopPath -Value 'stop' -Encoding utf8NoBOM
        if (-not $service.Process.WaitForExit(15000)) {
          Stop-Process -Id $service.Process.Id -ErrorAction Stop
          throw "Owned service '$($service.Label)' did not complete its graceful reporting flush."
        }
      }
      if ($service.Process.ExitCode -ne 0) { throw "Owned service '$($service.Label)' failed with exit code $($service.Process.ExitCode)." }
    } catch { $failures.Add($_.Exception) }
  }
  if ($failures.Count) { throw [System.AggregateException]::new('Desktop service cleanup failed.', $failures) }
}
