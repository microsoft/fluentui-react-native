import * as React from 'react';
import { act } from 'react';
import * as renderer from 'react-test-renderer';

import { useControllableValue } from './useControllableValue';
import type { ControllableValueChangeCallback } from './useControllableValue';

type HarnessProps = {
  value?: string;
  defaultValue?: string;
  onChange?: ControllableValueChangeCallback<string>;
};

function renderControllableValue(props: HarnessProps) {
  const latest: { current: readonly [string | undefined, (update: React.SetStateAction<string | undefined>) => void] } = {
    current: undefined as unknown as readonly [string | undefined, (update: React.SetStateAction<string | undefined>) => void],
  };

  const Harness: React.FunctionComponent<HarnessProps> = (nextProps) => {
    latest.current = useControllableValue(nextProps.value, nextProps.defaultValue, nextProps.onChange);
    return null;
  };

  let tree!: renderer.ReactTestRenderer;

  act(() => {
    tree = renderer.create(<Harness {...props} />);
  });

  return {
    get value() {
      return latest.current[0];
    },
    get setValue() {
      return latest.current[1];
    },
    update(nextProps: HarnessProps) {
      act(() => {
        tree.update(<Harness {...nextProps} />);
      });
    },
  };
}

describe('useControllableValue', () => {
  it('updates uncontrolled values and forwards the callback with the resolved next value', () => {
    const onChange = jest.fn();
    const result = renderControllableValue({ defaultValue: 'alpha', onChange });
    const firstSetter = result.setValue;

    expect(result.value).toBe('alpha');

    act(() => {
      result.setValue('beta');
    });

    expect(result.value).toBe('beta');
    expect(onChange).toHaveBeenCalledWith('beta');

    act(() => {
      result.setValue((previous) => `${previous}-next`);
    });

    expect(result.value).toBe('beta-next');
    expect(onChange).toHaveBeenLastCalledWith('beta-next');
    expect(result.setValue).toBe(firstSetter);
  });

  it('switches between controlled and uncontrolled values dynamically', () => {
    const onChange = jest.fn();
    const result = renderControllableValue({ defaultValue: 'alpha', onChange });

    act(() => {
      result.setValue('beta');
    });
    expect(result.value).toBe('beta');

    result.update({ value: 'gamma', defaultValue: 'alpha', onChange });
    expect(result.value).toBe('gamma');

    act(() => {
      result.setValue((previous) => `${previous}-next`);
    });

    expect(onChange).toHaveBeenLastCalledWith('gamma-next');
    expect(result.value).toBe('gamma');

    result.update({ defaultValue: 'ignored', onChange });
    expect(result.value).toBe('gamma');
  });
});
