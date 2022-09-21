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
jscodeshift -t transforms/src/button-v0-to-v1.ts --parser=tsx --extensions=tsx apps/fluent-tester/src/TestComponents/Button/deprecated
```

## Tests

Test files are named in the format `<transform>-test.ts`. The "defineTest" from [jscodeshift](https://github.com/facebook/jscodeshift) is used to run the test.
Each test has an input and output file under the `__testfixtures__` folder. The input is an example of code before the transform is run, and the output is what the code should look like after running the transform.
Using this, we can ensure that the codemod works the way we intend to.

One caveat is that the codemod doesn't quite respect Prettier settings and doesn't seem to correctly format the output. So the output files are ignored by Prettier.
