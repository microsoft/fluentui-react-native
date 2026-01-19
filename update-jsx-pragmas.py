#!/usr/bin/env python3
import os
import glob

# Pattern to search for
OLD_PATTERN = """/** @jsxRuntime classic */
/** @jsx withSlots */"""

NEW_PATTERN = """/** @jsxImportSource @fluentui-react-native/framework-base */"""

# Find all .tsx files
files = glob.glob("packages/**/*.tsx", recursive=True)

updated_count = 0
for file_path in files:
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        if OLD_PATTERN in content:
            new_content = content.replace(OLD_PATTERN, NEW_PATTERN)
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Updated: {file_path}")
            updated_count += 1
    except Exception as e:
        print(f"Error processing {file_path}: {e}")

print(f"\nDone! Updated {updated_count} files.")
