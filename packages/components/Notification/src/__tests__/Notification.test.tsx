import * as React from 'react';
import { Notification } from '../Notification';
import * as renderer from 'react-test-renderer';
import { checkRenderConsistency, checkReRender } from '@fluentui-react-native/test-tools';

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

  it('Notification simple rendering does not invalidate styling', () => {
    checkRenderConsistency(
      () => (
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
        </Notification>
      ),
      2,
    );
  });

  it('Notification re-renders correctly', () => {
    checkReRender(
      () => (
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
        </Notification>
      ),
      2,
    );
  });
});
