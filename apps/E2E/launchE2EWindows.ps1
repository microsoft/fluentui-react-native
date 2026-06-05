
#Find package name of the react test app
# $pkgName = (Get-AppxPackage -Name "40411fc5-8e92-4d46-b68d-b62df44b1366").PackageFamilyName

#Start-Process -FilePath "$Env:ComSpec" -ArgumentList "/C", "start", "shell:AppsFolder\$pkgName!App"

#Give app chance to create window
#Start-Sleep -Seconds 1

#Set env var for wdio.conf.windows to use as appium:appTopLevelWindow
$env:E2ETEST_APP_TOP_LEVEL_WINDOW = "0x" +(Get-Process ReactApp).MainWindowHandle.ToString("x")

yarn "e2etest:windows"