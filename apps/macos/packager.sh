#!/bin/bash
# Copyright (c) Facebook, Inc. and its affiliates.
#
# This source code is licensed under the MIT license found in the
# LICENSE file in the root directory of this source tree.

# scripts directory
THIS_DIR=$(cd -P "$(dirname "$(readlink "${BASH_SOURCE[0]}" || echo "${BASH_SOURCE[0]}")")" && pwd)
REACT_NATIVE_ROOT="$THIS_DIR/../../node_modules/react-native-macos"
# Application root directory - General use case: react-native is a dependency
PROJECT_ROOT="$THIS_DIR/"

# check and assign NODE_BINARY env
# shellcheck disable=SC1090
source "$REACT_NATIVE_ROOT/scripts/node-binary.sh"

# Start packager from PROJECT_ROOT
cd "$PROJECT_ROOT" || exit
"$NODE_BINARY" "$REACT_NATIVE_ROOT/cli.js" start "$@"
