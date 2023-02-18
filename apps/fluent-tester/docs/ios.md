# Running the FluentUI Tester on iOS

`FluentUI Tester` is the test app that we use to test our FluentUI components during development. It uses the [react-native-test app](https://github.com/microsoft/react-native-test-app) under the covers, and loads the fluent-tester bundle.

## Launch `FluentUI Tester` app on iOS

Prereq: FluentUI Tester on iOS can only run on a Mac.

1. Make sure you have followed the [Getting Started](../../../README.md) instructions to install packages and build the entire FluentUI React Native repository. I.e. from the root of the repo:

```sh
yarn
yarn build
```

2. Then go into `apps/fluent-tester/ios` folder and run `pod install` to pull in the project-level Cocoapod dependencies defined in the podfile, and to generate a valid xcworkspace:

```sh
cd apps/fluent-tester/ios
pod install
```

Note: if you get the error: "CocoaPods could not find compatible versions for pod "MicrosoftFluentUI"," you may need to run `pod install --repo-update`.

3. Return to the `fluentui-tester` directory and run `yarn ios` to launch the FluentUI Tester app:

```sh
cd ..
yarn ios
```

## Dependencies

Dependencies are managed by
[`@rnx-kit/align-deps`](https://github.com/microsoft/rnx-kit/tree/main/packages/align-deps).
If you're looking to upgrade `react-native`, use the interactive upgrade command:

```sh
yarn rnx-align-deps --set-version
```

This command will ensure that all relevant packages are bumped correctly.

You can read more about this tool here:
[`@rnx-kit/align-deps` design document](https://github.com/microsoft/rnx-kit/blob/main/docsite/docs/architecture/dependency-management.md)

## Debugging

You can debug native code in Xcode. To debug javascript code, you can either use standard web debugging, or you can use [React Native Tools](https://marketplace.visualstudio.com/items?itemName=msjsdiag.vscode-react-native) to debug directly in VS Code. The steps are as follows:

1. Launch your test app + packager as you normally would
2. Go the debug menu in VS Code and run the "Attach to Packager (iOS)" configuration
3. Open the developer menu in your test app, and click debug
4. You now should be able to set breakpoints and step through your code directly in VS Code.

## Troubleshooting

- The first time you yarn ios, you receive an error and have to run "FluentTester.xcworkspace" directly from Xcode. The workspace can be found in the apps/fluent-tester/ios folder. After running the workspace the first time from Xcode, you will be able to `yarn ios` from the CLI.
- If the packager didn't launch in a separate terminal and your iOS simulator just shows a white screen for your app, you can run `yarn start` from apps/fluent-tester to launch it separately
- If you get the error: "Unable to resolve module... None of these files exist:...", close the packager and restart it by running `yarn start`. Note: you need to restart the packager when you switch to a different platform (e.g. from macOS or Android to iOS), but once it restarts you can reload the tester apps on all running platforms at once.
- If you want to do direct debugging via xcode, after the pod install, you can launch src/FluentTester.xcworkspace and build/run the scheme "ReactTestApp"
- If you want to have a clean rebuild of the generated iOS project, you can do the following:

```sh
cd apps/fluent-tester/ios
rm FluentTester.xcworkspace
rm -rf Pods/
pod install
```
