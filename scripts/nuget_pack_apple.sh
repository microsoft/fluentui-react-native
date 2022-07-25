#!/bin/bash

options='h?vcpd'
usage="
nuget_pack_apple.sh [-${options}]

Builds macOS and iOS targets and packages the results into a form usable for NuGet
imports, for use in local sideloading/debugging/validation by NuGet consumers.

Based on the Azure Pipeline defined in .ado/templates/apple-nuget-publish.yml,
with which this script should remain in sync.

Options:
-h or -?: Print this message and exit.
-v: Increase verbosity.
    Verbosity levels are as follows, where each level includes output from lower levels:
        0 (default): Log only major actions, errors/warnings, and success/failure.
        1: Log subprocess commands.
        2: Set xcodebuild and zip to defaut output level; make other commands verbose.
        3+: Make xcodebuild and zip verbose.
-c: Clean beforehand.
    Multiple levels of cleanliness are available, indicating how much of previous build,
    copy or zip output to remove before beginning a new nuget pack operation.  Each level
    includes all cleaning from lower levels:
        0 (default): Do not remove any previous build, copy or zip outputs.
        1: Remove nuget folder, including copy and zip outputs.
        2: Remove DerivedData folder, including build outputs and nuget folder.
        3+: Clean the git repo using \`git clean -dfx\`.
-p: Include prerequisite steps.
    This attempts to run the steps necessary to generate a NuGet package from a brand new
    git repo, without requiring the user to run steps such as \`pod install\` beforehand.
-d: Debug build with Ship packaging.
    The Fluent React Native NuGet package is that it includes only Ship binaries.
    Downstream consumers are expected to link these in both Debug and Ship builds.  To
    facilitate debugging, this option builds the Fluent React Native libraries in the
    Debug configuration, but places the built libraries in the corresponding nuget/Ship-*
    folders.

Notes:
1. When running with the -p option, a hardcoded value of the developer directory is used,
but can be overridden with the XCODE_PATH_OVERRIDE environment variable.  See
.ado/scripts/xcode_select_current_version.sh for details.

2. Outputs for each platform should be kept in sync with the contents of package.nuspec.
"

# Process command-line arguments.
declare -i verbosity=0
declare -i cleanliness=0
declare prerequisites
declare debug
while getopts "$options" option
do
	case "$option"
	in
		h|\?)
			echo "$usage"
			exit 0;;
		v)
			((verbosity++));;
		c)
			((cleanliness++));;
		p)
			prerequisites=1;;
		d)
			debug=1;
	esac
done

# Keep an exit code so that we can return a non-zero exit code if any build fails,
# while still running all builds each time.
exit_code=0

# Print message with red text.
#
# \param $1+ message text
function log_error
{
	/usr/bin/tput setaf 1  # red
	echo "$@"
	/usr/bin/tput sgr0
}

# Wrap subprocess execution and check result.
#
# \param $1+ subprocess command and arguments
function run_subprocess
{
	if [[ $verbosity -ge 1 ]]
	then
		/usr/bin/tput setaf 6  # cyan
		echo "$@"
		/usr/bin/tput sgr0
	fi

	if [[ $verbosity -le 1 ]] && [[ $1 =~ pushd|popd ]]
	then
		# Special output handling for pushd/popd
		"$@" >/dev/null
	else
		"$@"
	fi

	local last_exit=$?
	if [[ $last_exit -ne 0 ]]
	then
		log_error "Previous subprocess exited with non-zero exit code $last_exit"
		# Intentionally changing the global exit_code variable
		exit_code=1
	fi
	return $last_exit
}

# Exit the script after checking for errors and printing an appropriate status message.
function check_exit
{
	# Check if any of our individual build steps failed
	trap - INT
	if [[ $exit_code -ne 0 ]]
	then
		/usr/bin/tput setaf 9  # bright red
		/usr/bin/tput bold
		echo
		echo "NuGet pack failed.  See above for failure details."
	else
		/usr/bin/tput setaf 10  # bright green
		/usr/bin/tput bold
		echo
		echo "NuGet pack succeeded.  Output folder: $nuget_dir"
	fi
	/usr/bin/tput sgr0
	exit $exit_code
}

# Log a message at the start of a significant action.
#
# \param 1 symbol (emoji) depicting action
# \param 2+ description of action
function log_action
{
	/usr/bin/tput bold
	# Compensate for varying widths of emoji in fixed-width fonts
	echo -ne "$1\r"  # CR returns us to beginning of line
	/usr/bin/tput cuf 3  # move 3 columns to the right (double-width emoji symbol + space)
	echo "-> ${@:2}..."
	/usr/bin/tput sgr0
}

# Halt the entire script on Ctrl-C.  Otherwise, Ctrl-C has unpredictable behavior, such as
# possibly interrupting a subprocess but continuing to the next line of the script.
trap "exit_code=1; check_exit" INT

# Determine verbosity for cp and mkdir commands
verbosity_arg=
[[ $verbosity -ge 2 ]] && verbosity_arg='-v'

# Clean and prep output folders.
git_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.."; pwd)"
derived_data_dir="${git_root}/DerivedData"
products_dir="${derived_data_dir}/Build/Products"
nuget_dir="${products_dir}/nuget"
if [[ $cleanliness -eq 1 ]]
then
	log_action 🧼 "Cleaning nuget folder"
	run_subprocess /bin/rm -R -f $verbosity_arg "$nuget_dir"
elif [[ $cleanliness -ge 2 ]]
then
	log_action 🧼 "Cleaning derived data folder"
	run_subprocess /bin/rm -R -f $verbosity_arg "$derived_data_dir"
fi

# Clean the git repo.
function git_clean
{
	local verbosity_arg
	[[ $verbosity -le 1 ]] && verbosity_arg='--quiet'

	log_action 🧼 "Cleaning git repo"
	run_subprocess pushd "$git_root"
	run_subprocess git clean -dfx $verbosity_arg
	run_subprocess popd
}
[[ $cleanliness -ge 3 ]] && git_clean

run_subprocess /bin/mkdir -p $verbosity_arg "$nuget_dir"

# Set up git repo to build native macOS and iOS libraries.
function do_prerequisites
{
	# The same verbosity arg applies to `yarn`, `gem` and `pod`
	local verbosity_arg
	if [[ $verbosity -le 1 ]]
	then
		verbosity_arg='--silent'
	elif [[ $verbosity -ge 3 ]]
	then
		verbosity_arg='--verbose'
	fi

	log_action 📦 "Installing yarn dependencies"
	run_subprocess pushd "$git_root"
	run_subprocess yarn install $verbosity_arg
	log_action 🏗 "Building yarn tools"
	run_subprocess yarn build-tools $verbosity_arg
	run_subprocess popd

	log_action 📦 "Installing CocoaPods gem if needed"
	run_subprocess pod --version || /usr/bin/sudo gem install cocoapods $verbosity_arg

	log_action 🔨 "Selecting officially supported Xcode version"
	run_subprocess "${git_root}/.ado/scripts/xcode_select_current_version.sh"

	log_action 📦 "Installing CocoaPods dependencies for macOS"
	run_subprocess pushd "${git_root}/apps/macos/src"
	run_subprocess pod install $verbosity_arg
	run_subprocess popd

	log_action 📦 "Installing CocoaPods dependencies for iOS"
	run_subprocess pushd "${git_root}/apps/ios/src"
	run_subprocess pod install $verbosity_arg
	run_subprocess popd
}
[[ $prerequisites ]] && do_prerequisites

# Invoke xcodebuild and copy output to nuget folder.
#
# Match Azure DevOps xcodebuild invocations by disabling code signing.
#
# \param $1 path to Xcode workspace
# \param $2 scheme to build
# \param $3 configuration
# \param $4 sdk
# \param $5 xcconfig
# \param $6+ build outputs to copy
function build_and_copy_output()
{
	local path="$1"
	local scheme="$2"
	local config="$3"
	local sdk="$4"
	local xcconfig="$5"
	local build_outputs_to_copy=("${@:6}")

	# Set xcodebuild verbosity
	local verbosity_arg
	local verbosity_flags=()
	if [[ $verbosity -le 1 ]]
	then
		verbosity_arg="-quiet"
		# SWIFT_SUPPRESS_WARNINGS=YES conflicts with the -warnings-as-errors option rather
		# than superseding it, even when paired with SWIFT_WARNINGS_AS_ERRORS=NO, so we
		# have to live with Swift warning spew in our output for now.  But the flag below
		# will at least suppress clang warning spew, which is mostly out of our control.
		verbosity_flags=(GCC_WARN_INHIBIT_ALL_WARNINGS=YES)
	elif [[ $verbosity -ge 3 ]]
	then
		verbosity_arg="-verbose"
	fi

	# Determine platform/destination for xcodebuild from sdk
	local platform
	local config_products_dir="${products_dir}/${config}-${sdk}"
	case "$sdk"
	in
		macosx)
			platform=macOS;
			config_products_dir="${products_dir}/${config}";;
		iphoneos)
			platform=iOS;;
		iphonesimulator)
			platform='iOS Simulator';;
		*)
			log_error "Invalid sdk: $sdk";
			return 1;;
	esac
	local destination=generic/platform="$platform"

	# Build
	log_action 🏗 "Building $platform $config"
	run_subprocess /usr/bin/xcodebuild \
		-workspace "$path" \
		-scheme "$scheme" \
		-configuration "$config" \
		-sdk "$sdk" \
		-destination "$destination" \
		$verbosity_arg \
		build \
		-derivedDataPath "$derived_data_dir" \
		-xcconfig "$xcconfig" \
		CODE_SIGNING_ALLOWED=NO \
		"${verbosity_flags[@]}" \
	|| return $?

	# Set rsync verbosity
	if [[ $verbosity -le 1 ]]
	then
		verbosity_arg=
	else
		verbosity_arg='--verbose'
	fi

	# Determine destination folder for outputs
	local nuget_platform_dir="Ship-${sdk}"

	# Copy outputs
	log_action 📂 "Copying $platform $config output to nuget/$nuget_platform_dir folder"
	run_subprocess /usr/bin/rsync \
		--archive \
		--delete \
		$verbosity_arg \
		${build_outputs_to_copy[@]} \
		"${nuget_dir}/${nuget_platform_dir}/"
}

# Build for macOS with the specified configuration.
#
# \param $1 configuration
function build_and_copy_macos()
{
	build_and_copy_output \
	"${git_root}/apps/macos/src/FluentTester.xcworkspace" \
	FluentTester \
	"$1" \
	macosx \
	"${git_root}/.ado/xcconfig/publish_overrides.xcconfig" \
	${products_dir}/${1}/{"FRN*/libFRN*.a",RCTFocusZone/libRCTFocusZone.a}
}

# Build for iOS device with the specified configuration.
#
# \param $1 configuration
function build_and_copy_ios_device()
{
	build_and_copy_output \
	"${git_root}/apps/ios/src/FluentTester.xcworkspace" \
	FluentTester \
	"$1" \
	iphoneos \
	"${git_root}/.ado/xcconfig/publish_overrides_ios_device.xcconfig" \
	"${products_dir}/${1}-iphoneos/FRN*/libFRN*.a"
}

# Build for iOS simulator with the specified configuration.
#
# \param $1 configuration
function build_and_copy_ios_simulator()
{
	build_and_copy_output \
	"${git_root}/apps/ios/src/FluentTester.xcworkspace" \
	FluentTester \
	"$1" \
	iphonesimulator \
	"${git_root}/.ado/xcconfig/publish_overrides_ios_simulator.xcconfig" \
	"${products_dir}/${1}-iphonesimulator/FRN*/libFRN*.a"
}

# Determine platform to build
[[ $debug ]] && config=Debug || config=Release

# Build and copy outputs for all platforms
build_and_copy_macos $config
build_and_copy_ios_device $config
build_and_copy_ios_simulator $config

# Archive outputs only if all lead-up steps succeeded.
if [[ $exit_code -eq 0 ]]
then
	log_action 🗜 "Archiving nuget folder contents into BuildOutput.zip"
	run_subprocess pushd "$nuget_dir"  # zip is always relative to the current directory
	if [[ $verbosity -le 1 ]]
	then
		verbosity_arg='--quiet'
	elif [[ $verbosity -ge 3 ]]
	then
		verbosity_arg='--verbose'
	else
		verbosity_arg=
	fi
	run_subprocess /usr/bin/zip \
		--symlinks \
		--recurse-paths \
		$verbosity_arg \
		BuildOutput.zip \
		Ship-{macosx,iphoneos,iphonesimulator}/
	run_subprocess popd
fi

check_exit
