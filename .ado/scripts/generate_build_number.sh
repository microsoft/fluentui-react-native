#!/bin/bash

# Tweak our build number and export it as a variable for the nuget packing script
BUILD_VERSION_SUFFIX=""
BUILD_VERSION_STRING="0.0.0.1"

if [ -n "$BUILD_NUMBER_SUFFIX_OVERRIDE" ]; then 
    # Allow someone calling us to provide an override to always add a suffix to a given build number by providing an env variable
    ADJUSTED_BUILD_NUMBER_SUFFIX_OVERRIDE="${BUILD_NUMBER_SUFFIX_OVERRIDE//[^a-z0-9A-Z]/}"
    BUILD_VERSION_SUFFIX="-$ADJUSTED_BUILD_NUMBER_SUFFIX_OVERRIDE"
elif [ -n "$BUILD_SOURCEBRANCHNAME" ] && [ "$BUILD_SOURCEBRANCHNAME" != "master" ]; then 
    # Otherwise append the branch name unless we're the main branch for this repo
    ADJUSTED_SOURCEBRANCHNAME="${BUILD_SOURCEBRANCHNAME//[^a-z0-9A-Z]/}"
    BUILD_VERSION_SUFFIX="-$ADJUSTED_SOURCEBRANCHNAME"
fi

if [ -n "$BUILD_BUILDNUMBER" ]; then
    BUILD_VERSION_STRING="$BUILD_BUILDNUMBER"
fi

echo "Original Build Number: $BUILD_BUILDNUMBER"
echo "Adjusted Build Number: $BUILD_VERSION_STRING$BUILD_VERSION_SUFFIX"

echo "##vso[task.setvariable variable=sanitizedBuildNumber]$BUILD_VERSION_STRING$BUILD_VERSION_SUFFIX"
