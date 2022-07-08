import * as React from 'react';
import { Notification } from '../Notification';
import * as renderer from 'react-test-renderer';

describe('Notification component tests', () => {
  it('Notification default', () => {
    const tree = renderer
      .create(
        <Notification
          variant={'primary'}
          action="Undo"
          onPress={() => {
            console.log('Notification tapped');
          }}
        >
          Mail Archived
        </Notification>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
