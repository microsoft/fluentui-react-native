import * as React from 'react';

import * as renderer from 'react-test-renderer';

import { Radio } from '../../Radio/Radio';
import { RadioGroup } from '../RadioGroup';

jest.useFakeTimers();

describe('RadioGroup component tests', () => {
  it('RadioGroup default', async () => {
    const tree = renderer
      .create(
        <RadioGroup label="Uncontrolled RadioGroup" defaultValue="key2">
          <Radio value="key1" label="RadioButton1" />
          <Radio value="key2" label="RadioButton2" />
        </RadioGroup>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
    await renderer.act(async () => null);
  });

  it('Radio not direct child of radio group', async () => {
    const tree = renderer
      .create(
        <RadioGroup label="Uncontrolled RadioGroup" defaultValue="key2">
          <Radio value="key1" label="Radio1" accessibilityPositionInSet={1} accessibilitySetSize={2} />
          <Radio value="key2" label="Radio2" accessibilityPositionInSet={2} accessibilitySetSize={2} />
        </RadioGroup>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
    await renderer.act(async () => null);
  });

  it('RadioGroup disabled', async () => {
    const tree = renderer
      .create(
        <RadioGroup disabled label="Disabled RadioGroup">
          <Radio value="key1" label="Radio1" accessibilityPositionInSet={1} accessibilitySetSize={2} />
          <Radio value="key2" label="Radio2" accessibilityPositionInSet={2} accessibilitySetSize={2} />
        </RadioGroup>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
    await renderer.act(async () => null);
  });

  it('RadioGroup required', async () => {
    const tree = renderer
      .create(
        <RadioGroup required label="Required RadioGroup" defaultValue="key2">
          <Radio value="key1" label="Radio1" accessibilityPositionInSet={1} accessibilitySetSize={2} />
          <Radio value="key2" label="Radio2" accessibilityPositionInSet={2} accessibilitySetSize={2} />
        </RadioGroup>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
    await renderer.act(async () => null);
  });

  it('RadioGroup horizontal', async () => {
    const tree = renderer
      .create(
        <RadioGroup layout="horizontal" label="Horizontal RadioGroup" defaultValue="key2">
          <Radio value="key1" label="Radio1" accessibilityPositionInSet={1} accessibilitySetSize={2} />
          <Radio value="key2" label="Radio2" accessibilityPositionInSet={2} accessibilitySetSize={2} />
        </RadioGroup>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
    await renderer.act(async () => null);
  });

  it('RadioGroup horizontal-stacked', async () => {
    const tree = renderer
      .create(
        <RadioGroup layout="horizontal-stacked" label="Horizontal-Stacked RadioGroup" defaultValue="key2">
          <Radio value="key1" label="Radio1" accessibilityPositionInSet={1} accessibilitySetSize={2} />
          <Radio value="key2" label="Radio2" accessibilityPositionInSet={2} accessibilitySetSize={2} />
        </RadioGroup>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
    await renderer.act(async () => null);
  });
});
