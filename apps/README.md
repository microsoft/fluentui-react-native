`FluentUI Tester` is the test app that we use to test our FluentUI components during development.

## Launch `FluentUI Tester` app on iOS

Prereq: FluentUI Tester on iOS can only run on a Mac.

1. Make sure you have followed the Getting Started instructions [here](../../README.md) to install packages and build the entire Fluent UI React Native repository. E.g. from the root of the repo:
```
    yarn && yarn build
```

2. Then go into `apps/ios/src` folder and run pod install:

```
    cd apps/ios/src
    pod install
```
Note: if you get the error: "CocoaPods could not find compatible versions for pod "MicrosoftFluentUI"," you will need to run `pod repo update` and then run `pod install` again.

3. Return to the ios directory and run yarn ios to launch the FluentUI Tester app:

```
    cd ..
    yarn ios
```
Note: the first time you yarn ios, you receive an error and have to run "FluentUITester.xcworkspace" directly from Xcode. The workspace can be found in the apps/ios/src folder. After running the workspace the first time from Xcode, you will be able to `yarn ios` from the CLI.
