param ([switch]$enableDumpFiles = $false)

if ($enableDumpFiles) {
  # Register WER local dumps BEFORE launching the app so first-launch crashes are captured.
  reg add "HKLM\SOFTWARE\Microsoft\Windows\Windows Error Reporting\LocalDumps" /f
  reg add "HKLM\SOFTWARE\Microsoft\Windows\Windows Error Reporting\LocalDumps\ReactApp.exe" /v DumpType /t REG_DWORD /d 2 /f
  reg add "HKLM\SOFTWARE\Microsoft\Windows\Windows Error Reporting\LocalDumps\ReactApp.exe" /v DumpFolder /t REG_EXPAND_SZ /d "$PSScriptRoot\errorShots" /f

  # Give time for regkeys to be set
  Start-Sleep -Seconds 5
}

#Find package name of the react test app
$pkgName = (Get-AppxPackage -Name "40411fc5-8e92-4d46-b68d-b62df44b1366").PackageFamilyName
Write-Host "Launching app: shell:AppsFolder\$pkgName!App"

# Record the time we launched so we can scope event-log queries to this run.
$launchTime = Get-Date

Start-Process -FilePath "$Env:ComSpec" -ArgumentList "/C", "start", "shell:AppsFolder\$pkgName!App"

$proc = $null
for ($i = 1; $i -le 30; $i++) {

  $proc = Get-Process ReactApp -ErrorAction Ignore | Where-Object { $_.MainWindowHandle -ne 0 } | Select-Object -First 1
  if ($proc) {
    Write-Host "ReactApp is running (PID=$($proc.Id), MainWindowHandle=0x$($proc.MainWindowHandle.ToString('x')))"
    break;
  }

  Write-Host "Waiting for app to start... ($i/30)"

  #Give app chance to create window
  Start-Sleep -Seconds 1
}

if (-not $proc) {
  Write-Host "##[error]ReactApp did not produce a top-level window within 30s. Capturing diagnostics."

  Write-Host "----- Running processes named ReactApp* or React* -----"
  Get-Process | Where-Object { $_.ProcessName -like 'React*' -or $_.ProcessName -like 'ReactApp*' } | Format-Table Id, ProcessName, MainWindowHandle, StartTime -AutoSize | Out-String | Write-Host

  Write-Host "----- WER LocalDumps registry -----"
  reg query "HKLM\SOFTWARE\Microsoft\Windows\Windows Error Reporting\LocalDumps" /s 2>&1 | Write-Host

  Write-Host "----- WER dump files captured -----"
  Get-ChildItem "$PSScriptRoot\errorShots" -ErrorAction SilentlyContinue | Format-Table Name, Length, LastWriteTime -AutoSize | Out-String | Write-Host

  Write-Host "----- Application event log: WER / AppCrash entries since launch -----"
  try {
    Get-WinEvent -FilterHashtable @{LogName='Application'; StartTime=$launchTime; ProviderName=@('Windows Error Reporting','Application Error','.NET Runtime')} -ErrorAction Stop |
      Select-Object -First 20 TimeCreated, ProviderName, Id, LevelDisplayName, Message |
      Format-List | Out-String | Write-Host
  } catch {
    Write-Host "No matching Application events: $_"
  }

  Write-Host "----- Packager log (if captured) -----"
  $packagerLog = Join-Path $PSScriptRoot '..\fluent-tester\packager.log'
  if (Test-Path $packagerLog) {
    Get-Content $packagerLog -Tail 200 | Out-String | Write-Host
  } else {
    Write-Host "No packager log found at $packagerLog"
  }

  throw "ReactApp.exe did not start a top-level window. See diagnostics above."
}

#Set env var for wdio.conf.windows to use as appium:appTopLevelWindow
$env:E2ETEST_APP_TOP_LEVEL_WINDOW = "0x" + $proc.MainWindowHandle.ToString('x')

yarn "e2etest:windows"