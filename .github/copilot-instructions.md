# GitHub Copilot Instructions for FluentUI React Native

## Project Overview

This is the FluentUI React Native repository, a cross-platform component library that provides React Native components following the Fluent Design System. The library supports Windows (Win32), iOS, Android, and macOS platforms.

## Code Style and Conventions

### TypeScript Configuration

- Use the modern JSX transform: `"jsx": "react-jsx"`
- Module resolution: `"moduleResolution": "node16"`
- For new components using slots, use `/** @jsxImportSource @fluentui-react-native/use-slot */` instead of the legacy `/** @jsx withSlots */` pragma

### Component Architecture

- Components use a slot-based architecture with the `compose` function from `@fluentui-react-native/framework`
- Use `useSlots` hook for rendering slot-based components
- Prefer the automatic JSX runtime over the classic runtime for new code
- Component files should be organized with:
  - Main component implementation (e.g., `Button.tsx`)
  - Platform-specific implementations (e.g., `Button.android.tsx`, `Button.ios.tsx`)
  - Styling definitions (e.g., `Button.styling.ts`)
  - Type definitions (e.g., `Button.types.ts`)
  - Custom hooks (e.g., `useButton.ts`)

### Package Structure

```
packages/
├── components/          # UI Components (Button, Text, etc.)
├── framework/           # Core framework packages
├── theming/            # Theme packages
├── utils/              # Utility packages
└── experimental/       # Experimental features
```

### Import Conventions

- Import React as: `import * as React from 'react';`
- Use absolute imports from `@fluentui-react-native/` packages
- Platform-specific imports should use conditional requires when needed
- Remove unused imports, especially `withSlots` when migrating to JSX import source

### Component Development Guidelines

#### For Slot-Based Components:

```tsx
/** @jsxImportSource @fluentui-react-native/use-slot */
import * as React from 'react';
import { compose } from '@fluentui-react-native/framework';

export const MyComponent = compose<MyComponentType>({
  displayName: 'MyComponent',
  slots: {
    root: View,
    content: Text,
  },
  useRender: (userProps, useSlots) => {
    // Component logic here
    const Slots = useSlots(userProps);
    return (final, ...children) => (
      <Slots.root {...final}>
        <Slots.content>{children}</Slots.content>
      </Slots.root>
    );
  },
});
```

#### For Legacy Components:

- When migrating from `@jsx withSlots`, remove both the pragma and the `withSlots` import
- Replace with `@jsxImportSource @fluentui-react-native/use-slot`
- Keep the same component structure but remove explicit JSX factory references

### Testing

- Test files should be in `__tests__` directories or co-located with `.test.tsx` suffix
- Use Jest for unit testing
- Snapshot tests for component rendering
- E2E tests are in the `apps/E2E` directory

### Platform-Specific Code

- Use `Platform.OS` checks for platform-specific logic
- Create separate files for platform implementations when needed:
  - `.android.tsx` for Android-specific code
  - `.ios.tsx` for iOS-specific code
  - `.win32.tsx` for Windows-specific code
  - `.mobile.tsx` for shared mobile (iOS/Android) code

### Dependencies

- Dependencies are managed by `@rnx-kit/align-deps`
- Use `yarn rnx-align-deps --set-version` for React Native upgrades
- Follow the dependency alignment rules defined in package.json files

### Build System

- Uses Lage for build orchestration
- Build scripts: `yarn build`, `yarn test`, `yarn lint`
- Bundle generation for apps: `yarn bundle` or `yarn bundle-dev`

### Styling

- Use the theming system from `@fluentui-react-native/framework`
- Define styling in separate `.styling.ts` files
- Use design tokens from `@fluentui-react-native/theme-tokens`
- Follow the Fluent Design System guidelines

### Common Patterns to Follow

1. **Component Exports**: Always export the main component as default and named export
2. **Props Interface**: Define clear TypeScript interfaces for component props
3. **Accessibility**: Include proper accessibility props and labels
4. **Error Handling**: Use proper error boundaries and validation
5. **Performance**: Memoize expensive operations and use React.memo when appropriate

### Code Review Guidelines

- Ensure new components follow the slot-based architecture
- Verify platform compatibility (test on target platforms)
- Check accessibility compliance
- Validate TypeScript types are properly defined
- Ensure proper test coverage

### Migration Notes

- When updating existing components, prefer gradual migration to new JSX transform
- Maintain backward compatibility when possible
- Update documentation when changing APIs
- Consider cross-platform implications for all changes

## Development Workflow

1. **Setup**: Run `yarn` to install dependencies
2. **Build**: Run `yarn build` to build all packages
3. **Test**: Use the FluentUI Tester app in `apps/win32` for component testing
4. **Debug**: Use VS Code with the "Debug Fabric Tester" configuration

## Key Files and Directories

- `apps/win32/` - Windows test application
- `packages/components/` - Core UI components
- `packages/framework/` - Framework and utilities
- `scripts/` - Build scripts and configurations
- `change/` - Change files for versioning
