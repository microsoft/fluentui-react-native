import { act } from 'react';

import * as renderer from 'react-test-renderer';

import { Shimmer } from './Shimmer';
import type { ShimmerCircleElement, ShimmerRectElement } from './Shimmer.types';

function shimmerRects(): Array<ShimmerRectElement | ShimmerCircleElement> {
  return [
    {
      type: 'rect',
      borderRadiusX: 3,
      borderRadiusY: 3,
      width: 100,
      height: 20,
      x: 90,
      y: 70,
    },
    {
      type: 'rect',
      borderRadiusX: 3,
      borderRadiusY: 3,
      width: 150,
      height: 20,
      x: 90,
      y: 42,
    },
    {
      type: 'rect',
      borderRadiusX: 3,
      borderRadiusY: 3,
      width: 200,
      height: 20,
      x: 90,
      y: 15,
    },
  ];
}

const style = { width: 300, height: 100 };

// mocks out setTimeout and other timer functions with mock functions, test will fail without this as we're using Animated API
jest.useFakeTimers();

describe('Shimmer component tests', () => {
  it('Shimmer default', async () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<Shimmer elements={shimmerRects()} />);
    });
    expect(component!.toJSON()).toMatchSnapshot();
    await act(async () => null);
  });

  it('Shimmer with style prop', async () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<Shimmer elements={shimmerRects()} style={style} />);
    });
    expect(component!.toJSON()).toMatchSnapshot();
    await act(async () => null);
  });
});
