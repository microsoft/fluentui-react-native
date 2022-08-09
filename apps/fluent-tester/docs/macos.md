# Running the FluentUI Tester on macOS

`FluentUI Tester` is the test app that we use to test our FluentUI components during development. It uses the [react-native-test app](https://github.com/microsoft/react-native-test-app) under the covers, and loads the FluentUI bundle.

## Launch `FluentUI Tester` app on macOS

Prereq: FluentUI Tester on macOS can only run on a Mac.

1. Make sure you have followed the [Getting Started](../../../README.md) instructions to install packages and build the entire FluentUI React Native repository. I.e. from the root of the repo:

```sh
yarn
yarn build
```

2. Then go into `apps/fluent-tester/macos` folder and run pod install to pull in the project-level Cocoapod dependencies defined in the podfile, and to generate a valid xcworkspace:

```sh
cd apps/fluent-tester/macos
pod install
```

Note: if you get the error: "CocoaPods could not find compatible versions for pod "MicrosoftFluentUI"," you may need to run `pod install --repo-update`.

3. Return to the macos directory and first run yarn start. Then run yarn macos to launch the FluentUI Tester app:

```sh
cd ..
yarn macos
```

## Debugging

You can debug native code in Xcode. To debug javascript code, you can either use standard web debugging, or you can use [React Native Tools](https://marketplace.visualstudio.com/items?itemName=msjsdiag.vscode-react-native) to debug directly in VS Code. The steps are as follows:

1. Launch your test app + packager as you normally would
2. Go the debug menu in VS Code and run the "Attach to Packager (macOS)" configuration
3. Open the developer menu in your test app, and click debug
4. You now should be able to set breakpoints and step through your code directly in VS Code.

## Dependencies

Dependencies are managed by
[`@rnx-kit/dep-check`](https://github.com/microsoft/rnx-kit/tree/main/packages/dep-check).
If you're looking to upgrade `react-native`, look for the `rnx-kit` section in
`/apps/fluent-tester/package.json`:

```json
{
  ...
  "rnx-kit": {
    "reactNativeVersion": "^0.66",
    "kitType": "app",
    "bundle": {
  ...
}
```

Bump `reactNativeVersion`, and run `yarn rnx-dep-check --write`. This command
will ensure that all relevant packages are bumped correctly.

You can read more about this tool here:
[`@rnx-kit/dep-check` design document](https://github.com/microsoft/rnx-kit/blob/main/docsite/docs/architecture/dependency-management.md)

## Troubleshooting

- If you get the error: "Unable to resolve module... None of these files exist:...", close the packager and restart it by running `yarn start`. Note: you need to restart the packager when you switch to a different platform (e.g. from iOS to macOS), but once it restarts you can reload the tester apps on all running platforms at once.
- If you want to do direct debugging via xcode, after the pod install, you can launch src/FluentTester.xcworkspace and build/run the scheme "ReactTestApp"
- If you want to have a clean rebuild of the generated macOS project, you can do the following:

```sh
cd apps/fluent-tester/macos
rm FluentTester.xcworkspace
rm -r Pods/
pod install
```
