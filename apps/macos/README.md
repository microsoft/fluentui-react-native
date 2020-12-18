# Running the FluentUI Tester on macOS

`FluentUI Tester` is the test app that we use to test our FluentUI components during development. It uses the [react-native-test app](https://github.com/microsoft/react-native-test-app) under the covers, and loads the FluentUI bundle.

## Launch `FluentUI Tester` app on macOS

Prereq: FluentUI Tester on macOS can only run on a Mac.

1. Make sure you have followed the [Getting Started](../../README.md) instructions to install packages and build the entire FluentUI React Native repository. I.e. from the root of the repo:

```
    yarn && yarn build
```

2. Then go into `apps/macos/src` folder and run pod install to pull in the project-level Cocoapod dependencies defined in the podfile, and to generate a valid xcworkspace:

```
    cd apps/macos/src
    pod install
```

Note: if you get the error: "CocoaPods could not find compatible versions for pod "MicrosoftFluentUI"," you may need to run `pod install --repo-update`.

3. Return to the macos directory and first run yarn start. Then run yarn macos to launch the FluentUI Tester app:

```
    cd ..
    yarn macos
```

Troubleshooting

- If you want to do direct debugging via xcode, after the pod install, you can launch src/FluentTester.xcworkspace and build/run the scheme "ReactTestApp"
- If you want to have a clean rebuild of the generated macOS project, you can do the following:

```
cd apps/macos/
rm src/FluentTester.xcworkspace
rm -r src/Pods/
pod install --project-directory=src.
```
