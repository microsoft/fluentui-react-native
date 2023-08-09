import * as React from 'react';

import { checkReRender } from '@fluentui-react-native/test-tools';
import * as renderer from 'react-test-renderer';

import Tab from '../Tab';

describe('Tab component tests', () => {
  it('Tab default props', () => {
    const tree = renderer.create(<Tab tabKey="1">Tab 1</Tab>).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Tab disabled', () => {
    const tree = renderer
      .create(
        <Tab tabKey="1" disabled>
          Tab 1
        </Tab>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Tab render icon only', () => {
    const tree = renderer
      .create(
        <Tab
          icon={{
            fontSource: {
              fontFamily: 'Arial',
              codepoint: 0x2663,
            },
          }}
          tabKey="1"
        />,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Tab render icon + text', () => {
    const tree = renderer
      .create(
        <Tab
          icon={{
            fontSource: {
              fontFamily: 'Arial',
              codepoint: 0x2663,
            },
          }}
          tabKey="1"
        >
          Tab 1
        </Tab>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Customized Tab', () => {
    const CustomTab = Tab.customize({
      variant: 'headerSemibold',
      stackMarginVertical: 16,
      stackMarginHorizontal: 16,
      indicatorThickness: 4,
      color: 'red',
    });
    const tree = renderer.create(<CustomTab tabKey="1">Tab 1</CustomTab>);
    expect(tree).toMatchSnapshot();
  });

  it('Tab re-renders correctly', () => {
    checkReRender(
      () => (
        <Tab tabKey="1" accessibilityPositionInSet={1}>
          Tab 1
        </Tab>
      ),
      2,
    );
  });
});
