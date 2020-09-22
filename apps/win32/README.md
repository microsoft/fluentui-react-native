`FluentUI Tester` is the test app that we use to test our FluentUI components during development.

## Prerequisites

- [Node.js](https://nodejs.org/en/download/)
- [React Native Windows Development Dependencies](https://microsoft.github.io/react-native-windows/docs/rnw-dependencies#manual-setup)
  - **NOTE:** Please make sure you grab all of the items listed there and the appropriate versions.
- Enable [Developer Mode](https://docs.microsoft.com/en-us/windows/uwp/get-started/enable-your-device-for-development) in Windows settings

## Launch `FluentUI Tester` app

1. Make sure you have followed the Getting Started instructions [here](../../README.md) to install packages and build the entire repository.

2. Then go into `apps\win32` folder:

```
    cd apps\win32
```

3. Build the FluentUI Tester bundle:

```
    yarn bundle
```

4. Launch the FluentUI Tester app:

```
    yarn run-win32
```
5. You will see FluentUI Tester show up in a new window.

![ReactTest image debug menu location](./../../docs/pages/images/fluent_tester_radiogroup.png)

## Debug `FluentUI Tester` app with direct debugging

Note: we recommend using [Visual Studio Code](https://code.visualstudio.com/download) for direct debugging.

1. Follow the same step #1 as above.
2. Follow the same step #2 as above.

3. Build the FluentUI Tester bundle with dev option. This will ensure source map is included in the bundle.

```
    yarn bundle-dev
```

4. Launch the FluentUI Tester app:

```
    yarn run-win32
```

5. Inside ReactTest, open the debug option menu and select the checkbox `Use Direct Debugger`

![ReactTest image debug menu location](./../../docs/pages/images/fluent_tester_debug_menu.png)

6. In Visual Studio Code, open the debug pane and select `Debug Fabric Tester` option from the "Run And Debug" dropdown.

![ReactTest image debug menu location](./../../docs/pages/images/fluent_tester_vscode_debug.png)

7. At this time, VS Code will attach to the JS runtime and you can start debugging. For more information on debugging in VS Code, please see [Visual Studio Code documentation](https://code.visualstudio.com/docs/editor/debugging).

## Debug `FluentUI Tester` app with web debugging

1. Follow the same step #1 as above.
2. Follow the same step #2 as above.
3. Start the debug server:

```
    yarn start
```

4. Open Edge or Chrome and navigate to http://localhost:8081/debugger-ui

5. Open another command prompt and go into the same location `experiments\tester` and run:

```
    yarn run-win32-web
```
