import * as React from 'react';

import { Button } from '@fluentui-react-native/experimental-button';
import { checkRenderConsistency, checkReRender } from '@fluentui-react-native/test-tools';
import * as renderer from 'react-test-renderer';

import { Tooltip } from '../Tooltip';

describe('Tooltip component tests', () => {
  it('Tooltip default', () => {
    const tree = renderer
      .create(
        <Tooltip content="Your component">
          <Button>Your component</Button>
        </Tooltip>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Tooltip simple rendering does not invalidate styling', () => {
    checkRenderConsistency(
      () => (
        <Tooltip content="Default Tooltip">
          <Button>Default Tooltip</Button>
        </Tooltip>
      ),
      2,
    );
  });

  it('Tooltip re-renders correctly', () => {
    checkReRender(
      () => (
        <Tooltip content="Render twice">
          <Button>Render twice</Button>
        </Tooltip>
      ),
      2,
    );
  });

  // Feel free to add more tests here
});
