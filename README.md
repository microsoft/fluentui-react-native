# FluentUI React Native

[![npm version](https://badge.fury.io/js/%40fluentui%2Freact-native.svg)](https://badge.fury.io/js/%40fluentui%2Freact-native) [![Build Status](https://dev.azure.com/ms/ui-fabric-react-native/_apis/build/status/PR?branchName=main)](https://dev.azure.com/ms/ui-fabric-react-native/_build/latest?definitionId=226&branchName=main) [![Build Status](https://dev.azure.com/ms/ui-fabric-react-native/_apis/build/status/Publish?branchName=main)](https://dev.azure.com/ms/ui-fabric-react-native/_build/latest?definitionId=229&branchName=main)

FluentUI React Native is a javascript component library that provides developers with controls that are part of the [Fluent Design System](https://www.microsoft.com/design/fluent/). These controls are built on [React Native](https://reactnative.dev/) and fully customizable.

FluentUI React Native is still in the alpha stages of development for both the components and the repo. We encourage anyone who is interested in getting an early glimpse of our plans to download and use our components, but please note that you may hit bumps along the way. Please leave us feedback or file issues if you run into bumps, and we will continue to improve the quality of the repo.

Development status on each platform:
| Windows | macOS | iOS | Android |
|---------------------|---------------------|-------------|-------------|
| Alpha (in progress) | Alpha (in progress) | Alpha (in progress) | Alpha (in progress) |

## Getting Started

If you have an existing React Native project, it's easy to begin using FluentUI React Native. If you need to setup a new React Native project, please see the [React Native Windows Getting Started documentation](https://microsoft.github.io/react-native-windows/docs/getting-started).

### Prerequisites

- [Standard React Native dependencies](https://microsoft.github.io/react-native-windows/docs/rnw-dependencies#manual-setup)
- [Node.js](https://nodejs.org/en/download/package-manager)
- [Setting up your React Native Development Environment](https://reactnative.dev/docs/environment-setup)

### Create New React Native project (if needed)

1. Follow the instructions on the [React Native Windows Getting Started documentation](https://microsoft.github.io/react-native-windows/docs/getting-started) to create a React Native project.

2. Navigate to the root folder of your project, and use npm to install the package:

```
 npm i @fluentui/react-native
```

3. After successful installation, you can test the package by importing components at the top of your app's entry file, e.g. `App.js`:

```jsx
import { Checkbox } from '@fluentui/react-native';
```

4. After importing the @fluentui/react-native package, you can use components such as `Text` and `Checkbox` in your React.JSX.

```jsx
// In App.js in a new project
import React from 'react';
import { View, Text } from 'react-native';
import { CheckboxV1 as Checkbox } from '@fluentui/react-native';
function HelloWorldApp() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text>Hello, world!</Text>
      <Checkbox label="Hello World Checkbox" />
    </View>
  );
}
export default HelloWorldApp;
```

If you run into an error that says `pragma and pragmaFrag cannot be set when runtime is automatic`, you can try [switching to classic runtime](https://babeljs.io/docs/en/babel-preset-react/#both-runtimes).

## Documentation

### Components and Controls

Our component documentation can be found in SPEC.md files for each component. The current list can be found in our [Wiki's sidebar](https://github.com/microsoft/fluentui-react-native/wiki). They will be uploaded to a website at a future time.

#### Expanding Component documentation

Our SPEC.md files should reflect the current state of controls that have established the _v1_ set of properties on any one platform.

Since the FluentUI React Native controls are cross-platform, but represented by a single page, it's important to distinguish platform differences and limitations. Examples include:

- If the component is not available on all supported platforms.
- If the component has properties not available on all supported platforms.
- If the component has limited support for a given property on any supported platforms.
- If the component has distinguishable behavior on a supported platform that must be minded while used.

### Theming framework

Documentation for Theming can be found in our docs file, or for more in depth documentation, along side the implementation.

- [Theming Overview](./docs/pages/Theming/Basics.md)
- [StyleSheets](./docs/pages/Theming/ThemedStylesheet.md)
- [Customizing Theme Settings](./docs/pages/Theming/CustomTheme.md)
- [Theme Reference](./packages/framework/theme/README.md)
- [Tokens](./packages/framework/use-tokens/README.md)
- [Slots](./packages/framework/use-slots/README.md)
- [Customize and Compose](./packages/framework/composition/README.md)

## Developing in the repo

### Yarn + Lage

This repo is set up as a monorepo using Yarn workspaces. To install yarn, please follow instructions in the [Yarn documentation](https://classic.yarnpkg.com/en/docs/install/).

For running tasks the repo has switched to using [Lage](https://github.com/microsoft/lage) for task running. The primary tasks that can be executed at the root are:

- `yarn build` - does the typescript build for all packages in the repository
- `yarn test` - will build, lint, and run any applicable tests on all packages in the repo
- `yarn bundle` - will bundle all packages in the repo
- `yarn buildci` - will build, lint, run tests, and bundle everything in the repo

Note that Lage uses caching to avoid redundant steps and has very minimal output. To avoid caching add `--no-cache` as a command line argument. Similarly adding `--verbose` will give more detailed output.

### Setup your development environment

To start developing in the repository you can:

1. `git clone https://github.com/microsoft/fluentui-react-native.git`
1. `cd fluentui-react-native`
1. `yarn`
1. `yarn build`

After a successful yarn build, you can explore FluentUI Tester, our demo application to play with each of the controls. To run FluentUI Tester, please follow instructions in the [FluentUI Tester readme](./apps/fluent-tester/README.md).

Note: If your repo is located on either your Desktop or Documents folder, you may encounter the error: "Watchman error... Operation not permitted". Clone it in a different directory to avoid Watchman permission issues.

### Prettier

This repo is set up to run [Prettier](https://prettier.io/). To run Prettier in fix mode on the repo, run `yarn prettier-fix` at the root of the Repo.

If you are using [Visual Studio Code as your editor, you can configure it to run Prettier on save. Prettier is a recommended extension for the repo. You can configure it to run by:

1. Installing the Prettier extension for VSCode
2. Going to Settings > Text Editor > Formatting > Check Format On Save

## Contributing

Please visit our [contribution guide](./CONTRIBUTING.md) for more information on contributing to this repo.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.
