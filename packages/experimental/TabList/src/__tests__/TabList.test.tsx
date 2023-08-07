import * as React from 'react';
// import type { I18nManagerStatic } from 'react-native';
// import { I18nManager } from 'react-native';

import { checkRenderConsistency, checkReRender } from '@fluentui-react-native/test-tools';
import * as renderer from 'react-test-renderer';

import Tab from '../Tab/Tab';
import TabList from '../TabList/TabList';

describe('TabList component tests', () => {
  beforeAll(() => {
    jest.mock('react-native/Libraries/Utilities/Platform', () => ({
      OS: 'win32',
      select: () => null,
    }));
    jest.mock('react-native/Libraries/ReactNative/I18nManager', () => ({
      isRtl: false,
    }));
  });

  it('TabList default props', () => {
    const tree = renderer
      .create(
        <TabList>
          <Tab tabKey="1">Tab 1</Tab>
          {/* <Tab tabKey="2">Tab 2</Tab>
          <Tab tabKey="3">Tab 3</Tab> */}
        </TabList>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  // it('TabList disabled tabs', () => {
  //   const tree = renderer
  //     .create(
  //       <TabList>
  //         <Tab disabled tabKey="1">
  //           Tab 1
  //         </Tab>
  //         <Tab tabKey="2">Tab 2</Tab>
  //         <Tab disabled tabKey="3">
  //           Tab 3
  //         </Tab>
  //       </TabList>,
  //     )
  //     .toJSON();
  //   expect(tree).toMatchSnapshot();
  // });

  // it('TabList disabled list', () => {
  //   const tree = renderer
  //     .create(
  //       <TabList disabled>
  //         <Tab tabKey="1">Tab 1</Tab>
  //         <Tab tabKey="2">Tab 2</Tab>
  //         <Tab tabKey="3">Tab 3</Tab>
  //       </TabList>,
  //     )
  //     .toJSON();
  //   expect(tree).toMatchSnapshot();
  // });

  // it('TabList appearance', () => {
  //   const tree = renderer
  //     .create(
  //       <TabList appearance="subtle">
  //         <Tab tabKey="1">Tab 1</Tab>
  //         <Tab tabKey="2">Tab 2</Tab>
  //         <Tab tabKey="3">Tab 3</Tab>
  //       </TabList>,
  //     )
  //     .toJSON();
  //   expect(tree).toMatchSnapshot();
  // });

  // it('TabList size', () => {
  //   const tree = renderer
  //     .create(
  //       <TabList size="large">
  //         <Tab tabKey="1">Tab 1</Tab>
  //         <Tab tabKey="2">Tab 2</Tab>
  //         <Tab tabKey="3">Tab 3</Tab>
  //       </TabList>,
  //     )
  //     .toJSON();
  //   expect(tree).toMatchSnapshot();
  // });

  // it('TabList orientation', () => {
  //   const tree = renderer
  //     .create(
  //       <TabList vertical>
  //         <Tab tabKey="1">Tab 1</Tab>
  //         <Tab tabKey="2">Tab 2</Tab>
  //         <Tab tabKey="3">Tab 3</Tab>
  //       </TabList>,
  //     )
  //     .toJSON();
  //   expect(tree).toMatchSnapshot();
  // });

  // it('TabList rendering icons', () => {
  //   const tree = renderer
  //     .create(
  //       <TabList>
  //         <Tab
  //           icon={{
  //             fontSource: {
  //               fontFamily: 'Arial',
  //               codepoint: 0x2663,
  //             },
  //           }}
  //           tabKey="1"
  //         >
  //           Tab 1
  //         </Tab>
  //         <Tab
  //           icon={{
  //             fontSource: {
  //               fontFamily: 'Arial',
  //               codepoint: 0x2663,
  //             },
  //           }}
  //           tabKey="2"
  //         />
  //       </TabList>,
  //     )
  //     .toJSON();
  //   expect(tree).toMatchSnapshot();
  // });

  // it('TabList simple rendering does not invalidate styling', () => {
  //   checkRenderConsistency(
  //     () => (
  //       <TabList>
  //         <Tab tabKey="1">Tab 1</Tab>
  //         <Tab tabKey="2">Tab 2</Tab>
  //         <Tab tabKey="3">Tab 3</Tab>
  //       </TabList>
  //     ),
  //     2,
  //   );
  // });

  // it('TabList re-renders correctly', () => {
  //   checkReRender(
  //     () => (
  //       <TabList>
  //         <Tab tabKey="1">Tab 1</Tab>
  //         <Tab tabKey="2">Tab 2</Tab>
  //         <Tab tabKey="3">Tab 3</Tab>
  //       </TabList>
  //     ),
  //     2,
  //   );
  // });
  afterAll(() => {
    jest.unmock('react-native/Libraries/Utilities/Platform');
    jest.unmock('react-native/Libraries/ReactNative/I18nManager');
  });
});
