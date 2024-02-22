import * as React from 'react';
import { View } from 'react-native';

import type { ReactWrapper } from 'enzyme';
import { mount } from 'enzyme';

export type JSXProducer = () => JSX.Element;

export interface PropTreeFilter {
  children?: boolean;
  functions?: boolean;
}

export type PropTreeSnapshot = {
  name: string;
  // eslint-disable-next-line @typescript-eslint/ban-types
  props: object;
  children: PropTreeSnapshot[];
};

export function snapshotPropTree(node: ReactWrapper, recurse: number, filter: PropTreeFilter = {}): PropTreeSnapshot {
  // get a potentially filtered copy of the props
  const nodeProps = node.props();
  const props = {};
  Object.keys(nodeProps).forEach((key) => {
    if (!(filter.children && key === 'children') && !(filter.functions && typeof nodeProps[key] === 'function')) {
      props[key] = nodeProps[key];
    }
  });

  // then build the base result
  const result: PropTreeSnapshot = { name: node.name(), props, children: [] };

  // if children are requested add children
  if (recurse > 0) {
    node.children().forEach((child) => {
      result.children.push(snapshotPropTree(child, recurse - 1, filter));
    });
  }
  return result;
}

export function compareTrees(a: PropTreeSnapshot, b: PropTreeSnapshot, paths: string[]): void {
  const newPaths = paths.concat(a.name);
  if (a.name !== b.name) {
    throw new Error(`Shallow compare found two nodes with different names at ${paths.join(': ')}`);
  }
  if (a.children.length !== b.children.length) {
    throw new Error(`Shallow compare found two nodes at ${paths.join(': ')} with different children counts`);
  }
  if (Object.keys(a.props).length !== Object.keys(b.props).length) {
    throw new Error(`Shallow compare found props at ${paths.join(': ')} with different property counts`);
  }
  Object.keys(a.props).forEach((key) => {
    if (a.props[key] !== b.props[key]) {
      // react-native's Pressable creates a new accessibilityState and accessibilityValue value on every render
      // to avoid having to disable a bunch of tests adding this exception for now
      if (key === 'accessibilityState') {
        if (a.props[key].accessibilityState || b.props[key].accessibilityState) {
          compareTrees(a.props[key].accessibilityState, b.props[key].accessibilityState, paths.concat('accessibilityState'));
        }
      } else if (key === 'accessibilityValue') {
        if (a.props[key].accessibilityValue || b.props[key].accessibilityValue) {
          compareTrees(a.props[key].accessibilityValue, b.props[key].accessibilityValue, paths.concat('accessibilityValue'));
        }
      } else {
        throw new Error(`Shallow compare failed for ${paths.join(': ')}, key: ${key}`);
      }
    }
  });
  for (let i = 0; i < a.children.length; i++) {
    compareTrees(a.children[i], b.children[i], newPaths);
  }
}

export function checkRenderConsistency(render: JSXProducer, depth: number = 1) {
  const filter = { children: true, functions: true };
  const t1 = snapshotPropTree(mount(render()), depth, filter);
  const t2 = snapshotPropTree(mount(render()), depth, filter);
  compareTrees(t1, t2, []);
}

export function checkReRender(render: JSXProducer, depth: number = 1) {
  const filter = { children: true };
  const w1 = mount(render());
  const t1 = snapshotPropTree(w1, depth, filter);
  w1.setProps({});
  const w2 = w1.update();
  const t2 = snapshotPropTree(w2, depth, filter);
  compareTrees(t1, t2, []);
}

/**
 * Validate that value(s) returned by a hook do not change in identity.
 * @param testDescription - Custom test description
 * @param useHook - Function to invoke the hook and return an array of return values which
 * should not change
 * @param useHookAgain - If you want to verify that the return value doesn't change when hook
 * parameters change, you can pass this second callback which calls the hook differently.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      return <View />;
    };

    const wrapper = mount(<TestComponent />);
    expect(callCount).toBe(1);
    const firstValues = latestValues;
    expect(firstValues).toBeDefined();
    latestValues = undefined;

    wrapper.setProps({});
    expect(callCount).toBe(2);
    expect(latestValues).toBeDefined();
    expect(latestValues.length).toEqual(firstValues!.length);

    for (let i = 0; i < latestValues!.length; i++) {
      try {
        expect(latestValues![i]).toBe(firstValues![i]);
      } catch (err) {
        // Make a more informative error message
        const valueText = latestValues![i].toString();
        expect('').toBe(`Identity of value at index ${i} has changed. This might help identify it:\n${valueText}`);
      }
    }
  });
}
