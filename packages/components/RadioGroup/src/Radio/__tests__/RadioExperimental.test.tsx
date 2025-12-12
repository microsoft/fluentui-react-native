import * as renderer from 'react-test-renderer';

import { Radio } from '../Radio';

describe('Radio component tests', () => {
  it('Radio default', () => {
    const tree = renderer.create(<Radio value="key1" label="Default Radio" />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Radio disabled', () => {
    const tree = renderer.create(<Radio disabled value="key1" label="Disabled Radio" />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
