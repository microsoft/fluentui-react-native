import { ButtonV1 } from '@fluentui-react-native/button';
import * as renderer from 'react-test-renderer';
import { act } from 'react';

import { Tooltip } from '../Tooltip';

describe('Tooltip component tests', () => {
  it('Tooltip default', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
        <Tooltip content="Your component">
          <ButtonV1>Your component</ButtonV1>
        </Tooltip>,
      );
    });
    const tree = component!.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
