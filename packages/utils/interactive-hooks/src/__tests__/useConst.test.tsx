import * as React from 'react';
import { act } from 'react';

import { validateHookValueNotChanged } from '@fluentui-react-native/test-tools';
import * as renderer from 'react-test-renderer';

import { useConst } from '../useConst';

describe('useConst', () => {
  validateHookValueNotChanged('returns the same value with value initializer', () => [useConst(Math.random())]);

  validateHookValueNotChanged('returns the same value with function initializer', () => [useConst(() => Math.random())]);

  it('calls the function initializer only once', () => {
    const initializer = jest.fn(() => Math.random());
    const TestComponent: React.FunctionComponent = () => {
      const value = useConst(initializer);

      return <React.Fragment>{value}</React.Fragment>;
    };

    let wrapper: renderer.ReactTestRenderer;
    act(() => {
      wrapper = renderer.create(<TestComponent />);
    });
    const firstValue = wrapper!.toJSON();
    // Re-render the component
    act(() => {
      wrapper.update(<TestComponent />);
    });
    // Text should be the same
    expect(wrapper!.toJSON()).toBe(firstValue);
    // Function shouldn't have been called again
    expect(initializer).toHaveBeenCalledTimes(1);
  });

  it('works with a function initializer which returns undefined', () => {
    const initializer = jest.fn(() => undefined);
    const TestComponent: React.FunctionComponent = () => {
      const value = useConst(initializer);

      return <React.Fragment>{value}</React.Fragment>;
    };

    let wrapper: renderer.ReactTestRenderer;
    act(() => {
      wrapper = renderer.create(<TestComponent />);
    });
    // Re-render the component
    act(() => {
      wrapper.update(<TestComponent />);
    });
    // Function shouldn't have been called again
    expect(initializer).toHaveBeenCalledTimes(1);
  });
});
