/* eslint-disable @typescript-eslint/no-unused-vars */
import type { RadioProps } from './radio.types';

type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? true : false;
type Expect<T extends true> = T;

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

const RadioOwnsChildren: Expect<Equal<RadioProps['children'], never>> = true;

describe('Radio prop types', () => {
  it('accepts the public prop contract', () => {
    acceptRadioProps(DefaultRadioProps);
    expect(DefaultRadioProps).toBeDefined();
    expect(SelectedRadioProps).toBeDefined();
    expect(RadioOwnsChildren).toBe(true);
  });
});
