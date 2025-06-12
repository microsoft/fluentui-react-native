import * as React from 'react';
import { Pressable } from 'react-native';

import * as renderer from 'react-test-renderer';

import { useKeyProps } from '../useKeyProps';
import type { PressablePropsExtended } from '../usePressableState.types';

const dummyFunction = () => {
  console.log('dummy');
};

// Simple wrapper function to let us use `PressablePropsExtended` to fix type errors
const PressableWithDesktopProps = (props: PressablePropsExtended) => {
  return <Pressable {...props} />;
};

it('Pressable with useKeyProps', () => {
  const TestComponent = () => {
    const keyboardProps = useKeyProps(dummyFunction, ' ', 'Enter');
    return <PressableWithDesktopProps {...keyboardProps} />;
  };

  const tree = renderer.create(<TestComponent />).toJSON();
  expect(tree).toMatchSnapshot();
});

it('useKeyProps called twice', () => {
  const TestComponent = () => {
    const keyboardProps1 = useKeyProps(dummyFunction, ' ', 'Enter');
    const keyboardProps2 = useKeyProps(dummyFunction, ' ', 'Enter');
    expect(keyboardProps1).toBe(keyboardProps2);
    return <PressableWithDesktopProps {...keyboardProps2} />;
  };

  const tree = renderer.create(<TestComponent />).toJSON();
  expect(tree).toMatchSnapshot();
});
