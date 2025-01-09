import * as React from 'react';

import { checkReRender } from '@fluentui-react-native/test-tools';
import * as renderer from 'react-test-renderer';

import Tab from '../../Tab/Tab';
import TabList from '../TabList';

// Mocks out timer functions such as setTimeout. Without this, tests fail before the second render completes.
jest.useFakeTimers();

describe('TabList component tests', () => {
  it('TabList default props', async () => {
    const tree = renderer
      .create(
        <TabList>
          <Tab tabKey="1">Tab 1</Tab>
          <Tab tabKey="2">Tab 2</Tab>
          <Tab tabKey="3">Tab 3</Tab>
        </TabList>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('TabList selected key', () => {
    const tree = renderer
      .create(
        <TabList selectedKey="1">
          <Tab tabKey="1">Tab 1</Tab>
          <Tab tabKey="2">Tab 2</Tab>
          <Tab tabKey="3">Tab 3</Tab>
        </TabList>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('TabList disabled list', () => {
    const tree = renderer
      .create(
        <TabList disabled>
          <Tab tabKey="1">Tab 1</Tab>
          <Tab tabKey="2">Tab 2</Tab>
          <Tab tabKey="3">Tab 3</Tab>
        </TabList>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('TabList appearance', () => {
    const tree = renderer
      .create(
        <TabList appearance="subtle">
          <Tab tabKey="1">Tab 1</Tab>
          <Tab tabKey="2">Tab 2</Tab>
          <Tab tabKey="3">Tab 3</Tab>
        </TabList>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('TabList size', () => {
    const tree = renderer
      .create(
        <TabList size="large">
          <Tab tabKey="1">Tab 1</Tab>
          <Tab tabKey="2">Tab 2</Tab>
          <Tab tabKey="3">Tab 3</Tab>
        </TabList>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('TabList orientation', () => {
    const tree = renderer
      .create(
        <TabList vertical>
          <Tab tabKey="1">Tab 1</Tab>
          <Tab tabKey="2">Tab 2</Tab>
          <Tab tabKey="3">Tab 3</Tab>
        </TabList>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('TabList re-renders correctly', () => {
    checkReRender(
      () => (
        <TabList>
          <Tab tabKey="1">Tab 1</Tab>
          <Tab tabKey="2">Tab 2</Tab>
        </TabList>
      ),
      2,
    );
  });
});
