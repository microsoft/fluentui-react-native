#!/bin/bash

# Install any pods necessary for the project
#
# \param $1 platform-specific directory to run pod commands from
function pod_install() {
    cd apps/apple/FluentUITester/"$1" && pod install
}

# Invoke xcodebuild
#
# Match Azure DevOps xcodebuild invocations by not codesigning on CI builds
#
# \param $1 path to  to run against
# \param $2 scheme to build
# \param $3 configuration
# \param $4 sdk
# \param $5+ build commands
function invoke_xcodebuild()
{
    /usr/bin/xcodebuild \
        -workspace "$1" \
        -scheme "$2" \
        -configuration "$3" \
        -sdk "$4" \
        "${@:5}" \
        CODE_SIGNING_ALLOWED=NO

    return $?
}

# Start packager
function run_packager()
{
if [ $1 == "ios" ]
then
  echo $PWD
  ../scrips/run-packager_ios.sh
else
  ../scrips/run-packager_macos.sh
fi
  return $?
}

# Run an iOS simulator xcodebuild invocation with the specified scheme, configuration, and build commands
#
# \param $1 scheme
# \param $2 configuration
# \param $3+ build commands
function ios_simulator_build()
{
    pod_install ios
    run_packager ios
    invoke_xcodebuild "apps/apple/FluentUITester/ios/FluentUITester.xcworkspace" "$1" "$2" iphonesimulator "${@:3}" -destination "platform=iOS Simulator,name=iPhone 8"
    return $?
}

# Run a macOS build and test with the specified scheme, configuration, and build commands
#
# \param $1 scheme
# \param $2 configuration
# \param $3+ build commands
function macos_build()
{
    pod_install macos
    run_packager macos
    invoke_xcodebuild "apps/apple/FluentUITester/macos/FluentUITester.xcworkspace" "$1" "$2" macosx "${@:3}"
    return $?
}

# Execute commands passed in to this script and forward on the exit code.
"$@"
exit $?
