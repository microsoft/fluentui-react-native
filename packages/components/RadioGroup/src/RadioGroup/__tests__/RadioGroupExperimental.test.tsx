import { act } from 'react';

import * as renderer from 'react-test-renderer';

import { Radio } from '../../Radio/Radio';
import { RadioGroup } from '../RadioGroup';

jest.useFakeTimers();

describe('RadioGroup component tests', () => {
  it('RadioGroup default', async () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
        <RadioGroup label="Uncontrolled RadioGroup" defaultValue="key2">
          <Radio value="key1" label="RadioButton1" />
          <Radio value="key2" label="RadioButton2" />
        </RadioGroup>,
      );
    });
    expect(component!.toJSON()).toMatchSnapshot();
    await act(async () => null);
  });

  it('Radio not direct child of radio group', async () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
        <RadioGroup label="Uncontrolled RadioGroup" defaultValue="key2">
          <Radio value="key1" label="Radio1" accessibilityPosInSet={1} accessibilitySetSize={2} />
          <Radio value="key2" label="Radio2" accessibilityPosInSet={2} accessibilitySetSize={2} />
        </RadioGroup>,
      );
    });
    expect(component!.toJSON()).toMatchSnapshot();
    await act(async () => null);
  });

  it('RadioGroup disabled', async () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
        <RadioGroup disabled label="Disabled RadioGroup">
          <Radio value="key1" label="Radio1" accessibilityPosInSet={1} accessibilitySetSize={2} />
          <Radio value="key2" label="Radio2" accessibilityPosInSet={2} accessibilitySetSize={2} />
        </RadioGroup>,
      );
    });
    expect(component!.toJSON()).toMatchSnapshot();
    await act(async () => null);
  });

  it('RadioGroup required', async () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
        <RadioGroup required label="Required RadioGroup" defaultValue="key2">
          <Radio value="key1" label="Radio1" accessibilityPosInSet={1} accessibilitySetSize={2} />
          <Radio value="key2" label="Radio2" accessibilityPosInSet={2} accessibilitySetSize={2} />
        </RadioGroup>,
      );
    });
    expect(component!.toJSON()).toMatchSnapshot();
    await act(async () => null);
  });

  it('RadioGroup horizontal', async () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
        <RadioGroup layout="horizontal" label="Horizontal RadioGroup" defaultValue="key2">
          <Radio value="key1" label="Radio1" accessibilityPosInSet={1} accessibilitySetSize={2} />
          <Radio value="key2" label="Radio2" accessibilityPosInSet={2} accessibilitySetSize={2} />
        </RadioGroup>,
      );
    });
    expect(component!.toJSON()).toMatchSnapshot();
    await act(async () => null);
  });

  it('RadioGroup horizontal-stacked', async () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
        <RadioGroup layout="horizontal-stacked" label="Horizontal-Stacked RadioGroup" defaultValue="key2">
          <Radio value="key1" label="Radio1" accessibilityPosInSet={1} accessibilitySetSize={2} />
          <Radio value="key2" label="Radio2" accessibilityPosInSet={2} accessibilitySetSize={2} />
        </RadioGroup>,
      );
    });
    expect(component!.toJSON()).toMatchSnapshot();
    await act(async () => null);
  });
});
