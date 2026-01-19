#!/bin/bash
# Script to update JSX pragmas from withSlots to jsxImportSource

find packages -name "*.tsx" -type f -exec grep -l "@jsx withSlots" {} \; 2>/dev/null | while read -r file; do
  echo "Updating: $file"
  # Use perl for multi-line replacement
  perl -i -0pe 's|/\*\* @jsxRuntime classic \*/\n/\*\* @jsx withSlots \*/|/** @jsxImportSource @fluentui-react-native/framework-base */|g' "$file"
done

echo "Done! Updated all files."
