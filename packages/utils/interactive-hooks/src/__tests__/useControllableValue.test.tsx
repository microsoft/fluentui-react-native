import * as React from 'react';

import { validateHookValueNotChanged } from '@fluentui-react-native/test-tools';
import * as renderer from 'react-test-renderer';

import { useControllableValue } from '../useControllableValue';

describe('useControllableValue', () => {
  it('respects controlled value', () => {
    let resultValue: boolean | undefined;
    const TestComponent: React.FunctionComponent<{ value?: boolean; defaultValue?: boolean }> = ({ value, defaultValue }) => {
      [resultValue] = useControllableValue(value, defaultValue);
      return <React.Fragment />;
    };

    const wrapper1 = renderer.create(<TestComponent value={true} />);
    expect(resultValue!).toBe(true);

    wrapper1.update(<TestComponent value={false} />);
    expect(resultValue!).toBe(false);

    const wrapper2 = renderer.create(<TestComponent value={false} defaultValue={true} />);
    expect(resultValue!).toBe(false);

    wrapper2.update(<TestComponent value={true} defaultValue={true} />);
    expect(resultValue!).toBe(true);
  });

  it('uses the default value if no controlled value is provided', () => {
    let resultValue: boolean | undefined;
    const TestComponent: React.FunctionComponent<{ value?: boolean; defaultValue?: boolean }> = ({ value, defaultValue }) => {
      [resultValue] = useControllableValue(value, defaultValue);
      return <React.Fragment />;
    };

    renderer.create(<TestComponent defaultValue={true} />);
    expect(resultValue!).toBe(true);
  });

  it('does not change value when the default value changes', () => {
    let resultValue: boolean | undefined;
    const TestComponent: React.FunctionComponent<{ value?: boolean; defaultValue?: boolean }> = ({ value, defaultValue }) => {
      [resultValue] = useControllableValue(value, defaultValue);
      return <React.Fragment />;
    };

    const wrapper = renderer.create(<TestComponent defaultValue={true} />);
    expect(resultValue!).toBe(true);

    wrapper.update(<TestComponent defaultValue={false} />);
    expect(resultValue!).toBe(true);
  });

  validateHookValueNotChanged('returns the same setter callback', () => {
    const [, setValue] = useControllableValue('hello', 'world');
    return [setValue];
  });

  validateHookValueNotChanged(
    'returns same setter callback even if param values change',
    () => {
      const [, setValue] = useControllableValue('a', 'b', () => undefined);
      return [setValue];
    },
    () => {
      const [, setValue] = useControllableValue('c', 'd', () => undefined);
      return [setValue];
    },
  );
});
