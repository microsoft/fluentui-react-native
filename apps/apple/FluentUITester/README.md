# FluentUI React Native

FluentUI React Native is a javascript component library that provides developers with controls that are part of the [Fluent Design System](https://www.microsoft.com/design/fluent/). These controls are built on [React Native](https://reactnative.dev/) and fully customizable.

## Contributing

This project welcomes contributions and suggestions. Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.opensource.microsoft.com.

When you submit a pull request, a CLA bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., status check, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

### Developing in the repo

Fluent UI Apple requires all [pull requests](https://help.github.com/en/github/collaborating-with-issues-and-pull-requests/about-pull-requests) to come from forks of the repository. Please see [Fork a Repo - GitHub Help](https://help.github.com/en/github/getting-started-with-github/fork-a-repo) for more details on how to set up a fork of microsoft/fluentui-react-native, keep it up-to-date, and submit pull requests back to this repository.

FluentUI-React-Native takes on dependencies on [React-Native](https://github.com/facebook/react-native) for iOS, [React-Native](https://github.com/microsoft/react-native) for macOS, and [FluentUI-Apple](https://github.com/microsoft/fluentui-apple).

After you've create a new fork to work in and installed the dependencies with yarn, you must perform some Apple specific steps before building.

1. `cd apps/apple/FluentUITester`
1. `yarn`
1. `cd ios; pod install; cd ..`
1. `cd macos; pod install; cd ..`

Now you have created your iOS and macOS workspaces. You can launch either workspace, run the local packaging server using the command below, and build/run your project.
`yarn run start:macos`
