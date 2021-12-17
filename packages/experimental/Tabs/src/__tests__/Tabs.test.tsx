import * as React from 'react';
import { Tabs, TabsItem } from '..';
import * as renderer from 'react-test-renderer';

it('Tabs default props', () => {
  const tree = renderer
    .create(
      <Tabs>
        <TabsItem itemKey="1" />
        <TabsItem itemKey="2" />
        <TabsItem itemKey="3" />
      </Tabs>,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Tabs disabled', () => {
  const tree = renderer
    .create(
      <Tabs>
        <TabsItem itemKey="1" disabled={true} />
        <TabsItem itemKey="2" disabled={true} />
        <TabsItem itemKey="3" />
      </Tabs>,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Tabs header text and count', () => {
  const tree = renderer
    .create(
      <Tabs>
        <TabsItem headerText="TabsItem" itemCount={1} itemKey="1" />
        <TabsItem headerText="TabsItem" itemCount={0} itemKey="2" />
        <TabsItem headerText="TabsItem" itemCount={100} itemKey="3" />
      </Tabs>,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Tabs headers only', () => {
  const tree = renderer
    .create(
      <Tabs headersOnly={true}>
        <TabsItem itemKey="1" />
        <TabsItem itemKey="2" />
        <TabsItem itemKey="3" />
      </Tabs>,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Tabs FocusZone props', () => {
  const tree = renderer
    .create(
      <Tabs defaultSelectedKey="2" isCircularNavigation={false}>
        <TabsItem itemKey="1" />
        <TabsItem itemKey="2" />
        <TabsItem itemKey="3" />
      </Tabs>,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Tabs props', () => {
  const tree = renderer
    .create(
      <Tabs label="Tabs" defaultSelectedKey="2" isCircularNavigation={false} headersOnly={true}>
        <TabsItem headerText="TabsItem" itemCount={1} itemKey="1" disabled={true} />
        <TabsItem headerText="TabsItem" itemCount={0} itemKey="2" />
        <TabsItem headerText="TabsItem" itemCount={100} itemKey="3" />
      </Tabs>,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
