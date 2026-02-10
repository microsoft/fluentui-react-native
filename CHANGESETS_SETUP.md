# Changesets Hybrid Workflow Setup Guide

This guide explains how to set up the hybrid changesets workflow that uses GitHub Actions for version bumps and Azure Pipelines for publishing.

## Prerequisites

- Organization admin access to configure GitHub App
- Repository admin access to add secrets and variables
- Azure Pipelines already configured with NPM token

## Architecture Overview

```
Developer → Changeset (markdown) → PR merged to main
    ↓
GitHub Actions (@changesets/action)
    - changeset version (bump package.json versions)
    - Create "Version Packages" PR
    - Use GitHub App token (bypasses org PR restrictions)
    - Run dependency-profiles postbump hook
    ↓
Version PR merged
    ↓
Azure Pipelines
    - Build & test
    - changeset publish (to npm)
    - Create GitHub releases
    - Push git tags
```

## Phase 1: GitHub App Setup (REQUIRED)

### Step 1: Create or Configure GitHub App

**Option A: Use existing react-native-sdk-bot**
1. Check if `react-native-sdk-bot` exists in your organization
2. Verify it has the required permissions (see below)
3. Install it on `microsoft/fluentui-react-native` repository

**Option B: Create new GitHub App**
1. Go to GitHub organization settings: https://github.com/organizations/microsoft/settings/apps
2. Click "New GitHub App"
3. Configure:
   - **Name**: `fluentui-react-native-release` (or similar unique name)
   - **Homepage URL**: `https://github.com/microsoft/fluentui-react-native`
   - **Webhook**: Uncheck "Active"

4. **Permissions** (Repository permissions):
   - Contents: **Read and write**
   - Pull requests: **Read and write**

5. **Where can this GitHub App be installed?**: "Only on this account"

6. Click "Create GitHub App"

### Step 2: Install GitHub App on Repository

1. After creating the app, go to "Install App" in the left sidebar
2. Click "Install" next to your organization
3. Select "Only select repositories"
4. Choose `microsoft/fluentui-react-native`
5. Click "Install"

### Step 3: Generate Private Key

1. Go to your GitHub App settings
2. Scroll to "Private keys" section
3. Click "Generate a private key"
4. A `.pem` file will download - **keep this secure!**

### Step 4: Get App ID

1. In GitHub App settings, find the "App ID" near the top
2. It's a numeric value (e.g., `123456`)
3. Copy this number

### Step 5: Add Repository Secrets and Variables

1. Go to repository settings: https://github.com/microsoft/fluentui-react-native/settings/secrets/actions

2. Add **Repository Secret** `PRIVATE_KEY`:
   - Click "New repository secret"
   - Name: `PRIVATE_KEY`
   - Value: Paste the entire contents of the `.pem` file (including `-----BEGIN RSA PRIVATE KEY-----` and `-----END RSA PRIVATE KEY-----`)
   - Click "Add secret"

3. Go to Variables tab: https://github.com/microsoft/fluentui-react-native/settings/variables/actions

4. Add **Repository Variable** `APP_ID`:
   - Click "New repository variable"
   - Name: `APP_ID`
   - Value: The numeric App ID from Step 4
   - Click "Add variable"

## Phase 2: Verify Azure Pipelines Configuration

The Azure Pipelines publish workflow has been updated to use `changeset publish` instead of `beachball publish`.

**Required Azure Variable Groups** (should already exist):
- `FluentUI React Native Secrets` - Contains `npmAuth` variable

**No changes needed** - Azure Pipelines will automatically use the new publish command.

## Phase 3: Developer Workflow Changes

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
   - Check GitHub releases created
   - Verify git tags pushed

## Troubleshooting

### GitHub Actions Fails with "Resource not accessible by integration"

**Problem**: GitHub App doesn't have correct permissions.

**Solution**:
1. Go to GitHub App settings
2. Verify permissions: Contents (read & write), Pull requests (read & write)
3. If permissions were changed, reinstall the app on the repository

### GitHub Actions Fails with "Bad credentials"

**Problem**: PRIVATE_KEY or APP_ID is incorrect.

**Solution**:
1. Verify APP_ID matches the number in GitHub App settings
2. Regenerate private key if needed
3. Update repository secret with new key

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
- **GitHub App tokens**: https://github.com/actions/create-github-app-token
- **rnx-kit example**: https://github.com/microsoft/rnx-kit/.github/workflows/build.yml

## Support

If you encounter issues:
1. Check this guide's troubleshooting section
2. Review GitHub Actions logs
3. Check Azure Pipelines logs
4. Review the plan document: `/Users/sanajmi/.claude/plans/stateless-jumping-unicorn.md`
