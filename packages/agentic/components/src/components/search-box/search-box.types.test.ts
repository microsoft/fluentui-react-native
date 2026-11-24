import type { SearchBoxProps } from '../../index';

describe('SearchBox props', () => {
  it('requires an independently localized clear name', () => {
    const valid: SearchBoxProps = { accessibilityLabel: 'Search files', clearLabel: 'Clear search', value: '' };
    // @ts-expect-error Clear still needs a name when the starting value is empty.
    const unnamed: SearchBoxProps = { accessibilityLabel: 'Search files', value: '' };
    expect([valid, unnamed]).toHaveLength(2);
  });
});
