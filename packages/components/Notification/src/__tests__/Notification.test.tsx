import * as React from 'react';
import { Notification } from '../Notification';
import * as renderer from 'react-test-renderer';

it('Notification default', () => {
  const tree = renderer.create(<Notification variant={'primary'} startText="Mail Archived" endText="Undo"></Notification>).toJSON();
  expect(tree).toMatchSnapshot();
});
