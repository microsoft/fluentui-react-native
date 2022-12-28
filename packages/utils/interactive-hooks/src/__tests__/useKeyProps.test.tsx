import * as React from 'react';
import * as renderer from 'react-test-renderer';
import { Pressable } from 'react-native';
import { useKeyProps } from '../useKeyProps';
import { checkReRender } from '@fluentui-react-native/test-tools';
import { PressablePropsExtended } from '../usePressableState.types';

const dummyFunction = () => {
  console.log('dummy');
};

// Simple wrapper function to let us use `PressablePropsExtended` to fix type errors
const PressableWithDesktopProps = (props: PressablePropsExtended) => {
  return <Pressable {...props} />;
};

it('useKeyProps is memoized', () => {
  const onKeyUpProps1 = useKeyProps(dummyFunction, ' ', 'Enter');
  const onKeyUpProps2 = useKeyProps(dummyFunction, ' ', 'Enter');
  expect(onKeyUpProps1 === onKeyUpProps2).toBeTruthy();
});

it('useKeyProps with Pressable', () => {
  const keyboardProps = useKeyProps(dummyFunction, ' ', 'Enter');

  const tree = renderer.create(<PressableWithDesktopProps {...keyboardProps} />).toJSON();
  expect(tree).toMatchSnapshot();
});

it('Pressable with useKeyProps re-renders correctly', () => {
  const keyboardProps = useKeyProps(dummyFunction, ' ', 'Enter');
  checkReRender(() => <PressableWithDesktopProps {...keyboardProps} />, 2);
});
