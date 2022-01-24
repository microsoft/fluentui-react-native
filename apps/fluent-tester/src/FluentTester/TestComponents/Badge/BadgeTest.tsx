/* eslint-disable @typescript-eslint/no-var-requires */
import * as React from 'react';
import { BADGE_TESTPAGE } from './consts';
import { Test, TestSection, PlatformStatus } from '../Test';
import { View, Platform, Text } from 'react-native';
import { Badge, CompressibleBadge, PresenceBadge, PresenceBadgeStaged } from '@fluentui-react-native/badge';
import BadgeSvg from './oof.svg';

import { SvgIconProps } from '@fluentui-react-native/icon';

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

  const BadgeNoBorder = Badge.customize({
    borderColor: 'transparent',
    borderWidth: 0,
  });

  const StyledBadge = Badge.customize({
    backgroundColor: 'yellow',
    borderColor: '#f09',
    borderWidth: 4,
  });

  const svgIconsEnabled = ['ios', 'macos', 'win32', 'android'].includes(Platform.OS as string);
  const iconProps = { svgSource: svgProps, width: 20, height: 20 };

  return (
    <View>
      <Badge />
      <Text>Appearance</Text>
      <Badge appearance="outline" text="Outline badge" />
      <Text>Shape</Text>
      <Badge shape="circular" text="Circular badge" />
      <Badge shape="rounded" text="rounded badge" />
      <Badge shape="square" text="Square badge" />
      <Text>Size</Text>
      <Badge size="smallest" shape="circular" />
      <Badge size="smaller" shape="circular" />
      <Badge size="small" text="Small" />
      <Badge size="medium" text="Medium" />
      <Badge size="large" text="Large" />
      <Badge size="largest" text="Largest" />
      {svgIconsEnabled && (
        <>
          <Text>Badge with icon</Text>
          <Badge appearance="outline" icon={iconProps} />
          <Badge icon={{ fontSource: { ...fontBuiltInProps }, color: '#fff' }} />
          <Text>Badge with icon and text</Text>
          <Badge appearance="outline" icon={iconProps} />
        </>
      )}
      <Text>Customized Badge</Text>
      <BadgeNoBorder appearance="outline" icon={iconProps} />
      <StyledBadge appearance="outline" text="styled badge" />
      <Text>Compressible badge</Text>
      <CompressibleBadge />
      <CompressibleBadge text="Basic compressible" />
      <Text>Presence Badge</Text>
      <PresenceBadge presence="available" />
      <PresenceBadge presence="available" oof={true} />
      <PresenceBadge presence="DND" text="DND" oof={true} />
      <PresenceBadge presence="away" />
      <PresenceBadge presence="busy" />
      <PresenceBadge presence="offline" />
      <PresenceBadgeStaged presence="away" />
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
