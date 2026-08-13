/* eslint-disable @typescript-eslint/no-unused-vars */
import type { RadioProps } from './radio.types';

const DefaultRadioProps: RadioProps = {
  label: 'Label',
};

const SelectedRadioProps: RadioProps = {
  label: 'Choice',
  secondaryText: 'Additional description',
  selected: true,
  showSecondaryText: true,
  style: { width: 120 },
};

function acceptRadioProps(_props: RadioProps) {}

// @ts-expect-error Radio owns its children.
acceptRadioProps({
  children: 'nope',
  label: 'Choice',
});

describe('Radio prop types', () => {
  it('accepts the public prop contract', () => {
    expect(DefaultRadioProps).toBeDefined();
    expect(SelectedRadioProps).toBeDefined();
  });
});
