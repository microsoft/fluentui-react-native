
#Find package name of the react test app
$pkgName = (Get-AppxPackage -Name "40411fc5-8e92-4d46-b68d-b62df44b1366").PackageFamilyName

Start-Process -FilePath "$Env:ComSpec" -ArgumentList "/C", "start", "shell:AppsFolder\$pkgName!App"

for ($i = 1; $i -le 10; $i++) {

  if (Get-Process ReactApp -ErrorAction Ignore)
  {
    Write-Host "ReactApp is running"
    break;
  }

  Write-Host "Waiting for app to start..."

  #Give app chance to create window
  Start-Sleep -Seconds 1
}

#Set env var for wdio.conf.windows to use as appium:appTopLevelWindow
$env:E2ETEST_APP_TOP_LEVEL_WINDOW = "0x" +(Get-Process ReactApp -ErrorAction Stop).MainWindowHandle.ToString("x")

yarn "e2etest:windows"