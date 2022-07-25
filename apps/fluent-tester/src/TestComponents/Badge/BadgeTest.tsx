/* eslint-disable @typescript-eslint/no-var-requires */
import * as React from 'react';
import { BADGE_TESTPAGE } from './consts';
import { Test, TestSection, PlatformStatus } from '../Test';
import { View, Platform, Text } from 'react-native';
import { Badge, PresenceBadge } from '@fluentui-react-native/badge';
import BadgeSvg from './oof.svg';

import { SvgIconProps } from '@fluentui-react-native/icon';

const BadgeNoBorder = Badge.customize({
  borderColor: 'transparent',
  borderWidth: 0,
});

const StyledBadge = Badge.customize({
  backgroundColor: 'yellow',
  borderColor: '#f09',
  borderWidth: 4,
});

export const BasicBadge: React.FunctionComponent = () => {
  const svgProps: SvgIconProps = {
    src: BadgeSvg,
    viewBox: '0 0 28 28',
  };

  const fontBuiltInProps = {
    fontFamily: 'Arial',
    codepoint: 0x2663,
    fontSize: 16,
  };

  const svgIconsEnabled = ['ios', 'macos', 'win32', 'android'].includes(Platform.OS as string);
  const iconProps = { svgSource: svgProps, width: 20, height: 20 };

  return (
    <View>
      <Badge />
      <Text>Appearance</Text>
      <Badge appearance="outline">Outline badge</Badge>
      <Text>Shape</Text>
      <Badge shape="circular">Circular badge</Badge>
      <Badge shape="rounded">Rounded badge</Badge>
      <Badge shape="square">Square badge</Badge>
      <Text>Size</Text>
      <Badge size="smallest" shape="circular" />
      <Badge size="smaller" shape="circular" />
      <Badge size="small">Small</Badge>
      <Badge size="medium">Medium</Badge>
      <Badge size="large">Large</Badge>
      <Badge size="largest">Largest</Badge>
      {svgIconsEnabled && (
        <>
          <Text>Badge with icon</Text>
          <Badge appearance="outline" icon={iconProps} />
          <Badge icon={{ fontSource: { ...fontBuiltInProps }, color: '#fff' }} />
          <Text>Badge with icon and text</Text>
          <Badge appearance="outline" icon={iconProps} />
          <Text>Customized Badge</Text>
          <BadgeNoBorder appearance="outline" icon={iconProps} />
        </>
      )}
      <StyledBadge appearance="outline">Styled badge</StyledBadge>
      {svgIconsEnabled && (
        <>
          <Text>Presence Badge</Text>
          <PresenceBadge status="available" size="largest" />
          <PresenceBadge status="available" outOfOffice={true} size="large" />
          <PresenceBadge status="doNotDisturb" outOfOffice={true} />
          <PresenceBadge status="away" size="small" />
          <PresenceBadge status="busy" size="smallest" />
          <PresenceBadge status="offline" />
          <PresenceBadge status="outOfOffice" />
          <PresenceBadge status="away" />
        </>
      )}
    </View>
  );
};

const badgeSections: TestSection[] = [
  {
    name: 'Basic Badge',
    testID: BADGE_TESTPAGE,
    component: BasicBadge,
  },
];

export const BadgeTest: React.FunctionComponent = () => {
  const status: PlatformStatus = {
    win32Status: 'Beta',
    uwpStatus: 'Experimental',
    iosStatus: 'Experimental',
    macosStatus: 'Experimental',
    androidStatus: 'Backlog',
  };

  const description =
    'A badge is an additional visual discriptor for UI elements. It can be used to denote numerical value, status or general information.\n Included in this spec are base properties for usage in all badge scenarios. Reference properties for other badge types i.e. size, layout, and style variations';

  return <Test name="Badge Test" description={description} sections={badgeSections} status={status}></Test>;
};
