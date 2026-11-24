import type { DrawerProps } from '../../index';

describe('Drawer props', () => {
  it('limits the contract to measured inline layout', () => {
    const custom: DrawerProps = { title: 'Inspector', size: 'custom', customSize: 200 };
    // @ts-expect-error No overlay is admitted without native isolation.
    const modal: DrawerProps = { title: 'Inspector', modality: 'modal' };
    // @ts-expect-error Custom mode needs an extent.
    const missing: DrawerProps = { title: 'Inspector', size: 'custom' };
    expect([custom, modal, missing]).toHaveLength(3);
  });
});
