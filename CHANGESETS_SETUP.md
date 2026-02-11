# Changesets Hybrid Workflow Setup Guide

This guide explains how to set up the hybrid changesets workflow that uses GitHub Actions for version bumps and Azure Pipelines for publishing.

## Prerequisites

- Repository admin access to configure GitHub Actions permissions
- Azure Pipelines already configured with NPM token

## Architecture Overview

```
Developer → Changeset (markdown) → PR merged to main
    ↓
GitHub Actions (@changesets/action)
    - changeset version (bump package.json versions)
    - Create "Version Packages" PR
    - Use standard GITHUB_TOKEN with write permissions
    - Run dependency-profiles postbump hook
    ↓
Version PR merged
    ↓
Azure Pipelines
    - Build & test
    - changeset publish (to npm)
    - Create git tags (automatic with changeset publish)
```

## Phase 1: GitHub Actions Permissions

The workflow uses the standard `GITHUB_TOKEN` with elevated permissions to create version bump PRs.

### Workflow Permissions

The workflow is configured with the following permissions in [`.github/workflows/changesets-version.yml`](.github/workflows/changesets-version.yml):

```yaml
permissions:
  contents: write       # For creating commits and tags
  pull-requests: write  # For creating version bump PRs
```

**No additional setup required** - GitHub automatically provides the `GITHUB_TOKEN` secret to workflows with these scoped permissions.

### Note on GitHub Apps (Alternative Approach)

