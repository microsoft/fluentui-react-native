# @fluentui-react-native/dependency-profiles

[![npm version](https://badge.fury.io/js/@fluentui-react-native%2Fdependency-profiles.svg)](https://badge.fury.io/js/@fluentui-react-native%2Fdependency-profiles)

`@fluentui-react-native/dependency-profiles` is a package that contains dependency profiles for FluentUI React Native. A dependency profile is a set of package@version mappings, usuallly tied to a single version of react-native. These profiles can be used by users of `@rnx-kit/align-deps` to manage FURN dependencies in their repo. To learn more about `@rnx-kit/align-deps`, visit https://microsoft.github.io/rnx-kit/docs/tools/align-deps.

## Usage

If you have an existing repo that uses FURN and you would like to stay up-to-date on the latest versions of FURN packages for a specific version of react-native, you can start by installing `@rnx-kit/align-deps`. Installation and usage instructions can be found here: https://microsoft.github.io/rnx-kit/docs/tools/align-deps.

Once `@rnx-kit/align-deps` is installed, you can add `@fluentui-react-native/dependency-profiles` as a dependency in your repo.

```
yarn add @fluentui-react-native/dependency-profiles --dev
```

or

```
npm add --save-dev @fluentui-react-native/dependency-profiles
```

Next, configure each of your onboarded React Native packages to use a profile from `@fluentui-react-native/dependency-profiles` for the react-native version you're using under "presets". You can read more about configurations here: https://microsoft.github.io/rnx-kit/docs/tools/align-deps#configure and presets here: https://microsoft.github.io/rnx-kit/docs/tools/align-deps#presets.

```
+ const furnProfiles = require('@fluentui-react-native/dependency-profiles');
+ const furnProfile = furnProfiles[0.68];

 .
 .
 .

 {
   "rnx-kit": {
     "alignDeps": {
+      "presets": [
+        "furnProfile"
+      ],
       "requirements": [
        "react-native@0.68"
       ],
       "capabilities": [
         "core-android",
         "core-ios",
         "core-macos",
         "core-windows",
         "react"
       ]
     }
   }
 }
```

Now, you can use the `@rnx-kit/align-deps` tool to keep your FURN dependencies up-to-date by updating `@fluentui-react-native/dependency-profiles` to newer versions and running `yarn rnx-align-deps --write`.

## Note for Package Maintainers

Since this package is intended to contain multiple profiles for different versions of react-native, we need to make sure we save the current profile when updating the FURN repo to a newer version of react-native. To do this, copy the current profile (in index.js) to a new file under the src folder named `furn-profile-X.Y.js` where X.Y is the current version of react-native (for example, `furn-profile-0.68.js`). Next, add this file to the list of profiles in update-profile.js after "[`${major}.${minor}`]: packages" (which lists the profile for the new version of react-native you're updating to).
