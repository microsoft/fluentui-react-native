import * as renderer from 'react-test-renderer';
import { act } from 'react';
import { Notification } from '../Notification';

describe('Notification component tests', () => {
  beforeAll(() => {
    jest.mock('@fluentui-react-native/experimental-appearance-additions', () => ({
      useHorizontalSizeClass: 'regular',
    }));
  });

  it('Notification default', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
        <Notification
          variant={'primary'}
          action="Undo"
          onPress={() => {
            console.log('Notification tapped');
          }}
          onActionPress={() => {
            console.log('Undo tapped');
          }}
        >
          Mail Archived
        </Notification>,
      );
    });
    const tree = component!.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
