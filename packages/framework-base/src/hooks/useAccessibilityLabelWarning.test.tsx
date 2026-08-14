import * as React from 'react';
import { act } from 'react';
import * as renderer from 'react-test-renderer';

import { useAccessibilityLabelWarning } from './useAccessibilityLabelWarning';
import type { AccessibilityLabelWarningOptions } from './useAccessibilityLabelWarning';

function renderLabelWarning(props: AccessibilityLabelWarningOptions) {
  const Harness: React.FunctionComponent<AccessibilityLabelWarningOptions> = (nextProps) => {
    useAccessibilityLabelWarning(nextProps);
    return null;
  };

  let tree!: renderer.ReactTestRenderer;
  act(() => {
    tree = renderer.create(<Harness {...props} />);
  });

  return {
    update(nextProps: AccessibilityLabelWarningOptions) {
      act(() => {
        tree.update(<Harness {...nextProps} />);
      });
    },
  };
}

describe('useAccessibilityLabelWarning', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('warns once when a required label is missing', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    const result = renderLabelWarning({ componentName: 'Badge', requireLabel: true });

    expect(warn).toHaveBeenCalledWith('Badge: accessibilityLabel is required.');
    expect(warn).toHaveBeenCalledTimes(1);

    result.update({ componentName: 'Badge', requireLabel: true });
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it('does not warn when accessibilityLabelledBy satisfies the requirement', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

    renderLabelWarning({
      componentName: 'Switch',
      requireLabel: true,
      accessibilityLabelledBy: 'toggle-label',
    });

    expect(warn).not.toHaveBeenCalled();
  });

  it('accepts multiple labelled-by references', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

    renderLabelWarning({
      accessibilityLabelledBy: ['primary-label', 'secondary-label'],
      componentName: 'Switch',
      requireLabel: true,
    });

    expect(warn).not.toHaveBeenCalled();
  });
});
