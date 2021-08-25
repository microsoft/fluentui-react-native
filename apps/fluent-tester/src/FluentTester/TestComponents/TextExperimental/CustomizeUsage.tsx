import * as React from 'react';
import { Platform, View } from 'react-native';
import { Stack } from '@fluentui-react-native/stack';
import { Text } from '@fluentui-react-native/experimental-text';
import { stackStyle } from '../Common/styles';

export const CustomizeUsage: React.FunctionComponent = () => {
  const RedCaptionBold = Text.customize({ variant: 'captionStandard', fontWeight: '700', color: '#ff0000' });
  const OrangeSecondaryBold = Text.customize({ variant: 'secondaryStandard', fontWeight: '700', color: '#ff9900' });
  const YellowBodyBold = Text.customize({ variant: 'bodyStandard', fontWeight: '700', color: '#f3ce00' });
  const GreenSubheaderBold = Text.customize({ variant: 'subheaderStandard', fontWeight: '700', color: '#02c440' });
  const BlueHeaderBold = Text.customize({ variant: 'headerStandard', fontWeight: '700', color: '#0229c4' });
  const IndigoHeroBold = Text.customize({ variant: 'heroStandard', fontWeight: '700', color: '#4b0082' });
  const PurpleHeroLargeBold = Text.customize({ variant: 'heroLargeStandard', fontWeight: '700', color: '#8402c4' });

  const CustomUsageStack = () => {
    return (
      <Stack style={stackStyle} gap={5}>
        <RedCaptionBold>RedCaptionBold</RedCaptionBold>
        <OrangeSecondaryBold>OrangeSecondaryBold</OrangeSecondaryBold>
        <YellowBodyBold>YellowBodyBold</YellowBodyBold>
        <GreenSubheaderBold>GreenSubheaderBold</GreenSubheaderBold>
        <BlueHeaderBold>BlueHeaderBold</BlueHeaderBold>
        <IndigoHeroBold>IndigoHeroBold</IndigoHeroBold>
        <PurpleHeroLargeBold>PurpleHeroLargeBold</PurpleHeroLargeBold>
      </Stack>
    );
  };

  // Android has a limited fontFamily support and unknown fonts fallback to sans-serif (Roboto).
  // Custom fonts (ttf, otf) are supported but need to be linked using 'react-native link'
  // The supported font families can be found as <aliases> at https://android.googlesource.com/platform/frameworks/base/+/master/data/fonts/fonts.xml
  const CustomFontNames = {
    ...Platform.select({
      android: {
        CourierNew: 'courier new',
        Georgia: 'georgia',
        TimesNewRoman: 'times new roman',
      },
      default: {
        CourierNew: 'Courier New',
        Georgia: 'Georgia',
        TimesNewRoman: 'Times New Roman',
      },
    }),
  };

  const ArialBlack = Text.customize({ variant: 'heroLargeStandard', fontFamily: 'Arial Black' });
  const BrushScriptMT = Text.customize({ variant: 'heroStandard', fontFamily: 'Brush Script MT' });
  const CourierNew = Text.customize({ variant: 'headerStandard', fontFamily: CustomFontNames.CourierNew });
  const Georgia = Text.customize({ variant: 'subheaderStandard', fontFamily: CustomFontNames.Georgia });
  const TimesNewRoman = Text.customize({ variant: 'secondaryStandard', fontFamily: CustomFontNames.TimesNewRoman });
  const Wingdings = Text.customize({ variant: 'captionStandard', fontFamily: 'Wingdings' });

  // Examples of supported Android fonts.
  const Arial = Text.customize({ variant: 'heroLargeStandard', fontFamily: 'arial' });
  const ComingSoon = Text.customize({ variant: 'heroStandard', fontFamily: 'casual' });

  const CustomFontStack = () => {
    return (
      <Stack style={stackStyle} gap={5}>
        <ArialBlack>Arial Black</ArialBlack>
        <BrushScriptMT>Brush Script MT</BrushScriptMT>
        <CourierNew>Courier New</CourierNew>
        <Georgia>Georgia</Georgia>
        <TimesNewRoman>TimesNewRoman</TimesNewRoman>
        <Wingdings>Wingdings</Wingdings>
      </Stack>
    );
  };
  const CustomFontStackAndroid = () => {
    return (
      <Stack style={stackStyle} gap={5}>
        <Arial>Arial</Arial>
        <ComingSoon>ComingSoon</ComingSoon>
        <CourierNew>Courier New</CourierNew>
        <Georgia>Georgia</Georgia>
        <TimesNewRoman>TimesNewRoman</TimesNewRoman>
      </Stack>
    );
  };

  return Platform.OS == 'android' ? (
    <View>
      <CustomUsageStack />
      <CustomFontStackAndroid />
    </View>
  ) : (
    <View>
      <CustomUsageStack />
      <CustomFontStack />
    </View>
  );
};
