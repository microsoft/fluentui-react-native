# Select the current officially supported version of Xcode with the naming convention used by GitHub Actions/Azure DevOps Build Pipelines

if [ -n "$XCODE_PATH_OVERRIDE" ]; then # If someone calls this with the XCODE_PATH_OVERRIDE variable set to a path to a developer dir, use it instead
    XCODE_PATH="$XCODE_PATH_OVERRIDE"
else
    XCODE_PATH='/Applications/Xcode_12.4.app/Contents/Developer'
fi

echo "Running command: sudo xcode-select --switch $XCODE_PATH"
sudo xcode-select --switch "$XCODE_PATH"
