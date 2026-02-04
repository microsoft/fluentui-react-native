import { act } from 'react';

import * as renderer from 'react-test-renderer';

import { Radio } from '../Radio';

describe('Radio component tests', () => {
  it('Radio default', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<Radio value="key1" label="Default Radio" />);
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });

  it('Radio disabled', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<Radio disabled value="key1" label="Disabled Radio" />);
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });
});
