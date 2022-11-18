import * as React from 'react';
import { RadioGroup } from '../RadioGroup/RadioGroup';
import { Radio } from '../Radio/Radio';
import * as renderer from 'react-test-renderer';
import { checkRenderConsistency, checkReRender } from '@fluentui-react-native/test-tools';

jest.useFakeTimers();

describe('RadioGroup component tests', () => {
  it('RadioGroup default', () => {
    const tree = renderer
      .create(
        <RadioGroup label="Uncontrolled RadioGroup" defaultValue="key2">
          <Radio value="key1" label="RadioButton1" />
          <Radio value="key2" label="RadioButton2" />
        </RadioGroup>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Radio not direct child of radio group', () => {
    const tree = renderer
      .create(
        <RadioGroup label="Uncontrolled RadioGroup" defaultValue="key2">
          <Radio value="key1" label="Radio1" accessibilityPositionInSet={1} accessibilitySetSize={2} />
          <Radio value="key2" label="Radio2" accessibilityPositionInSet={2} accessibilitySetSize={2} />
        </RadioGroup>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  /* Uncomment these tests when Issue #2349 is fixed. */

  // it('RadioGroup disabled', () => {
  //   const tree = renderer
  //     .create(
  //       <RadioGroup disabled label="Disabled RadioGroup">
  //         <Radio value="key1" label="Radio1" accessibilityPositionInSet={1} accessibilitySetSize={2} />
  //         <Radio value="key2" label="Radio2" accessibilityPositionInSet={2} accessibilitySetSize={2} />
  //       </RadioGroup>,
  //     )
  //     .toJSON();
  //   expect(tree).toMatchSnapshot();
  // });

  // it('RadioGroup required', () => {
  //   const tree = renderer
  //     .create(
  //       <RadioGroup required label="Required RadioGroup" defaultValue="key2">
  //         <Radio value="key1" label="Radio1" accessibilityPositionInSet={1} accessibilitySetSize={2} />
  //         <Radio value="key2" label="Radio2" accessibilityPositionInSet={2} accessibilitySetSize={2} />
  //       </RadioGroup>,
  //     )
  //     .toJSON();
  //   expect(tree).toMatchSnapshot();
  // });

  // it('RadioGroup horizontal', () => {
  //   const tree = renderer
  //     .create(
  //       <RadioGroup layout="horizontal" label="Horizontal RadioGroup" defaultValue="key2">
  //         <Radio value="key1" label="Radio1" accessibilityPositionInSet={1} accessibilitySetSize={2} />
  //         <Radio value="key2" label="Radio2" accessibilityPositionInSet={2} accessibilitySetSize={2} />
  //       </RadioGroup>,
  //     )
  //     .toJSON();
  //   expect(tree).toMatchSnapshot();
  // });

  // it('RadioGroup horizontal-stacked', () => {
  //   const tree = renderer
  //     .create(
  //       <RadioGroup layout="horizontal-stacked" label="Horizontal-Stacked RadioGroup" defaultValue="key2">
  //         <Radio value="key1" label="Radio1" accessibilityPositionInSet={1} accessibilitySetSize={2} />
  //         <Radio value="key2" label="Radio2" accessibilityPositionInSet={2} accessibilitySetSize={2} />
  //       </RadioGroup>,
  //     )
  //     .toJSON();
  //   expect(tree).toMatchSnapshot();
  // });

  it('RadioGroup simple rendering does not invalidate styling', () => {
    checkRenderConsistency(() => <RadioGroup>Default RadioGroup</RadioGroup>, 2);
  });

  it('RadioGroup re-renders correctly', () => {
    checkReRender(() => <RadioGroup>Render twice</RadioGroup>, 2);
  });
});
