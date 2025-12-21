import { ButtonV1 } from '@fluentui-react-native/button';
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
});