If your organization has restrictions that prevent the standard `GITHUB_TOKEN` from creating PRs, you can optionally use a GitHub App token approach (like [rnx-kit does](https://github.com/microsoft/rnx-kit/commit/28e835365bdeed97e50ff8e7e68ea9ad531d3849)). However, this adds complexity and is not needed for this repository.

## Phase 2: Verify Azure Pipelines Configuration

The Azure Pipelines publish workflow has been updated to use `changeset publish` instead of `beachball publish`.

**Required Azure Variable Groups** (should already exist):
- `FluentUI React Native Secrets` - Contains `npmAuth` variable

**No changes needed** - Azure Pipelines will automatically use the new publish command.

## Phase 3: PR Validation (Configured ✅)

Three layers of changeset validation are now active:

### 1. Changeset Bot (GitHub App) ✅
- **Status**: Installed
- **What it does**: Automatically comments on PRs without changesets
- Shows: "⚠️ No Changeset" or "✅ Changeset detected"
- Updates in real-time as changesets are added

### 2. GitHub Actions PR Validation ✅
- **Workflow**: `.github/workflows/pr-validation.yml`
- **What it does**: Enforces changesets in CI/CD
- Checks:
  - ✅ Changeset files exist
  - ✅ No major version bumps (breaking changes disallowed)
  - ✅ Changeset version dry-run passes (ensures no errors)
- Automatically skips for version bump PRs (`changeset-release/main`)

**Script**: [`.github/scripts/validate-changesets.mts`](.github/scripts/validate-changesets.mts)

**Run locally**:
```bash
yarn changeset:validate
```

**All layers work together**:
- Bot provides immediate visual feedback
- GitHub Actions enforces requirements and validates quality

## Phase 4: Developer Workflow Changes

### Creating Changesets (New Way)

**Before (Beachball)**:
```bash
yarn change
```

**After (Changesets)**:
```bash
yarn changeset
# Interactive CLI will guide you through:
# 1. Which packages changed
# 2. What type of bump (major/minor/patch)
# 3. Description of changes
```

### Changeset File Format

**Beachball** (JSON in `change/` directory):
```json
{
  "type": "patch",
  "comment": "Fix button accessibility",
  "packageName": "@fluentui-react-native/button",
  "email": "user@example.com"
}
```

**Changesets** (Markdown in `.changeset/` directory):
```markdown
---
"@fluentui-react-native/button": patch
---

Fix button accessibility
```

### Checking Status

```bash
# See what packages will be published
yarn changeset:status

# See detailed version changes
yarn changeset:status --verbose
```

### Post-Version Hook (dependency-profiles)

After version bumps, the `dependency-profiles` package needs to be updated with the latest versions. This is handled automatically in GitHub Actions.

**What it does:**
- Updates `packages/dependency-profiles` with latest package versions
- Runs `yarn install --mode update-lockfile` to update yarn.lock
- Commits and pushes changes (in CI only)

**Script location:** [`.github/scripts/update-dependency-profiles-postbump.mts`](.github/scripts/update-dependency-profiles-postbump.mts)

To manually run the script locally (for debugging):
```bash
node .github/scripts/update-dependency-profiles-postbump.mts
```

## Phase 4: Testing the Workflow

### Local Testing

1. **Install dependencies**:
   ```bash
   yarn install
   ```

2. **Create a test changeset**:
   ```bash
   yarn changeset
   # Select a package
   # Choose "patch"
   # Add description: "Test changeset workflow"
   ```

3. **Test version bump locally** (optional):
   ```bash
   yarn changeset:version
   # This will:
   # - Update package.json versions
   # - Update CHANGELOG.md files
   # - Consume changeset files
   # - Update yarn.lock

   # Reset if just testing:
   git reset --hard HEAD
   ```

### End-to-End Testing

1. **Merge a changeset to main**:
   - Create branch with changeset
   - Open PR
   - Merge to main

2. **Verify GitHub Actions**:
   - Go to Actions tab
   - Check "Changesets Version Bump" workflow
   - Verify it creates a PR titled "chore(release): version packages"
   - PR branch should be `changeset-release/main`

3. **Merge version PR**:
   - Review the version bump PR
   - Merge to main

4. **Verify Azure Pipelines**:
   - Check Azure Pipelines run
   - Verify packages published to npm
   - Verify git tags created (changesets creates them automatically)

## Troubleshooting

### GitHub Actions Fails with "Resource not accessible by integration"

**Problem**: The `GITHUB_TOKEN` doesn't have sufficient permissions.

**Solution**:
1. Verify the workflow has `permissions` section with `contents: write` and `pull-requests: write`
2. Check repository settings → Actions → General → Workflow permissions
3. Ensure "Read and write permissions" is selected (not "Read repository contents and packages permissions")

### Azure Pipelines "changeset publish" Fails

**Problem**: NPM authentication issue or no packages to publish.

**Solution**:
1. Check that version bump PR was merged first
2. Verify `npmAuth` variable exists in `FluentUI React Native Secrets` group
3. Check Azure Pipelines logs for specific error

### "No changesets present"

**Problem**: Forgot to create changeset in PR.

**Solution**:
- Run `yarn changeset` to create a changeset file
- Commit and push the `.changeset/*.md` file
- Changesets PR bot will update status

## Migration from Beachball

### Can I use both?

**Yes** - during transition period:
- `yarn change` - still works (beachball)
- `yarn changeset` - new way (changesets)

Eventually, remove beachball commands once fully migrated.

### What about existing change files?

**Beachball change files** in `change/` directory are ignored by changesets.

Options:
1. Process remaining beachball changes before migration
2. Manually convert to changesets format
3. Keep beachball for processing old changes

### Branch name changed

**Old**: `beachball/version-bump/main`
**New**: `changeset-release/main`

Update any CI/CD rules that reference the old branch name.

## References

- **Changesets docs**: https://github.com/changesets/changesets
- **GitHub Actions permissions**: https://docs.github.com/en/actions/security-for-github-actions/security-guides/automatic-token-authentication#permissions-for-the-github_token
- **rnx-kit example** (uses GitHub App approach): https://github.com/microsoft/rnx-kit/.github/workflows/build.yml

## Support

If you encounter issues:
1. Check this guide's troubleshooting section
2. Review GitHub Actions logs
3. Check Azure Pipelines logs
4. Review the plan document: `/Users/sanajmi/.claude/plans/stateless-jumping-unicorn.md`
