# Running the FluentUI Tester on Windows

`FluentUI Tester` is the test app that we use to test our FluentUI components during development. It uses the [react-native-test app](https://github.com/microsoft/react-native-test-app) under the covers, and loads the fluent-tester bundle.

## Prerequisites

- [Node.js](https://nodejs.org/en/download/)
  - You can quickly see if Node.js is installed by running "node -v" in a command prompt. If it's installed, you will see the version number. If not, it will not recognize the command.
- [React Native Windows Development Dependencies](https://microsoft.github.io/react-native-windows/docs/rnw-dependencies)
  - **NOTE:** Please make sure you grab all of the items listed there and the appropriate versions.
  - You can check or install these dependencies by running the command mentioned in the link above in an elevated PowerShell window.
  - If you're installing or verifying Visual Studio 2019 dependencies manually, you can check your tool options under Tools > Get Tools and Features...
- [Azure Credentials Plugin for NuGet](https://github.com/microsoft/artifacts-credprovider#installation-on-windows)
  - We're currently on an expermental version of react-native-windows which is being published to a private NPM feed hosted on Azure DevOps.

## Running the App

1. Run `yarn` from the root of the repo
2. From this directory, run `yarn install-windows-test-app`
3. From this directory, simply `yarn windows`

## Debugging

You can debug native code in Visual Studio. To debug javascript code, you can either use standard web debugging, or you can use [React Native Tools](https://marketplace.visualstudio.com/items?itemName=msjsdiag.vscode-react-native) to debug directly in VS Code. The steps are as follows:

1. Launch your test app + packager as you normally would
2. Go the debug menu in VS Code and run the "Attach to Packager (Windows)" configuration
3. Open the developer menu in your test app, and click debug
4. You now should be able to set breakpoints and step through your code directly in VS Code.

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

## Troubleshooting

### EPERM restoring NuGet packages

If you see an error like the following:

```
- Restoring NuGet packages
× Failed to restore the NuGet packages: Error: EPERM: operation not permitted, unlink C:\Users\adrum\AppData\Local\Temp\nuget.4.9.2.exe'
```

Double check that you have correctly installed the Azure Credentials Plugin for NuGet mentioned in the Prerequisites above.
