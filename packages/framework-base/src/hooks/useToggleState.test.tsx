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
    activate() {
      act(() => {
        latest.current.activate();
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
    const firstActivate = result.state.activate;

    expect(result.state.value).toBe(false);
    expect(result.state.controlled).toBe(false);

    result.activate();
    expect(result.state.value).toBe(true);
    expect(onChange).toHaveBeenLastCalledWith(true);

    result.activate();
    expect(result.state.value).toBe(false);
    expect(onChange).toHaveBeenLastCalledWith(false);
    expect(result.state.activate).toBe(firstActivate);
  });

  it('honors an externally driven value without changing it internally', () => {
    const onChange = jest.fn();
    const result = renderToggleState({ value: false, onChange });

    expect(result.state.controlled).toBe(true);

    result.activate();
    expect(onChange).toHaveBeenCalledWith(true);
    expect(result.state.value).toBe(false);

    result.update({ value: true, onChange });
    expect(result.state.value).toBe(true);
  });

  it('only turns the value on in select mode', () => {
    const onChange = jest.fn();
    const result = renderToggleState({ defaultValue: false, mode: 'select', onChange });

    result.activate();
    expect(result.state.value).toBe(true);
    expect(onChange).toHaveBeenCalledTimes(1);

    result.activate();
    expect(result.state.value).toBe(true);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('ignores activation and explicit sets while disabled', () => {
    const onChange = jest.fn();
    const result = renderToggleState({ defaultValue: false, disabled: true, onChange });

    result.activate();
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

  it('reports whether the caller opted into the state axis', () => {
    expect(renderToggleState({}).state.enabled).toBe(false);
    expect(renderToggleState({ value: false }).state.enabled).toBe(true);
    expect(renderToggleState({ defaultValue: false }).state.enabled).toBe(true);
    expect(renderToggleState({ onChange: jest.fn() }).state.enabled).toBe(true);
  });

  it('falls back to the supplied fallback value when nothing is specified', () => {
    expect(renderToggleState({}).state.value).toBe(false);
    expect(renderToggleState({ fallbackValue: true }).state.value).toBe(true);
  });
});
