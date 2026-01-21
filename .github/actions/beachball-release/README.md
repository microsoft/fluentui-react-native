# Beachball Release Action

A GitHub Action that automatically creates release PRs with version bumps using [Beachball](https://github.com/microsoft/beachball), similar to [changesets/action](https://github.com/changesets/action).

## Features

- 🔍 Detects change files in your repository
- 📦 Runs `beachball bump` to update versions and changelogs
- 🔀 Creates a pull request with all version changes
- 🏷️ Automatically labels PRs for easy identification
- ✅ Provides outputs for downstream workflows

## Usage

### Basic Example

```yaml
name: Create Version Bump PR

on:
  push:
    branches:
      - main
    paths:
      - 'change/**'

permissions:
  contents: write
  pull-requests: write

jobs:
  version-bump:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: actions/setup-node@v4
        with:
          node-version: '22'

      - run: yarn install --immutable

      - name: Create version bump PR
        uses: ./.github/actions/beachball-release
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

### With Custom Options

```yaml
- name: Create version bump PR
  id: beachball
  uses: ./.github/actions/beachball-release
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    branch-prefix: 'release/version-bump'
    commit-message: 'chore: bump package versions'
    pr-title: '🚀 Release: Version Bump'

- name: Comment on PR
  if: steps.beachball.outputs.published == 'yes'
  run: |
    echo "Created PR #${{ steps.beachball.outputs.pr-number }}"
    echo "URL: ${{ steps.beachball.outputs.pr-url }}"
```

## Inputs

| Input            | Description                             | Required | Default                              |
| ---------------- | --------------------------------------- | -------- | ------------------------------------ |
| `github-token`   | GitHub token for creating PRs           | Yes      | -                                    |
| `branch-prefix`  | Prefix for the version bump branch name | No       | `beachball/version-bump`             |
| `commit-message` | Commit message for version bumps        | No       | `📦 Bump package versions [skip ci]` |
| `pr-title`       | Title for the version bump PR           | No       | `📦 Bump package versions`           |

## Outputs

| Output        | Description                                          |
| ------------- | ---------------------------------------------------- |
| `has-changes` | Whether change files were found (`yes`/`no`)         |
| `published`   | Whether a version bump PR was created (`yes`/`no`)   |
| `pr-number`   | The PR number if created                             |
| `pr-url`      | The PR URL if created                                |

## How It Works

1. **Checks for change files** - Uses `beachball check` to detect if there are any change files
2. **Creates a branch** - Creates a new branch with timestamp (e.g., `beachball/version-bump-1234567890`)
3. **Runs beachball bump** - Executes `beachball bump` to update package versions and CHANGELOGs
4. **Commits changes** - Commits all version changes with a descriptive message
5. **Creates PR** - Opens a pull request with the version changes, labeled as `version-bump` and `automated`

## Requirements

### Repository Setup

1. **Workflow Permissions**

   - Go to Settings → Actions → General → Workflow permissions
   - Enable "Read and write permissions"
   - Enable "Allow GitHub Actions to create and approve pull requests"

2. **Beachball Configuration**

   - Repository must have a `beachball.config.js` file
   - Must be using beachball for version management

3. **Change Files**
   - Change files should be in the `change/` directory
   - Created using `beachball change` command

## Comparison with Changesets Action

| Feature            | Beachball Action  | Changesets Action |
| ------------------ | ----------------- | ----------------- |
| Version bumping    | ✅ Beachball      | ✅ Changesets     |
| Auto PR creation   | ✅ Yes            | ✅ Yes            |
| Publishing         | Separate workflow | Built-in optional |
| Monorepo support   | ✅ Yes            | ✅ Yes            |
| Change file format | JSON/Markdown     | Markdown          |

## Examples

### Stage 1: PR Creation Only

Use this action to create version bump PRs while keeping your existing publish workflow:

```yaml
name: Version Bump PR

on:
  push:
    branches: [main]
    paths: ['change/**']

permissions:
  contents: write
  pull-requests: write

jobs:
  version-bump:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm install

      - uses: ./.github/actions/beachball-release
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

### Stage 2: Full Workflow with Publishing

Combine with tag creation and publishing workflows:

```yaml
# After version bump PR is merged, create tags
on:
  pull_request:
    types: [closed]

jobs:
  create-tags:
    if: github.event.pull_request.merged == true &&
      contains(github.event.pull_request.labels.*.name, 'version-bump')
    # ... tag creation logic
```

## Troubleshooting

### Action fails with "permission denied"

Ensure workflow permissions are correctly set:

- Settings → Actions → General → Workflow permissions
- Select "Read and write permissions"

### No PR is created

Check the action outputs:

- `has-changes` should be `yes`
- Look for change files in the `change/` directory
- Run `npx beachball check` locally to verify

### PR created but no changes

Verify:

- Beachball config is correct
- Change files have valid format
- Packages have correct version in package.json

## License

MIT

## Related

- [Beachball](https://github.com/microsoft/beachball) - The underlying version management tool
- [Changesets Action](https://github.com/changesets/action) - Similar action for Changesets
