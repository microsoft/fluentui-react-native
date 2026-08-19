import * as React from 'react';
import { act } from 'react';
import * as renderer from 'react-test-renderer';

import { useToggleState } from './useToggleState';
import type { ToggleState, UseToggleStateOptions } from './useToggleState';

function renderToggleState(props: UseToggleStateOptions) {
  const latest: { current: ToggleState } = { current: undefined as unknown as ToggleState };

  const Harness: React.FunctionComponent<UseToggleStateOptions> = (nextProps) => {
    latest.current = useToggleState(nextProps);
    return null;
  };

  let tree!: renderer.ReactTestRenderer;

  act(() => {
    tree = renderer.create(<Harness {...props} />);
  });

  return {
    get state() {
      return latest.current;
    },
    toggle() {
      act(() => {
        latest.current.toggle();
      });
    },
    setValue(next: boolean) {
      act(() => {
        latest.current.setValue(next);
      });
    },
    update(nextProps: UseToggleStateOptions) {
      act(() => {
        tree.update(<Harness {...nextProps} />);
      });
    },
  };
}

describe('useToggleState', () => {
  it('drives the value internally and reports every change', () => {
    const onChange = jest.fn();
    const result = renderToggleState({ defaultValue: false, onChange });
    const firstToggle = result.state.toggle;

    expect(result.state.value).toBe(false);

    result.toggle();
    expect(result.state.value).toBe(true);
    expect(onChange).toHaveBeenLastCalledWith(true);

    result.toggle();
    expect(result.state.value).toBe(false);
    expect(onChange).toHaveBeenLastCalledWith(false);
    expect(result.state.toggle).toBe(firstToggle);
  });

  it('honors an externally driven value without changing it internally', () => {
    const onChange = jest.fn();
    const result = renderToggleState({ value: false, onChange });

    result.toggle();
    expect(onChange).toHaveBeenCalledWith(true);
    expect(result.state.value).toBe(false);

    result.update({ value: true, onChange });
    expect(result.state.value).toBe(true);
  });

  it('ignores toggles and explicit sets while disabled', () => {
    const onChange = jest.fn();
    const result = renderToggleState({ defaultValue: false, disabled: true, onChange });

    result.toggle();
    result.setValue(true);

    expect(result.state.value).toBe(false);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('reports a redundant explicit set as no change', () => {
    const onChange = jest.fn();
    const result = renderToggleState({ defaultValue: true, onChange });

    result.setValue(true);
    expect(onChange).not.toHaveBeenCalled();

    result.setValue(false);
    expect(result.state.value).toBe(false);
    expect(onChange).toHaveBeenCalledWith(false);
  });
});
