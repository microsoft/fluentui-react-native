# Running the FluentUI Tester on iOS

`FluentUI Tester` is the test app that we use to test our FluentUI components during development. It uses the [react-native-test app](https://github.com/microsoft/react-native-test-app) under the covers, and loads the fluent-tester bundle.

## Launch `FluentUI Tester` app on iOS

Prereq: FluentUI Tester on iOS can only run on a Mac.

1. Make sure you have followed the [Getting Started](../../README.md) instructions to install packages and build the entire FluentUI React Native repository. I.e. from the root of the repo:

```sh
yarn
yarn build
```

2. Then go into `apps/ios/src` folder and run pod install to pull in the project-level Cocoapod dependencies defined in the podfile, and to generate a valid xcworkspace:

```sh
cd apps/ios/src
pod install
```

Note: if you get the error: "CocoaPods could not find compatible versions for pod "MicrosoftFluentUI"," you may need to run `pod install --repo-update`.

3. Return to the ios directory and run yarn ios to launch the FluentUI Tester app:

```sh
cd ..
yarn ios
```

## Dependencies

Dependencies are managed by
[`@rnx-kit/dep-check`](https://github.com/microsoft/rnx-kit/tree/main/packages/dep-check).
If you're looking to upgrade `react-native`, look for the `rnx-kit` section in
`/apps/ios/package.json`:

```json
{
  ...
  "rnx-kit": {
    "reactNativeVersion": "^0.63",
    "kitType": "app",
    "bundle": {
  ...
}
```

Bump `reactNativeVersion`, and run `yarn rnx-dep-check --write`. This command
will ensure that all relevant packages are bumped correctly.

You can read more about this tool here:
[`@rnx-kit/dep-check` design document](https://github.com/microsoft/rnx-kit/blob/main/packages/dep-check/DESIGN.md)

## Troubleshooting

- The first time you yarn ios, you receive an error and have to run "FluentTester.xcworkspace" directly from Xcode. The workspace can be found in the apps/ios/src folder. After running the workspace the first time from Xcode, you will be able to `yarn ios` from the CLI.
- If the packager didn't launch in a separate terminal and your iOS simulator just shows a white screen for your app, you can run `yarn start` from apps/ios to launch it separately
- If you get the error: "Unable to resolve module... None of these files exist:...", close the packager and restart it by running `yarn start`. Note: you need to restart the packager when you switch to a different platform (e.g. from macOS or Android to iOS), but once it restarts you can reload the tester apps on all running platforms at once.
- If you want to do direct debugging via xcode, after the pod install, you can launch src/FluentTester.xcworkspace and build/run the scheme "ReactTestApp"
- If you want to have a clean rebuild of the generated iOS project, you can do the following:

```sh
cd apps/ios/
rm src/FluentTester.xcworkspace
rm -r src/Pods/
pod install --project-directory=src.
```
