# Authoring a Fluent Native Control

Building cross platform JS experiences within Office and other SDX Host apps using the Fluent Native Control library.

## Contents

1. [Choosing a Component Builder Framework](#choosing-a-component-builder-framework)
   - [Compose vs Composable](#compose-vs-composable)
2. [Building a Component](#building-a-component)
   - [Using the Compose Framework](#using-the-compose-framework)
     - [Types](#types)
     - [Settings](#settings)
     - [Putting it all together](#putting-it-all-together)

   - [Using the Composable Framework](#using-the-composable-framework)

3. [Jest Snapshot Testing for FluentUI](#jest-snapshot-testing-for-fluentui)
   - [Writing Snapshot Tests](#writing-snapshot-tests)
   - [Updating Snapshot Tests](#updating-snapshot-tests)

## Choosing a Component Builder Framework

### Compose vs Composable

You have to choose an appropriate framework package to build a component. We have two packages: [foundation-compose](../deprecated/foundation-compose/README.md) and [foundation-composable](../deprecated/foundation-composable/README.md).

**Compose**'s primary purpose is the injection of our idea of what the useStyling implementation should be into the composable pattern. So, any component that wants to utilize our Theming and Styling system should use the Compose framework.

On the other hand, **Composable** is more of a base-class component that does not depend on which theming or styling system is used, but instead provides a mechanism (useStyling) to inject one. Composable is useful for components like FocusTrapZone that has no actual visuals and is just a direct render of a purely behavioral native component. It allows for "old school" functional components to be described in their individual parts so that they can be recomposed without violating the rule of hooks and allows for eliding unnecessary vdom nodes.

Simply put,

**Compose** - Injects our theming and styling system

**Composable** - Purely behavioral / structural, but provides extensibility point for a styling system to be provided, allows for recomposition without overhead.

## Building a Component

### Using the Compose Framework

Let's look at how to write a complex component using the compose framework. This guideline will walk through how the [Button](./Button/src/deprecated/) control was built.

#### Types

Each control dedicates file using the format [Button.types.ts](./Button/src/deprecated/Button.types.ts) to define the component's tokens, props, and slots.

Button is essentially a composition of View which is a layout element, a Text element, and an Icon element. The Button's slots reflect this composition. The root slot is a View which will wrap another View, represented as a stack slot which will contain the image and text content.

```javascript
export interface IButtonSlotProps {
  root: React.PropsWithRef<IViewWin32Props>;
  stack: ViewProps;
  icon: ImageProps;
  content: ITextProps;
}
```

Button inherits a large part of its styling tokens from those defined for Text, View, and Image. Tokens that are needed for Button specifically are defined in the IButtonTokens interface.

```javascript
export interface IButtonTokens extends FontTokens, IForegroundColorTokens, IBackgroundColorTokens, IBorderTokens
{
   ...
}
```

Props that do not map to a style property are defined as part of Button props. Button props extends Pressable's props with the except of **onPress**, since Button will have an onClick prop intead.

```javascipt
export interface IButtonProps extends Omit<IPressableProps, 'onPress'> {
  ...
  onClick?: () => void;
}
```

IButtonState will keep track of Button's state values that may change with events and interactions. It will extend IPressableStates for states related to press events.

```javascipt
export interface IButtonInfo extends IPressableState
{
   ...
}
export interface IButtonState
{
   info: IButtonInfo;
}
```

Button's render data, which will be passed to the render function, is defined with own its slots and state interface.

```javascript
export type IButtonRenderData = IRenderData<IButtonSlotProps, IButtonState>;
```

Finally, IButtonType interface is constructed and exported with its props, tokens, slotProps, and state types defined.

```javascript
export interface IButtonType {
  props: IButtonProps;
  tokens: IButtonTokens;
  slotProps: IButtonSlotProps;
  state: IButtonState;
}
```

#### Settings

Settings are collections of props and styles for the parts of a component. They allow for inheritance and the ability to specify overrides for certain states.

[Button.settings](./Button/src/deprecated/Button.settings.ts) defines settings for each of its slots as wells as its tokens and their overrides for each state. How precedence and overrides work are explained in the [Theme Settings](../deprecated/foundation-settings/README.md#_overrides-and-_precedence) page.

Button's root slot has accessibility props that need default values to fall back to when they aren't specified by its users. These default values are set in settings as well.

```javascript
export const settings: IComposeSettings<IButtonType> = [
  {
    tokens: {
       ...
    },
    root: {
      accessible: true,
      focusable: true,
      accessibilityRole: 'button',
    } as ViewProps,
    content: {},
    icon: {},
    stack: {
      style: {
        ...
      }
    },
    _precedence: ['hovered', 'focused', 'pressed', 'disabled'],
    _overrides: {
      disabled: {
        tokens: {
          backgroundColor: 'buttonBackgroundDisabled',
          color: 'buttonTextDisabled',
          borderColor: 'buttonBorderDisabled'
        }
      },
      hovered: {
        tokens: {
          backgroundColor: 'buttonBackgroundHovered',
          color: 'buttonTextHovered',
          borderColor: 'buttonBorderHovered'
        }
      },
      pressed: {
        tokens: {
          backgroundColor: 'buttonBackgroundPressed',
          color: 'buttonTextPressed',
          borderColor: 'buttonBorderPressed'
        }
      },
      focused: {
        tokens: {
          borderColor: 'buttonBorderFocused',
          backgroundColor: 'buttonBackgroundHovered',
          color: 'buttonTextHovered'
        }
      }
    }
  },
  buttonName
];
```

#### Putting it all together

Lastly, Button imports and uses the compose framework to build the final function component. A compose component will have the following parameters. Each parameter is explained in detail in the [Parameters](../deprecated/foundation-composable/README.md#parameters) section under foundation-composable.

- displayName
- usePrepareProps
- settings
- render
- slots
- styles

An important thing to note is that the compose framework will call useStyling to grab the styling information in usePrepareProps. On that note, it's useful to look at what useStyling does:

1. It is aware of our Theme object, because it looks at the ThemeContext.
2. It checks the theme's cache for resolved component slot props before doing any work.
3. If none are found, it gets your settings object/function, processes it in response to the theme and applies overrides that you specify in your state.
4. It resolves your tokens.

```javascript
export const Button = compose<IButtonType>({
  displayName: buttonName,
  usePrepareProps: () => {
     ...
  },
  settings,
  render: () => {
    ...
  },
  slots: {
    ...
  },
  styles: {
    ...
  }
});
```

### Using the Composable Framework

How to write a component using the composable framework is documented in the following locations: [Getting Started - Writing a simple component](../deprecated/foundation-composable/docs/GuideSimple.md) and [Getting Started - Writing a Complex Component](../deprecated/foundation-composable/docs/GuideHOC.md).

## Jest Snapshot Testing for FluentUI

Every component should have one (or more) snapshot tests to ensure that the data that gets sent across the JS bridge only changes intentionally. If the test does not pass, you may have some unexpected changes on the component that need to be fixed, or your made changes to the component and the snapshot tests need to be updated. [Snapshot Testing](https://jestjs.io/docs/en/snapshot-testing) page on Jestjs doc runs through an example with a React component pretty thoroughly.

### Writing Snapshot Tests

- Create test file under the \_\_tests\_\_ folder in your component's root directory.

  packages/components/Component/src/\_\_tests\_\_/Component.test.tsx

- Import [react-test-renderer](https://reactjs.org/docs/test-renderer.html)

  ```javascript
  import * as renderer from 'react-test-renderer';
  ```

- Create a test that renders your component. Consider adding a snapshot(s) that exercise:
  - Default rendering behavior
  - Any interesting variants (e.g. horizonal vs. vertical separators, primary buttons)
  - All props
  - All tokens

  ex) Button component snapshot test with default props

  ```javascript
  it('Button default', () => {
    const tree = renderer.create(<Button content="Default Button" />).toJSON();
    expect(tree).toMatchSnapshot();
  });
  ```

- Rebuilding your component directory should run the snapshot tests for you. When you run the tests for the first time. a new snapshot file will be created inside a \_\_snapshots\_\_ directory. If your test file was named Component.test.tsx, the snapshot file will be named Component.test.tsx.snap.

- You should commit your snapshot files with your code.

### Updating Snapshot Tests

- When you make changes to your component, you will need to update your snapshot tests. Since Jest will match the existing snapshots against the rendered updated component, simply re-running the test will give you failed test results.

- Running the following command in your component root directory will update the snapshots to match the updates you made on your component

      yarn update-snapshots
