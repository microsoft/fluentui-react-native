# @fluentui-react-native/transforms

This package supplies transforms that help with refactoring FURN code. The transforms are passed into [jscodeshift](https://github.com/facebook/jscodeshift) to transform code.

## Usage

1. Install jscodeshift using the instructions [here](https://github.com/facebook/jscodeshift#install)
2. Run the transforms using the following command:

```cli
npx -p @fluentui-react-native/codemods transform -t <transform_name> --path <path_to_files_to_transform>
```

For example

```cli
npx -p @fluentui-react-native/codemods transform -t button-v0-to-v1 --path .\apps\fluent-tester\src\TestComponents\Button\deprecated\ButtonFocusTest.tsx
```

## Tests

Test files are named in the format `<transform>-test.ts`. The "defineTest" from [jscodeshift](https://github.com/facebook/jscodeshift) is used to run the test.
Each test has an input and output file under the `__testfixtures__` folder. The input is an example of code before the transform is run, and the output is what the code should look like after running the transform.
Using this, we can ensure that the codemod works the way we intend to.

One caveat is that the codemod doesn't quite respect Prettier settings and doesn't seem to correctly format the output. So the output files are ignored by Prettier.
