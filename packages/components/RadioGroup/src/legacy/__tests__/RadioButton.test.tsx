import { act } from 'react';

import * as renderer from 'react-test-renderer';

import { RadioButton } from '../RadioButton';

describe('RadioButton component tests', () => {
  it('RadioButton default', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<RadioButton buttonKey="key1" content="Default Button" />);
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });
});
