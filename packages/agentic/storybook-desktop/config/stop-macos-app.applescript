try
  set bundleIdentifier to system attribute "FURN_STORYBOOK_BUNDLE_IDENTIFIER"
on error
  set bundleIdentifier to ""
end try
if bundleIdentifier is "" then
  set bundleIdentifier to "com.microsoft.ReactTestApp"
end if

tell application "System Events"
  set processIds to unix id of every application process whose bundle identifier is bundleIdentifier
end tell

repeat with processId in processIds
  do shell script "/bin/kill -TERM " & quoted form of (processId as text)
end repeat

repeat 100 times
  tell application "System Events"
    set appIsRunning to (count of (application processes whose bundle identifier is bundleIdentifier)) > 0
  end tell
  if not appIsRunning then
    return
  end if
  delay 0.1
end repeat

error "Timed out stopping Storybook application " & bundleIdentifier
