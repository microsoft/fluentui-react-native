# Legacy mobile tester

This private workspace hosts the iOS and Android FluentTester apps. The shared
tester UI and component pages remain in [`apps/tester-core`](../tester-core).
Desktop apps remain in [`apps/fluent-tester`](../fluent-tester), and Win32
remains in [`apps/win32`](../win32).

## Run the apps

From the repository root, install dependencies and build the repository:

```sh
yarn
yarn build
```

For Android, start Metro and launch the app:

```sh
cd apps/legacy-mobile
yarn start
yarn android
```

For iOS, install pods from the owning app's iOS directory, then launch:

```sh
cd apps/legacy-mobile/ios
pod install
cd ..
yarn ios
```

The PR validation bundles Android and bundles/builds the iOS simulator app.
It does not run mobile UI tests. Historical mobile E2E specifications remain
in `apps/E2E/src` but have no active runner configuration or command.

The iOS app icon is the single-size set in `assets/AppIcon.appiconset`. The
Podfile copies it into React Native Test App's generated asset catalog because
the test app's `ios.icons` manifest option resolves icon paths incorrectly.

## Package alignment

React Native dependencies are managed with
[`@rnx-kit/align-deps`](https://github.com/microsoft/rnx-kit/tree/main/packages/align-deps).
Use `yarn rnx-align-deps --set-version` when intentionally upgrading React
Native.
