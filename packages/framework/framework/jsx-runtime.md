# JSX Runtime for Slots

This module provides a modern JSX runtime implementation for React 17+ that automatically handles slot rendering without the need for the `withSlots` pragma.

## Features

- **Automatic slot resolution**: Slot functions are automatically detected and called directly
- **React 17+ compatibility**: Uses the new JSX transform introduced in React 17
- **TypeScript support**: Full TypeScript support with proper type inference
- **Gradual migration**: Can be used alongside existing `withSlots` pragma code

## Usage

### Option 1: Per-file usage (Recommended for gradual migration)

Add this comment at the top of your TypeScript/JSX files:

```tsx
/** @jsxImportSource @fluentui-react-native/use-slot */

import React from 'react';
import type { SlotFn } from '@fluentui-react-native/use-slot';

// Your slot components will automatically be handled
const MySlotComponent: SlotFn<{ title: string }> = ({ title }) => {
  return <div>{title}</div>;
};
MySlotComponent._canCompose = true;

export const MyComponent = () => {
  return (
    <div>
      <MySlotComponent title="Hello World" />
    </div>
  );
};
```

### Option 2: Project-wide configuration

Configure your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "@fluentui-react-native/use-slot"
  }
}
```

Or for Babel, add to your babel config:

```json
{
  "presets": [
    [
      "@babel/preset-react",
      {
        "runtime": "automatic",
        "importSource": "@fluentui-react-native/use-slot"
      }
    ]
  ]
}
```

## How it works

The JSX runtime automatically detects slot functions (components with `_canCompose: true`) and calls them directly instead of using `React.createElement`. This provides the same slot composition benefits as the `withSlots` pragma but with modern JSX syntax.

## Migration from withSlots

### Before (with withSlots pragma):

```tsx
/** @jsx withSlots */
import { withSlots } from '@fluentui-react-native/use-slot';

// ... component code
```

### After (with jsx-runtime):

```tsx
/** @jsxImportSource @fluentui-react-native/use-slot */

// ... same component code, no other changes needed
```

## Exports

This module provides the following exports for JSX runtime:

- `jsx`: JSX runtime function for single child elements
- `jsxs`: JSX runtime function for elements with static children
- `Fragment`: React Fragment component
- `JSXProps`: TypeScript interface for JSX properties

## Compatibility

- React 17+
- TypeScript 4.1+ (for JSX transform support)
- React Native 0.73+

## Note

The jsx-runtime functions are also exported from the main `@fluentui-react-native/use-slot` package, but for the JSX transform to work properly, you should use the `@jsxImportSource` directive or configure your build tools to use this package as the import source.
