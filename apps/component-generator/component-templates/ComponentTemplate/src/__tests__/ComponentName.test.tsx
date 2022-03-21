import * as React from 'react';
import { ComponentName } from '../ComponentName';
import * as renderer from 'react-test-renderer';
import { checkRenderConsistency, checkReRender } from '@fluentui-react-native/test-tools';

describe('ComponentName component tests', () => {
  it('ComponentName default', () => {
    const tree = renderer.create(<ComponentName>Your component</ComponentName>).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('ComponentName simple rendering does not invalidate styling', () => {
    checkRenderConsistency(() => <ComponentName>Default ComponentName</ComponentName>, 2);
  });

  it('ComponentName re-renders correctly', () => {
    checkReRender(() => <ComponentName>Render twice</ComponentName>, 2);
  });

  // Feel free to add more tests here
});
