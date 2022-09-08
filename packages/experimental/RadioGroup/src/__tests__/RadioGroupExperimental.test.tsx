import * as React from 'react';
import { RadioGroup } from '../RadioGroup/RadioGroup';
import * as renderer from 'react-test-renderer';
import { checkRenderConsistency, checkReRender } from '@fluentui-react-native/test-tools';

describe('RadioGroup component tests', () => {
  it('RadioGroup default', () => {
    const tree = renderer.create(<RadioGroup>Your component</RadioGroup>).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('RadioGroup simple rendering does not invalidate styling', () => {
    checkRenderConsistency(() => <RadioGroup>Default RadioGroup</RadioGroup>, 2);
  });

  it('RadioGroup re-renders correctly', () => {
    checkReRender(() => <RadioGroup>Render twice</RadioGroup>, 2);
  });

  // Feel free to add more tests here
});
