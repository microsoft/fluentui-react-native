/* eslint-disable @typescript-eslint/no-unused-vars */
import type { LabelProps, LabelSize, LabelWeight } from './label.types';

const DefaultLabel: LabelProps = {
  content: 'Display name',
  testID: 'label-root',
};

const FullyConfiguredLabel: LabelProps = {
  content: { children: 'Display name', testID: 'label-content' },
  disabled: true,
  nativeID: 'display-name-label',
  required: true,
  requiredIndicator: { children: '*', testID: 'label-required-indicator' },
  size: 'large',
  weight: 'strong',
};

const SuppressedIndicatorLabel: LabelProps = {
  content: 'Display name',
  required: true,
  requiredIndicator: null,
};

// @ts-expect-error label text goes through the content slot rather than children.
const ChildrenLabel: LabelProps = {
  children: 'Display name',
};

// @ts-expect-error Label owns its accessibility role.
const RoleLabel: LabelProps = {
  role: 'heading',
  content: 'Display name',
};

// @ts-expect-error Label is never focusable.
const FocusableLabel: LabelProps = {
  content: 'Display name',
  focusable: true,
};

// @ts-expect-error size only accepts the documented scale.
const InvalidSizeLabel: LabelProps = {
  content: 'Display name',
  size: 'tiny',
};

// @ts-expect-error weight only accepts the documented emphasis values.
const InvalidWeightLabel: LabelProps = {
  content: 'Display name',
  weight: 'bold',
};

const sizes: LabelSize[] = ['small', 'medium', 'large'];
const weights: LabelWeight[] = ['regular', 'strong'];

describe('Label props', () => {
  it('accepts the documented label prop shapes', () => {
    expect(DefaultLabel).toBeDefined();
    expect(FullyConfiguredLabel).toBeDefined();
    expect(SuppressedIndicatorLabel).toBeDefined();
    expect(sizes).toHaveLength(3);
    expect(weights).toHaveLength(2);
  });
});
