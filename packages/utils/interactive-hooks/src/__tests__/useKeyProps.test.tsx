import { useKeyProps } from '../useKeyProps';

it('useKeyProps is memoized', () => {
  const dummyFunction = () => {
    console.log('dummy');
  };
  const onKeyUpProps1 = useKeyProps(dummyFunction, ' ', 'Enter');
  const onKeyUpProps2 = useKeyProps(dummyFunction, ' ', 'Enter');
  expect(onKeyUpProps1 === onKeyUpProps2).toBeTruthy();
});
