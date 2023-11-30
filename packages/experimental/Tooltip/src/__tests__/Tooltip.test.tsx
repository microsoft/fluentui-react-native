import * as React from 'react';

import { ButtonV1 } from '@fluentui-react-native/button';
import { checkRenderConsistency, checkReRender } from '@fluentui-react-native/test-tools';
import * as renderer from 'react-test-renderer';

import { Tooltip } from '../Tooltip';

describe('Tooltip component tests', () => {
  it('Tooltip default', () => {
    const tree = renderer
      .create(
        <Tooltip content="Your component">
          <ButtonV1>Your component</ButtonV1>
        </Tooltip>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Tooltip simple rendering does not invalidate styling', () => {
    checkRenderConsistency(
      () => (
        <Tooltip content="Default Tooltip">
          <ButtonV1>Default Tooltip</ButtonV1>
        </Tooltip>
      ),
      2,
    );
  });

  it('Tooltip re-renders correctly', () => {
    checkReRender(
      () => (
        <Tooltip content="Render twice">
          <ButtonV1>Render twice</ButtonV1>
        </Tooltip>
      ),
      2,
    );
  });

  // Feel free to add more tests here
});
