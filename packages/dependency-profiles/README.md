# @fluentui-react-native/dependency-profiles

[![npm version](https://badge.fury.io/js/@fluentui-react-native%2Fdependency-profiles.svg)](https://badge.fury.io/js/@fluentui-react-native%2Fdependency-profiles)

`@fluentui-react-native/dependency-profiles` is a package that contains dependency profiles for FluentUI React Native. A dependency profile is a set of package@version mappings, usually tied to a single version of react-native. These profiles can be used by users of `@rnx-kit/align-deps` to manage FURN dependencies in their repo. To learn more about `@rnx-kit/align-deps`, visit https://microsoft.github.io/rnx-kit/docs/tools/align-deps.

## Usage

If you have an existing repo that uses FURN and you would like to stay up-to-date on the latest versions of FURN packages for a specific version of react-native, you can start by installing `@rnx-kit/align-deps`. Installation and usage instructions can be found here: https://microsoft.github.io/rnx-kit/docs/tools/align-deps.

Once `@rnx-kit/align-deps` is installed, you can add `@fluentui-react-native/dependency-profiles` as a dependency in your repo.

```
yarn add ccccccc --dev
```

or

```
npm add --save-dev @fluentui-react-native/dependency-profiles
```

Next, configure each of your onboarded React Native packages to use `@fluentui-react-native/dependency-profiles`:

```
 {
   "rnx-kit": {
     "alignDeps": {
+      "presets": [
+        "@fluentui-react-native/dependency-profiles"
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

## Maintenance

Since this package is intended to contain multiple profiles for different versions of react-native, we need to make sure we save the current profile when updating the FURN repo to a newer version of react-native. To do this, copy the current profile (in index.js) to a new file under the src folder named `furn-profile-X.Y.js` where X.Y is the current version of react-native (for example, `furn-profile-0.68.js`). Next, add this file to the list of profiles in update-profile.js after "[`${major}.${minor}`]: packages" (which lists the profile for the new version of react-native you're updating to).
