import * as renderer from 'react-test-renderer';

import { RadioButton } from '../RadioButton';

describe('RadioButton component tests', () => {
  it('RadioButton default', () => {
    const tree = renderer.create(<RadioButton buttonKey="key1" content="Default Button" />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
