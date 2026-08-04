# Agentic Components

Use the macOS Storybook app to verify UI changes end-to-end with the repository-pinned
`agent-device` CLI.

## macOS Storybook workflow

1. From `packages/agentic-components/storybook`, run `yarn agent-device --version`,
   `yarn agent-device help workflow`, and `yarn agent-device help react-native` before planning
   device commands. Do not replace the pinned CLI with `npx ...@latest`.
2. If the generated native project is missing, run `pod install --project-directory=macos`.
3. Start `yarn start`, then run `yarn macos` in another terminal. Keep Metro running while
   automating the app.
4. Run `yarn agent-device:attach` while Agentic Components Storybook is frontmost. Use
   `yarn agent-device:open` to reopen the built debug app and attach to it. Use
   `yarn agent-device:doctor` only for initial setup or after a device, helper, app, or Metro
   failure.
5. Follow `open -> snapshot -i -> act with current refs/selectors and --settle -> verify -> close`.
   Keep mutating commands for a session serial and refresh refs after UI changes.

The Storybook sidebar and stories expose accessibility labels for discovery. Prefer those labels
or component `testID` values over coordinates. Check for React Native development overlays when
input is blocked and use `yarn agent-device react-native dismiss-overlay` only when the overlay is
not the behavior under test.
