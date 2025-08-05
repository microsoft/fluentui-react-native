import * as renderer from 'react-test-renderer';

import { Notification } from '../Notification';

describe('Notification component tests', () => {
  beforeAll(() => {
    jest.mock('@fluentui-react-native/experimental-appearance-additions', () => ({
      useHorizontalSizeClass: 'regular',
    }));
  });

  it('Notification default', () => {
    const tree = renderer
      .create(
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
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
