import { act } from 'react';

import * as renderer from 'react-test-renderer';

import Tab from '../Tab';

describe('Tab component tests', () => {
  it('Tab default props', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<Tab tabKey="1">Tab 1</Tab>);
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });

  it('Tab disabled', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
        <Tab tabKey="1" disabled>
          Tab 1
        </Tab>,
      );
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });

  it('Tab render icon only', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
        <Tab
          icon={{
            fontSource: {
              fontFamily: 'Arial',
              codepoint: 0x2663,
            },
          }}
          tabKey="1"
        />,
      );
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });

  it('Tab render icon + text', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
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
      );
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });

  it('Customized Tab', () => {
    const CustomTab = Tab.customize({
      variant: 'headerSemibold',
      stackMarginVertical: 16,
      stackMarginHorizontal: 16,
      indicatorThickness: 4,
      color: 'red',
    });
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<CustomTab tabKey="1">Tab 1</CustomTab>);
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });
});
