import * as React from 'react';
import { Tooltip } from '../Tooltip';
import * as renderer from 'react-test-renderer';
import { checkRenderConsistency, checkReRender } from '@fluentui-react-native/test-tools';

describe('Tooltip component tests', () => {
  it('Tooltip default', () => {
    const tree = renderer.create(<Tooltip>Your component</Tooltip>).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Tooltip simple rendering does not invalidate styling', () => {
    checkRenderConsistency(() => <Tooltip>Default Tooltip</Tooltip>, 2);
  });

  it('Tooltip re-renders correctly', () => {
    checkReRender(() => <Tooltip>Render twice</Tooltip>, 2);
  });

  // Feel free to add more tests here
});
