# Test Projects

This directory contains additional monorepos which can be used to test the fluent controls from the perspective of a consumer. These repos:

- Include both pnpm and yarn based monorepos
- Bundle with both haul and metro
- Are not linked to the main repo, so package installs are separate
- Consume packages from the main repo via the registry

## Goals

There are two primary goals for these repos:

### Consumption Scenarios

Not all consumers of the repo consume the packages or bundle using the same tools or techniques. The test repos can provide ways for us to test, and eventually validate that various consumption scenarios work. Examples include differences in packager, bundler, ES5 vs ES6, TypeScript vs. JavaScript.

### End-to-end Publishing

While these projects are initially consuming @fluentui/react-native from global registries like https://registry.npmjs.org/ the goal will be to be able to use verdaccio to stand up end-to-end publishing tests. The workflow will be:

1. Main Repo: Install + build
2. Test Repos: Install from global registries
3. Start Verdaccio Instance
4. Main Repo: Run publishing flow against verdaccio
5. Test Repo: Bump versions for updated packages
6. Test Repo: Install updates from verdaccio
7. Run builds, bundles, and any tests

The goal will be for this to run in CI.

## Things to Do:

This is tracking the work required for lighting up end-to-end publishing.

**Required:**

- [x] Add test repos
- [x] Basic script to execute installs and builds
- [ ] Verdaccio utilities for running an in-memory server
- [ ] Script to pull updated versions from main repo
- [ ] Script to bump versions in test repos
- [ ] Script to clean-up correctly and handle edge cases (when testing publishing it's easy to mess up your branch or state)
- [ ] Add runtime validation (at least boot and shutdown win32 tester)
- [ ] Light up pipeline in CI

**Nice to Have:**

- [ ] Add more generation for repos
- [ ] Make test code be authored once, then pushed to each generated repo
- [ ] Add typescript usage
- [ ] Add flow usage
- [ ] Add npm single repo usage
