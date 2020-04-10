# Hello World Fluent

Now that you have the FluentUI React Native package installed, we will add components from the library to a new React Native project.

```
// In App.js in a new project

import React from 'react';
import { View, Text } from 'react-native';
import { Checkbox } from '@fluentui/react-native';

function HelloWorldApp() {
  return (
    <View
      style={{  }}
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
      }}>
      <Text>Hello, world!</Text>
      <Checkbox label="Hello World Checkbox"/>
    </View>
  )
}
export default HelloWorldApp;
```