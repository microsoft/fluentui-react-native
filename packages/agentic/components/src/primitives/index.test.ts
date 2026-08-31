import * as primitives from './index';

describe('primitive exports', () => {
  it('exports exactly the primitive runtime API', () => {
    expect(Object.keys(primitives).sort()).toEqual(
      ['CheckboxIndicator', 'CompoundItemLayout', 'FocusVisual', 'Icon', 'LayoutStableText', 'createFocusVisualProps_unstable'].sort(),
    );
  });
});
