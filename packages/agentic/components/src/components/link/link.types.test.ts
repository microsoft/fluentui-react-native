import type { LinkProps } from '../../index';

describe('Link props', () => {
  it('uses exactly one destination and does not advertise an inline native range', () => {
    const app: LinkProps = { content: 'Settings', onNavigate: () => undefined };
    const external: LinkProps = { content: 'Documentation', url: 'https://reactnative.dev/' };
    // @ts-expect-error Destination ownership is mutually exclusive.
    const both: LinkProps = { ...app, url: external.url };
    // @ts-expect-error Inline text-range focus is deferred.
    const inline: LinkProps = { ...app, inline: true };
    expect([app, external, both, inline]).toHaveLength(4);
  });
});
