import type { InfoLabelProps } from '../../index';

describe('InfoLabel props', () => {
  it('requires separately authored help and exposes a label-target binding', () => {
    const named: InfoLabelProps = {
      content: 'Retention period',
      target: { kind: 'editor', focus: () => undefined },
      help: { triggerLabel: 'Explain retention period', children: 'Counts calendar days.' },
    };
    // @ts-expect-error Help requires a separate trigger name.
    const unnamed: InfoLabelProps = { content: 'Retention period', help: { children: 'Counts calendar days.' } };
    expect([named, unnamed]).toHaveLength(2);
  });
});
