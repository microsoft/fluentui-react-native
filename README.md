# FluentUI React Native

FluentUI React Native is a javascript component library that provides developers with controls that are part of the Fluent Design Language. These controls are built on React Native and fully customizable.

## Getting Started

### Prerequisites: Yarn + Lerna

This repo is set up as a monorepo using Lerna + Yarn workspaces. The yarn commands will trigger the lerna commands which will execute yarn commands in each package. To install yarn, please follow instructions in the [Yarn documentation](https://classic.yarnpkg.com/en/docs/install/).

### Setup your development environment

To start developing in the repository you can:

1. `git clone https://github.com/microsoft/fluentui-react-native.git`
1. `cd fluentui-react-native`
1. `yarn`
1. `yarn build`

After a successful yarn build, you can explore FluentUI Tester, our demo application to play with each of the controls. To run FluentUI Tester, please follow instructions in the [FluentUI Tester readme](https://github.com/microsoft/fluentui-react-native/blob/master/experiments/tester/README.md).

### Beachball
This repo manages semantic versioning and publishing using [Beachball](https://github.com/microsoft/beachball). When contributing, make sure to run the following before making a pull request
1. `yarn change` will take you through a command line wizard to generate change files
2. Make sure to commit and push the newly generated change file

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
