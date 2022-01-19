if ( (Get-Process -Name "ReactTest").MainWindowTitle -like "Assertion Failure*" ) {
  Write-Error "An Assert dialogue popped up. Asserts should not happen. This is a failure. Please review screenshots and logs to debug."
}