# Running the FluentUI Tester on Android

`FluentUI Tester` is the test app that we use to test our FluentUI components during development. It uses the [react-native-test app](https://github.com/microsoft/react-native-test-app) under the covers, and loads the fluent-tester bundle.

## Launch `FluentUI Tester` app on Android

Prereqs:

- FluentUI Tester is built uses react-native-test app, so install its [prereqs](https://github.com/microsoft/react-native-test-app#react-native-test-app) and follow instructions depending on whether you're developing on Windows or macOS.
- Install [Android Studio](https://developer.android.com/studio)
- Make sure you have setup an [Android Virtual Device](https://developer.android.com/studio/run/managing-avds)

1. Make sure you have followed the [Getting Started](../../../README.md) instructions to install packages and build the entire FluentUI React Native repository. I.e. from the root of the repo:

```sh
yarn
yarn build
```

2. Start the server by running:

```sh
cd apps/fluent-tester
yarn start
```

3. To boot the app, open a new command prompt and run:

```sh
cd apps/fluent-tester
yarn android
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

You can debug native code in Android Studio. To debug javascript code, you can either use standard web debugging, or you can use [React Native Tools](https://marketplace.visualstudio.com/items?itemName=msjsdiag.vscode-react-native) to debug directly in VS Code. The steps are as follows:

1. Launch your test app + packager as you normally would
2. Go the debug menu in VS Code and run the "Attach to Packager (Android)" configuration
3. Open the developer menu in your test app, and click debug
4. You now should be able to set breakpoints and step through your code directly in VS Code.

## Troubleshooting

- The first time you run your project, you may get errors about missing SDKs. Android Studio usually provides quick options to resolve these issues, but you can also go to Tools->SDK Manager to manually install or update SDK platforms or tools for your project.

- If you get the error "command not found: adb", add the following to .bash_profile or .zprofile

```sh
export PATH=~/Library/Android/sdk/platform-tools:$PATH
```

- If you would like to debug in Android Studio, you can do the following to open the project there:

```sh
# macOS
open -a "Android Studio" .

# Windows
# Easiest to open from within Android Studio - see picture below
```

![On Windows, it is easiest to open from within Android Studio, and the folder will show an Android Studio icon.](./../../../assets/fluent_tester_android_windows_open.png)

Note: if Android Studio does not provide you with an "app" to run after you first open the project from the android folder, you may have to restart Android Studio.

Once Android Studio finishes preparing your app folder, you will be able to build and run your app by clicking on the "app" dropdown in the menu bar. If you have not yet setup an AVD, please see [this page](https://developer.android.com/studio/run/managing-avds) on how to set one up.

![Run your app from Android Studio with the "app" button in the menu bar.](./../../../assets/fluent_tester_android_app_built.png)
