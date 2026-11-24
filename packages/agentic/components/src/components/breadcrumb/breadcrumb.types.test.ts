import type { BreadcrumbProps } from '../../index';

describe('Breadcrumb props', () => {
  it('requires a current location and gives only ancestors a destination', () => {
    const valid: BreadcrumbProps = {
      items: [
        { key: 'root', label: 'Root', onNavigate: () => undefined },
        { key: 'current', label: 'Current' },
      ],
      accessibilityLabel: 'Location',
      overflowLabel: 'More locations',
    };
    // @ts-expect-error The current location is not a second destination.
    const invalid: BreadcrumbProps = { ...valid, items: [{ key: 'current', label: 'Current', url: 'https://reactnative.dev/' }] };
    expect([valid, invalid]).toHaveLength(2);
  });
});
