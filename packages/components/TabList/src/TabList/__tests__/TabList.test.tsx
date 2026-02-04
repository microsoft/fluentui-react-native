import { act } from 'react';

import * as renderer from 'react-test-renderer';

import Tab from '../../Tab/Tab';
import TabList from '../TabList';

// Mocks out timer functions such as setTimeout. Without this, tests fail before the second render completes.
jest.useFakeTimers();

describe('TabList component tests', () => {
  it('TabList default props', async () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
        <TabList>
          <Tab tabKey="1">Tab 1</Tab>
          <Tab tabKey="2">Tab 2</Tab>
          <Tab tabKey="3">Tab 3</Tab>
        </TabList>,
      );
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });

  it('TabList selected key', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
        <TabList selectedKey="1">
          <Tab tabKey="1">Tab 1</Tab>
          <Tab tabKey="2">Tab 2</Tab>
          <Tab tabKey="3">Tab 3</Tab>
        </TabList>,
      );
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });

  it('TabList disabled list', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
        <TabList disabled>
          <Tab tabKey="1">Tab 1</Tab>
          <Tab tabKey="2">Tab 2</Tab>
          <Tab tabKey="3">Tab 3</Tab>
        </TabList>,
      );
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });

  it('TabList appearance', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
        <TabList appearance="subtle">
          <Tab tabKey="1">Tab 1</Tab>
          <Tab tabKey="2">Tab 2</Tab>
          <Tab tabKey="3">Tab 3</Tab>
        </TabList>,
      );
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });

  it('TabList size', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
        <TabList size="large">
          <Tab tabKey="1">Tab 1</Tab>
          <Tab tabKey="2">Tab 2</Tab>
          <Tab tabKey="3">Tab 3</Tab>
        </TabList>,
      );
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });

  it('TabList orientation', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
        <TabList vertical>
          <Tab tabKey="1">Tab 1</Tab>
          <Tab tabKey="2">Tab 2</Tab>
          <Tab tabKey="3">Tab 3</Tab>
        </TabList>,
      );
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });
});
