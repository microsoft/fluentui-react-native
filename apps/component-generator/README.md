# Component generator

It's used to automate process of component creation.

## Setup

1. Run in your command prompt `npm i -g gulp-cli`.
   - May need to run this with `sudo` if you are on a mac
2. Rename package-no-publish.json to package.json (The package was published, though it's private. This is temporary fix).
3. Run `yarn` from `fluentui-react-native` folder.

## Build your component

0. Go to `fluentui-react-native\apps\component-generator`.
1. Run `gulp add --new component-name`. This should be run from apps/component-generator, not the root.
   - `component-name` should be all lowercase.
2. Change your newly generated component.
3. Check dependencies in componentName's package.json (may be out of date), and remove `"private": true` from the package.json
4. Delete package-lock.json in root dir (see todo item 9 below)
5. Delete dependencies: {"gulp": "^4.0.2", "gulp-rename": "^2.0.0”} in root dir’s package.json
6. Add "@fluentui-react-native/componentName”: "0.1.0", to apps/fluent-tester/package.json (make sure the version matches the version in ComponentName/package.json)

## TODO:

1. Write unit tests
2. Add platform as an option. Will need to update templates.
3. Framework method can be also as an option.
4. Validate name of component. Add warning if it's incorrect.
5. Change component-description
6. Add tasks for bundle and run.
7. Add warning if component exists and message "Do you want to replace it?".
   Currently it replaces the component.
8. Improve replacement functionality.
9. Support compressible-based components
10. Add option to add component to the `experimental` folder instead of the `components` folder
11. Think about not using gulp. There's good alternative: [yeoman](https://yeoman.io/)
