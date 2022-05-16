# @fluentui-react-native/transforms

This package supplies transforms that help with refactoring FURN code. The transforms are passed into [jscodeshift](https://github.com/facebook/jscodeshift) to transform code.

## Usage

1. Install jscodeshift using the instructions [here](https://github.com/facebook/jscodeshift#install)
2. Run the transforms using the following command:

```cli
jscodeshift -t <path to transform file> --parser=tsx --extensions=tsx <path to file to be transformed>
```

For example

```cli
jscodeshift -t transforms/src/button-v0-to-v1.js --parser=tsx --extensions=tsx apps/fluent-tester/src/FluentTester/TestComponents/Button/deprecated
```
