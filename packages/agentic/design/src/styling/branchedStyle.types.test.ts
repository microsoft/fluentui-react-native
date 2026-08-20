/* eslint-disable @typescript-eslint/no-unused-vars */
import type { ViewStyle } from 'react-native';

import type { StatePath, StyleDefinition } from './branchedStyle';

const stateLevels = [['selected'], ['pressed', 'hovered'], ['highContrast']] as const;

const validDefinition: StyleDefinition<ViewStyle, typeof stateLevels> = {
  opacity: 1,
  selected: {
    pressed: {
      highContrast: {
        opacity: 0.7,
      },
    },
    highContrast: {
      opacity: 0.8,
    },
  },
  highContrast: {
    opacity: 0.9,
  },
};

const fullPath: StatePath<typeof stateLevels> = 'selected.pressed.highContrast';
const skippedLevelPath: StatePath<typeof stateLevels> = 'selected.highContrast';

// @ts-expect-error State paths must follow hierarchy order.
const reversedPath: StatePath<typeof stateLevels> = 'pressed.selected';

const invalidDefinition: StyleDefinition<ViewStyle, typeof stateLevels> = {
  pressed: {
    // @ts-expect-error States from the same hierarchy level cannot be nested.
    hovered: {
      opacity: 0.5,
    },
  },
};

describe('branchedStyle types', () => {
  it('accepts recursive definitions and ordered paths', () => {
    expect(validDefinition).toBeDefined();
    expect(fullPath).toBe('selected.pressed.highContrast');
    expect(skippedLevelPath).toBe('selected.highContrast');
    expect(invalidDefinition).toBeDefined();
  });
});
