# Component generator

It's used to automate process of component creation.

## Setup

1. Run in your command prompt `npm i -g gulp-cli`
2. Run `npm i` inside the component-generator directory

## Build you component

1. Run `gulp add --new component-name`
2. Change your newly generated component.
3. When you're done, remove `"private": true` from the package.json
4. Add to the package.json after "typings":

```json
"onPublish": {
    "main": "lib-commonjs/index.js",
    "module": "lib/index.js"
  },
```

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
