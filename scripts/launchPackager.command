#!/bin/bash

# Set terminal title
echo -en "\\033]0;Metro Bundler\\a"
clear

# Run the packager
yarn start:macos

# Handle process ending
if [[ -z "$CI" ]]; then
  echo "Process terminated. Press <enter> to close the window"
  read -r
fi