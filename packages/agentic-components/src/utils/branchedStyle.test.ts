import type { ViewStyle } from 'react-native';

import { useFlexTokens } from '@fluentui-react-native/design';
import type { ThemeState } from '@fluentui-react-native/design';

import {
  getActiveState,
  getStateStyleFactory,
  getThemedStateStyleFactory,
  pickActiveStyle,
  styleDefinitionToBranchedStyles,
} from './branchedStyle';
import type { StyleDefinition } from './branchedStyle';

type RootState = 'disabled' | 'selected';
type BranchState = 'pressed' | 'hovered';

const rootStates = ['disabled', 'selected'] as const;
const branchStates = ['pressed', 'hovered'] as const;
const definition: StyleDefinition<ViewStyle, RootState, BranchState> = {
  borderWidth: 1,
  opacity: 1,
  disabled: {
    opacity: 0.4,
  },
  selected: {
    opacity: 0.8,
    hovered: {
      opacity: 0.7,
    },
  },
  pressed: {
    opacity: 0.6,
  },
  hovered: {
    borderWidth: 2,
  },
};

function createThemeState(): ThemeState {
  return {
    tokens: useFlexTokens(),
    highContrast: false,
    themeStyles: {},
  };
}

describe('branchedStyle', () => {
  it('selects the first truthy state in precedence order', () => {
    expect(getActiveState({ hovered: true, pressed: true }, branchStates)).toBe('pressed');
    expect(getActiveState(['selected', 'hovered'], rootStates)).toBe('selected');
    expect(getActiveState({ disabled: false, selected: true }, rootStates)).toBe('selected');
  });

  it('flattens base, root, branch, and combined styles with inheritance', () => {
    expect(styleDefinitionToBranchedStyles(definition, rootStates, branchStates)).toEqual({
      base: {
        borderWidth: 1,
        opacity: 1,
      },
      disabled: {
        borderWidth: 1,
        opacity: 0.4,
      },
      selected: {
        borderWidth: 1,
        opacity: 0.8,
      },
      pressed: {
        borderWidth: 1,
        opacity: 0.6,
      },
      hovered: {
        borderWidth: 2,
        opacity: 1,
      },
      'selected.hovered': {
        borderWidth: 1,
        opacity: 0.7,
      },
    });
  });

  it('selects combined, branch, root, and base styles in that order', () => {
    const styles = styleDefinitionToBranchedStyles(definition, rootStates, branchStates);

    expect(pickActiveStyle({ selected: true, hovered: true }, rootStates, branchStates, styles)).toEqual({
      borderWidth: 1,
      opacity: 0.7,
    });
    expect(pickActiveStyle({ selected: true, pressed: true }, rootStates, branchStates, styles)).toEqual({
      borderWidth: 1,
      opacity: 0.6,
    });
    expect(pickActiveStyle({ selected: true }, rootStates, branchStates, styles)).toEqual({
      borderWidth: 1,
      opacity: 0.8,
    });
    expect(pickActiveStyle({}, rootStates, branchStates, styles)).toEqual({
      borderWidth: 1,
      opacity: 1,
    });
  });

  it('supports definitions with root states and no branch states', () => {
    const getStyle = getStateStyleFactory<ViewStyle, 'disabled'>(
      {
        opacity: 1,
        disabled: {
          opacity: 0.4,
        },
      },
      ['disabled'],
    );

    expect(getStyle({ disabled: true })).toEqual({ opacity: 0.4 });
    expect(getStyle({})).toEqual({ opacity: 1 });
  });

  it('resolves themed definitions once per ThemeState', () => {
    const firstTheme = createThemeState();
    const secondTheme = createThemeState();
    const factory = jest.fn(() => definition);
    const getStyle = getThemedStateStyleFactory('test.style', factory, rootStates, branchStates);

    expect(getStyle(firstTheme, { selected: true }).opacity).toBe(0.8);
    expect(getStyle(firstTheme, { hovered: true }).borderWidth).toBe(2);
    expect(factory).toHaveBeenCalledTimes(1);

    expect(getStyle(secondTheme, { pressed: true }).opacity).toBe(0.6);
    expect(factory).toHaveBeenCalledTimes(2);
  });
});
