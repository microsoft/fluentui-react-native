import * as React from 'react';
import { stackStyle } from '../Common/styles';
import { View, Text } from 'react-native';
import { Link } from '@fluentui/react-native';
import { Button } from '@fluentui-react-native/experimental-button';
import { Drawer } from '@fluentui-react-native/experimental-drawer';
import { Stack } from '@fluentui-react-native/stack';
import { Icon, SvgIconProps } from '@fluentui-react-native/icon';
import { DRAWER_TESTPAGE } from './consts';
import { Test, TestSection, PlatformStatus } from '../Test';

import TestSvg from '../Icon/assets/test.svg';

const basicDrawer: React.FunctionComponent = () => {

  const stdBtnRef = React.useRef(null);
  //const [showDrawer, setShowDrawer] = React.useState(false);
  /*const toggleShowDrawer = React.useCallback(() => {
    setShowDrawer(!showDrawer);
  }, [showDrawer]);*/



  const svgProps: SvgIconProps = {
    src: TestSvg,
    viewBox: '0 0 500 500',
  };

  return (
    <Stack style={stackStyle} gap={5}>
      {/*<Button componentRef={stdBtnRef} onClick={toggleShowDrawer}>Press for Drawer</Button>*/}
      {/*showDrawer && (<Drawer target={stdBtnRef} showDrawer= {showDrawer} toggleShow={toggleShowDrawer}>
        <Icon svgSource={svgProps} width={100} height={100} color="orange" />
        <Icon svgSource={svgProps} width={100} height={100} color="blue" />
      </Drawer>)}*/}
      <Drawer>
        {/*<Link content="Click to navigate." />*/}
        {<View><Text>Press for Drawer</Text></View>}
        {/*<Button componentRef={stdBtnRef}>Press for Drawer</Button>*/}
        {/*<View><Icon svgSource={svgProps} width={100} height={100} color="orange" /></View>*/}
        <View style={{padding: 20 }}>
          <Text>This is content inside Drawer</Text>
          <Link url="https://www.bing.com/" content="Click to navigate." />
          {<Icon svgSource={svgProps} width={100} height={100} color="blue" />}
          <Button componentRef={stdBtnRef}>Press for Drawer</Button>
        </View>
      </Drawer>
    </Stack>
  );
};

const drawerSections: TestSection[] = [
  {
    name: 'Basic Drawer',
    testID: DRAWER_TESTPAGE,
    component: basicDrawer,
  },
];

export const DrawerTest: React.FunctionComponent = () => {
  const status: PlatformStatus = {
    win32Status: 'N/A',
    uwpStatus: 'N/A',
    iosStatus: 'Backlog',
    macosStatus: 'N/A',
    androidStatus: 'Experimental',
  };

  const description =
    'A Drawer component using the Fluent Design System.  Currently only implemented on Android.';

  return <Test name="Drawer Test" description={description} sections={drawerSections} status={status} />;
};
