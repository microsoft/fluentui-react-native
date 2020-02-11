`RNTester` is the test app that we use to test our FluentUI components during development.

## Launch `RNTester` app

1. After you've cloned the repository for the first time, follow the instructions [here](../../README.md) to install npm packages and build the entire repository.

2. Then go into `experiments\react-native-uifabric` folder:

```
    cd experiments\react-native-uifabric
```

3. Build the RNTester bundle:

```
    yarn build:tester
```

4. Launch the RNTester app:

```
    yarn run-win32
```

## Debug `RNTester` app

1. Follow the same step #1 as above.
2. Follow the same step #2 as above.
3. Start the debug server:

```
    yarn start:tester
```

4. Open Chrome and navigate to http://localhost:8081/debugger-ui

5. Open another command propmpt and go into the same location `experiment\react-native-uifabric` and run:

```
    yarn run-win32-web
```
