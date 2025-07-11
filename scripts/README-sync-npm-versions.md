# NPM Version Sync Script

This script helps synchronize local package.json versions with the latest versions published on NPM.

## Purpose

In monorepo environments, it's common for local package versions to fall behind what's actually published to NPM. This script automatically detects such discrepancies and updates the local package.json files to match the NPM registry.

## Usage

### From the root directory:
```bash
# Run the sync script
yarn sync-npm-versions

# Or run directly with node
node scripts/sync-npm-versions.js
```

### From the scripts directory:
```bash
node sync-npm-versions.js
```

## What it does

1. **Scans the workspace** - Finds all package.json files in the project
2. **Checks NPM registry** - Fetches the latest version for each public package
3. **Compares versions** - Uses semantic versioning comparison
4. **Updates package.json** - Updates local files when NPM has a newer version
5. **Provides feedback** - Shows what was updated and what was skipped

## Features

- **Skips private packages** - Won't try to check packages marked as private
- **Handles missing packages** - Gracefully handles packages not found on NPM
- **Semantic version comparison** - Properly compares version numbers (e.g., 1.10.0 > 1.2.0)
- **Rate limiting** - Adds small delays to avoid overwhelming NPM registry
- **Detailed logging** - Shows progress and results for each package

## Output Examples

```
🚀 Starting version sync for /path/to/project
📁 Found 45 package.json files

📂 Processing packages/components/Avatar/package.json
🔍 Checking @fluentui-react-native/avatar (current: 1.12.7)
📦 Updating @fluentui-react-native/avatar: 1.12.7 → 1.12.8

📂 Processing packages/framework/use-slot/package.json
🔍 Checking @fluentui-react-native/use-slot (current: 0.6.2)
✅ @fluentui-react-native/use-slot is up to date (0.6.2)

✨ Sync complete! Updated 1 package(s).
```

## Testing

Run the test suite to verify the script works correctly:

```bash
node scripts/test-sync-npm-versions.js
```

## Important Notes

- **Review changes** - Always review the changes before committing
- **Test compatibility** - Run tests after updating to ensure compatibility
- **Backup recommended** - Consider backing up your workspace before running
- **Network required** - Script needs internet access to check NPM registry

## Troubleshooting

### Common Issues

1. **NPM registry timeouts** - Script includes retry logic and rate limiting
2. **Package not found** - Private or scoped packages may not be accessible
3. **Version format issues** - Script handles standard semver formats

### Error Messages

- `⚠️ Could not fetch version for package-name` - Package not found on NPM or network issue
- `⚠️ No version found in package.json` - Package.json missing version field
- `⚠️ Local version (X.X.X) is newer than NPM (Y.Y.Y)` - Local version ahead of NPM

## Integration

This script can be integrated into CI/CD pipelines or pre-publish workflows to ensure version consistency before releases.
