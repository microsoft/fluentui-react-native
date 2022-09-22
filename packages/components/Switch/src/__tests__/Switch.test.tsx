import * as React from 'react';
import * as renderer from 'react-test-renderer';
import { Switch } from '../Switch.win32';
import { checkRenderConsistency, checkReRender } from '@fluentui-react-native/test-tools';

it('Switch Default', () => {
  const tree = renderer.create(<Switch label="Default Switch" />).toJSON();
  expect(tree).toMatchSnapshot();
});

it('Switch Disabled', () => {
  const tree = renderer.create(<Switch label="Default Switch Disabled" disabled />).toJSON();
  expect(tree).toMatchSnapshot();
});

it('Simple switch rendering does not invalidate styling', () => {
  checkRenderConsistency(() => <Switch label="Default Switch" />, 2);
});

it('Switch re-renders correctly', () => {
  checkReRender(() => <Switch label="Render Twice" />, 2);
});
