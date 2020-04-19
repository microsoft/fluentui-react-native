#!/bin/bash

# scripts directory
THIS_DIR=$(cd -P "$(dirname "$(readlink "${BASH_SOURCE[0]}" || echo "${BASH_SOURCE[0]}")")" && pwd)
REACT_NATIVE_ROOT="$THIS_DIR/.."
# Application root directory - General use case: react-native is a dependency
PROJECT_ROOT="$THIS_DIR/../apps/apple/FluentUITester"

# Start packager from PROJECT_ROOT
cd "$PROJECT_ROOT/ios" || exit
npm run start
