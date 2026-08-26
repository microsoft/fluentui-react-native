try
  set bundleIdentifier to system attribute "FURN_STORYBOOK_BUNDLE_IDENTIFIER"
on error
  set bundleIdentifier to ""
end try
if bundleIdentifier is "" then
  set bundleIdentifier to "com.microsoft.ReactTestApp"
end if

tell application "System Events"
  set appIsRunning to (count of (application processes whose bundle identifier is bundleIdentifier)) > 0
end tell

if appIsRunning then
  using terms from application "Finder"
    tell application id bundleIdentifier to quit
  end using terms from
end if
