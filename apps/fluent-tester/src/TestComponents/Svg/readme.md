# Using SVGs in FluentUI React Native

## Setup

### Dependencies

First you'll need to add the [react-native-svg](https://github.com/react-native-svg/react-native-svg) package.

`yarn add react-native-svg`

If you want to only use remotely hosted svgs via uri or you are supplying the svg as an xml string that is the only dependency you need to install.

Additional dependencies will depend on which bundler your project uses.

### Bundler configuration - **Metro**

If bundling svgs and reading svg files directly from your bundle is also a requirement then you'll have to add [react-native-svg-transformer](https://github.com/kristerkari/react-native-svg-transformer) as a dev dependency as well.

`yarn add -D react-native-svg-transformer`

react-native-svg-transformer is a babel plugin transformer that takes your svg files and converts them into react-native calls at bundle time so it doesn't have to be done at run-time.

In your metro.config.js you'll need to replace the default configuration or merge your custom configuration with this:

```
const { getDefaultConfig } = require('metro-config');

module.exports = (async () => {
  const {
    resolver: { sourceExts, assetExts },
  } = await getDefaultConfig();
  return {
    transformer: {
      babelTransformerPath: require.resolve('react-native-svg-transformer'),
    },
    resolver: {
      assetExts: assetExts.filter(ext => ext !== 'svg'),
      sourceExts: [...sourceExts, 'svg'],
    },
  };
})();
```

### Bundler configuration - **Haul**

If bundling svgs and reading svg files directly from your bundle is also a requirement then you'll have to add [react-native-svg-loader](https://github.com/unimonkiez/react-native-svg-loader) as a dev dependency as well.

`yarn add -D react-native-svg-loader`

[react-native-svg-loader](https://github.com/unimonkiez/react-native-svg-loader) is a webpack loader that takes your svg files and converts them into react-native calls at bundle time so it doesn't have to be done at run-time.

You'll have to add the following rule to your haul configuration for the svg extension to be processed by this loader. Please see the official [Haul configuration](https://callstack.github.io/haul/docs/configuration.html) docs for specific details.

```
test: /\.svg$/,
use: [
  {
    loader: 'react-native-svg-loader',
  },
]
```

### Typescript configuration for the .svg file extension

To allow Typescript to import files with the .svg extension, add a declarations.d.ts file in a @types/<pkg name> directory under the source root of your project with the following:

```
declare module "*.svg" {
  import { SvgProps } from "react-native-svg";
  const content: React.FC<SvgProps>;
  export default content;
}
```

Now you should be able to do things like

```
import TestSvg from './assets/test.svg';
```

## Using SVG elements

We have implemented native support for [react-native-svg](https://github.com/react-native-svg/react-native-svg) so most of the documentation there should apply.

There is support for displaying svgs from these kinds of sources:

- Remotely hosted and retrieved via URI
- .svg files bundled in your js bundle
- Provided as xml in a string
- Constructed inline using svg primitives within a Svg block

There are examples of usage of each type in apps\fluent-tester\src\FluentTester\TestComponents\Svg\SvgTest.tsx in the [fluentui-react-native](https://github.com/microsoft/fluentui-react-native) repo.

Here are a couple of the simplest ones:

### Bundled svg

```
import TestSvg from './Assets/accessible-icon-brands.svg';
const bundledSvg: React.FunctionComponent = () => {
  return (
    <TestSvg width={200} height={200} color="red" />
  );
}
```

### Remote svg via uri

```
const remoteSvg: React.FunctionComponent = () => {
  return (
    <View>
      <SvgCssUri
        style={styles.svg}
        viewBox="0 0 200 200"
        width="100"
        height="100"
        uri="https://upload.wikimedia.org/wikipedia/commons/8/84/Example.svg"
      />
      <SvgCssUri
        x="50"
        y="50"
        viewBox="0 0 500 500"
        style={styles.svg}
        width="100"
        height="100"
        uri="http://10.122.222.112:8080/accessible-icon-brands.svg"
      />
    </View>
  );
}
```
