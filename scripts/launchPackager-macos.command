#!/bin/bash

# Set terminal title
echo -en "\\033]0;Metro Bundler\\a"
clear

THIS_DIR=$(cd -P "$(dirname "$(readlink "${BASH_SOURCE[0]}" || echo "${BASH_SOURCE[0]}")")" && pwd)

# shellcheck source=/dev/null
. "$THIS_DIR/run-packager_macos.sh"

if [[ -z "$CI" ]]; then
  echo "Process terminated. Press <enter> to close the window"
  read -r
fi
