import { act } from 'react';

import * as renderer from 'react-test-renderer';

import { Callout } from '..';

describe('Callout on macOS', () => {
  it('uses the macOS directional hint default', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<Callout />);
    });

    expect(component!.toJSON()).toMatchObject({
      type: 'RCTCallout',
      props: {
        directionalHint: 'topLeftEdge',
      },
    });
  });
});
