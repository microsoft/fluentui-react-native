import { APPEARANCE_VALUES, isAppearance } from './appearance.ts';
import { COMPONENT_STATE_VALUES, isComponentState } from './states.ts';
import { FRAMEWORK_VALUES, isFramework } from './framework.ts';
import { PLATFORM_VALUES, isPlatform } from './platform.ts';
import { SHAPE_VALUES, isShape } from './shape.ts';
import { SIZE_VALUES, isSize } from './size.ts';

describe('concept enums', () => {
  const guards = [
    { name: 'framework', values: FRAMEWORK_VALUES, guard: isFramework },
    { name: 'platform', values: PLATFORM_VALUES, guard: isPlatform },
    { name: 'state', values: COMPONENT_STATE_VALUES, guard: isComponentState },
    { name: 'appearance', values: APPEARANCE_VALUES, guard: isAppearance },
    { name: 'size', values: SIZE_VALUES, guard: isSize },
    { name: 'shape', values: SHAPE_VALUES, guard: isShape },
  ] as const;

  for (const { name, values, guard } of guards) {
    it(`${name} guard accepts every declared value`, () => {
      for (const value of values) {
        expect(guard(value)).toBe(true);
      }
    });

    it(`${name} guard rejects non-strings and unknown strings`, () => {
      expect(guard(undefined)).toBe(false);
      expect(guard(null)).toBe(false);
      expect(guard(0)).toBe(false);
      expect(guard('not-a-real-value')).toBe(false);
    });
  }
});
