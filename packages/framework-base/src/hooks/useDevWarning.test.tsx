import * as React from 'react';
import { act } from 'react';
import * as renderer from 'react-test-renderer';

import { useDevWarning } from './useDevWarning';

type HarnessProps = {
  condition: boolean;
  severity?: 'warn' | 'error';
  warning: string;
};

function renderDevWarning(props: HarnessProps) {
  const Harness: React.FunctionComponent<HarnessProps> = ({ condition, severity, warning }) => {
    useDevWarning(condition, warning, severity);
    return null;
  };

  let tree!: renderer.ReactTestRenderer;
  act(() => {
    tree = renderer.create(<Harness {...props} />);
  });

  return {
    update(nextProps: HarnessProps) {
      act(() => {
        tree.update(<Harness {...nextProps} />);
      });
    },
  };
}

describe('useDevWarning', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('warns once when the condition is true', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

    renderDevWarning({ condition: true, warning: 'Something is wrong.' });

    expect(warn).toHaveBeenCalledWith('Something is wrong.');
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it('suppresses further warnings on rerender while the condition stays true', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

    const result = renderDevWarning({ condition: true, warning: 'Something is wrong.' });
    result.update({ condition: true, warning: 'Something is wrong.' });
    result.update({ condition: true, warning: 'Something is wrong.' });

    expect(warn).toHaveBeenCalledTimes(1);
  });

  it('resets and warns again after the condition returns to true', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

    const result = renderDevWarning({ condition: true, warning: 'Something is wrong.' });
    expect(warn).toHaveBeenCalledTimes(1);

    result.update({ condition: false, warning: 'Something is wrong.' });
    expect(warn).toHaveBeenCalledTimes(1);

    result.update({ condition: true, warning: 'Something is wrong.' });
    expect(warn).toHaveBeenCalledTimes(2);
  });

  it('never warns when the condition is false', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

    const result = renderDevWarning({ condition: false, warning: 'Something is wrong.' });
    result.update({ condition: false, warning: 'Something is wrong.' });

    expect(warn).not.toHaveBeenCalled();
  });

  it('can report invariant violations as errors', () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    renderDevWarning({ condition: true, severity: 'error', warning: 'Invariant violated.' });

    expect(error).toHaveBeenCalledWith('Invariant violated.');
  });

  it('does not re-warn solely because the message changes while already warned', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

    const result = renderDevWarning({ condition: true, warning: 'First message.' });
    expect(warn).toHaveBeenCalledWith('First message.');

    result.update({ condition: true, warning: 'Second message.' });

    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).not.toHaveBeenCalledWith('Second message.');
  });

  it('does not warn in production', () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    try {
      const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

      renderDevWarning({ condition: true, warning: 'Something is wrong.' });

      expect(warn).not.toHaveBeenCalled();
    } finally {
      process.env.NODE_ENV = originalNodeEnv;
    }
  });
});
