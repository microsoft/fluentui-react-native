import { hasAccessibleName } from './accessibility';

describe('hasAccessibleName', () => {
  it.each([
    [{ accessibilityLabel: 'Avatar' }],
    [{ accessibilityLabelledBy: 'avatar-label' }],
    [{ 'aria-label': 'Avatar' }],
    [{ 'aria-labelledby': 'avatar-label' }],
  ])('detects an accessible name from %o', (props) => {
    expect(hasAccessibleName(props)).toBe(true);
  });

  it('returns false when no naming property is present', () => {
    expect(hasAccessibleName({})).toBe(false);
  });
});
