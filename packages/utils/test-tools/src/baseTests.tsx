import * as React from 'react';
import { act } from 'react';

import * as renderer from 'react-test-renderer';

export function validateHookValueNotChanged<TValues extends NonNullable<any>[]>(
  testDescription: string,
  useHook: () => TValues,
  useHookAgain?: () => TValues,
) {
  it(testDescription || 'returns the same value(s) each time', () => {
    let latestValues: TValues | undefined;
    let callCount = 0;

    const TestComponent: React.FunctionComponent = () => {
      callCount++;
      // eslint-disable-next-line react-hooks/rules-of-hooks
      latestValues = callCount === 1 ? useHook() : (useHookAgain || useHook)();
      return <React.Fragment />;
    };

    let wrapper: renderer.ReactTestRenderer;
    act(() => {
      wrapper = renderer.create(<TestComponent />);
    });
    expect(callCount).toBe(1);
    const firstValues = latestValues;
    expect(firstValues).toBeDefined();
    latestValues = undefined;

    act(() => {
      wrapper.update(<TestComponent />);
    });
    expect(callCount).toBe(2);
    expect(latestValues).toBeDefined();
    expect(latestValues.length).toEqual(firstValues!.length);

    for (let i = 0; i < latestValues!.length; i++) {
      try {
        expect(latestValues![i]).toBe(firstValues![i]);
      } catch {
        // Make a more informative error message
        const valueText = latestValues![i].toString();
        expect('').toBe(`Identity of value at index ${i} has changed. This might help identify it:\n${valueText}`);
      }
    }
  });
}
