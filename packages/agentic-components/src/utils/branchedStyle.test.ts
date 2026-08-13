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

const stateLevels = [
  ['disabled', 'selected'],
  ['pressed', 'hovered'],
] as const;
const definition: StyleDefinition<ViewStyle, typeof stateLevels> = {
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
    expect(getActiveState({ hovered: true, pressed: true }, stateLevels[1])).toBe('pressed');
    expect(getActiveState(['selected', 'hovered'], stateLevels[0])).toBe('selected');
    expect(getActiveState({ disabled: false, selected: true }, stateLevels[0])).toBe('selected');
  });

  it('flattens base, root, branch, and combined styles with inheritance', () => {
    expect(styleDefinitionToBranchedStyles(definition, stateLevels)).toEqual({
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
    const styles = styleDefinitionToBranchedStyles(definition, stateLevels);

    expect(pickActiveStyle({ selected: true, hovered: true }, stateLevels, styles)).toEqual({
      borderWidth: 1,
      opacity: 0.7,
    });
    expect(pickActiveStyle({ selected: true, pressed: true }, stateLevels, styles)).toEqual({
      borderWidth: 1,
      opacity: 0.6,
    });
    expect(pickActiveStyle({ selected: true }, stateLevels, styles)).toEqual({
      borderWidth: 1,
      opacity: 0.8,
    });
    expect(pickActiveStyle({}, stateLevels, styles)).toEqual({
      borderWidth: 1,
      opacity: 1,
    });
  });

  it('supports definitions with one state level', () => {
    const levels = [['disabled']] as const;
    const getStyle = getStateStyleFactory<ViewStyle, typeof levels>(
      {
        opacity: 1,
        disabled: {
          opacity: 0.4,
        },
      },
      levels,
    );

    expect(getStyle({ disabled: true })).toEqual({ opacity: 0.4 });
    expect(getStyle({})).toEqual({ opacity: 1 });
  });

  it('supports three-level definitions and prefers deeper fallback combinations', () => {
    const levels = [['selected'], ['pressed', 'hovered'], ['highContrast']] as const;
    const threeLevelDefinition: StyleDefinition<ViewStyle, typeof levels> = {
      borderWidth: 1,
      opacity: 1,
      selected: {
        opacity: 0.8,
        pressed: {
          opacity: 0.7,
          highContrast: {
            borderWidth: 3,
          },
        },
        highContrast: {
          opacity: 0.75,
        },
      },
      pressed: {
        opacity: 0.6,
        highContrast: {
          opacity: 0.55,
        },
      },
      highContrast: {
        opacity: 0.5,
      },
    };
    const styles = styleDefinitionToBranchedStyles(threeLevelDefinition, levels);

    expect(styles['selected.pressed.highContrast']).toEqual({
      borderWidth: 3,
      opacity: 0.7,
    });
    expect(pickActiveStyle({ selected: true, pressed: true, highContrast: true }, levels, styles)).toEqual({
      borderWidth: 3,
      opacity: 0.7,
    });

    delete styles['selected.pressed.highContrast'];
    expect(pickActiveStyle({ selected: true, pressed: true, highContrast: true }, levels, styles)).toEqual({
      borderWidth: 1,
      opacity: 0.55,
    });
  });

  it('rejects states repeated across hierarchy levels', () => {
    const levels = [['selected'], ['selected']] as const;
    const invalidDefinition: StyleDefinition<ViewStyle, typeof levels> = {
      opacity: 1,
    };

    expect(() => styleDefinitionToBranchedStyles(invalidDefinition, levels)).toThrow(
      'State "selected" must belong to only one hierarchy level.',
    );
  });

  it('resolves themed definitions once per ThemeState', () => {
    const firstTheme = createThemeState();
    const secondTheme = createThemeState();
    const factory = jest.fn(() => definition);
    const getStyle = getThemedStateStyleFactory('test.style', factory, stateLevels);

    expect(getStyle(firstTheme, { selected: true }).opacity).toBe(0.8);
    expect(getStyle(firstTheme, { hovered: true }).borderWidth).toBe(2);
    expect(factory).toHaveBeenCalledTimes(1);

    expect(getStyle(secondTheme, { pressed: true }).opacity).toBe(0.6);
    expect(factory).toHaveBeenCalledTimes(2);
  });
});
