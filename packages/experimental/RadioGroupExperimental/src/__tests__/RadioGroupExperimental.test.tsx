import * as React from 'react';
import { RadioGroupExperimental } from '../RadioGroup/RadioGroup';
import * as renderer from 'react-test-renderer';
import { checkRenderConsistency, checkReRender } from '@fluentui-react-native/test-tools';

describe('RadioGroupExperimental component tests', () => {
  it('RadioGroupExperimental default', () => {
    const tree = renderer.create(<RadioGroupExperimental>Your component</RadioGroupExperimental>).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('RadioGroupExperimental simple rendering does not invalidate styling', () => {
    checkRenderConsistency(() => <RadioGroupExperimental>Default RadioGroupExperimental</RadioGroupExperimental>, 2);
  });

  it('RadioGroupExperimental re-renders correctly', () => {
    checkReRender(() => <RadioGroupExperimental>Render twice</RadioGroupExperimental>, 2);
  });

  // Feel free to add more tests here
});
