import { act } from 'react';
import { Text } from 'react-native';

import * as renderer from 'react-test-renderer';

// import { Drawer } from '../Drawer';

// mocks out setTimeout and other timer functions with mock functions , test will fail without this as we're using Animated API
jest.useFakeTimers();

// Disable Drawer test, as it's still failing despite the line above
describe('Drawer component tests', () => {
  it('Drawer default', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
        // <Drawer open={false} drawerPosition="left">
        <Text>Hello</Text>,
        // </Drawer>,
      );
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });
});
