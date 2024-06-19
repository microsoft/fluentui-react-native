import * as React from 'react';
import { Platform, View } from 'react-native';

import { Stack } from '@fluentui-react-native/stack';
import { TextV1 as Text } from '@fluentui-react-native/text';

import { stackStyle } from '../Common/styles';

const RedCaptionBold = Text.customize({ variant: 'captionStandard', fontWeight: '700', color: '#ff0000' });
const OrangeSecondaryBold = Text.customize({ variant: 'secondaryStandard', fontWeight: '700', color: '#ff9900' });
const YellowBodyBold = Text.customize({ variant: 'bodyStandard', fontWeight: '700', color: '#f3ce00' });
const GreenSubheaderBold = Text.customize({ variant: 'subheaderStandard', fontWeight: '700', color: '#02c440' });
const BlueHeaderBold = Text.customize({ variant: 'headerStandard', fontWeight: '700', color: '#0229c4' });
const IndigoHeroBold = Text.customize({ variant: 'heroStandard', fontWeight: '700', color: '#4b0082' });
const PurpleHeroLargeBold = Text.customize({ variant: 'heroLargeStandard', fontWeight: '700', color: '#8402c4' });

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
const Casual = Text.customize({ variant: 'heroStandard', fontFamily: 'casual' });
const Cursive = Text.customize({ variant: 'heroStandard', fontFamily: 'cursive' });
// Examples of iOS fonts.
const Papyrus = Text.customize({ variant: 'heroLargeStandard', fontFamily: 'Papyrus' });
const Helvetica = Text.customize({ variant: 'heroLargeStandard', fontFamily: 'Helvetica' });
// Fonts supported on Android and iOS
const Arial = Text.customize({ variant: 'heroLargeStandard', fontFamily: 'arial' });

export const CustomizeUsage: React.FunctionComponent = () => {
  const BlockText = () => {
    return (
      <>
        <Text style={{ textTransform: 'uppercase' }} font="base" weight="medium" truncate>
          I am going to be truncated since I am a very very very very very very very very very very very very very very very very very very
          very very very very very very very very very very very very very very very very very very very very very very very very very very
          very very very very very very very very very very very very very very very very long block text.
        </Text>
        <Text font="monospace" weight="semibold" wrap={false}>
          I am not going to be wrapped since I am a very very very very very very very very very very very very very very very very very
          very very very very very very very very very very very very very very very very very very very very very very very very very very
          very very very very very very very very very very very very very very very very very long block text.
        </Text>
        <Text underline>Since text components are inside a View</Text>
        <Text>every block of text</Text>
        <Text underline strikethrough align="end">
          gets its own line. This line has been underlined, striked through, and right aligned.
        </Text>
      </>
    );
  };

  const NonBlockText = () => {
    return (
      <Text>
        <Text italic>I am italisized inline text.</Text>
        <Text weight="medium">Since text components are inside a Text, (medium) </Text>
        <Text weight="bold">every block of text (bolded) </Text>
        <Text size={600}>gets placed inline.</Text>
      </Text>
    );
  };

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
        <Casual>Casual</Casual>
        <Cursive>Cursive</Cursive>
        <CourierNew>Courier New</CourierNew>
        <Georgia>Georgia</Georgia>
        <TimesNewRoman>TimesNewRoman</TimesNewRoman>
      </Stack>
    );
  };
  const CustomFontStackiOS = () => {
    return (
      <Stack style={stackStyle} gap={5}>
        <Arial>Arial</Arial>
        <Papyrus>Papyrus</Papyrus>
        <Helvetica>Helvetica</Helvetica>
        <CourierNew>Courier New</CourierNew>
        <Georgia>Georgia</Georgia>
        <TimesNewRoman>TimesNewRoman</TimesNewRoman>
      </Stack>
    );
  };

  switch (Platform.OS) {
    case 'android':
      return (
        <View>
          <CustomUsageStack />
          <CustomFontStackAndroid />
        </View>
      );
    case 'ios':
      return (
        <View>
          <CustomUsageStack />
          <CustomFontStackiOS />
        </View>
      );
    default:
      return (
        <View>
          <BlockText />
          <Text>{'\n'}</Text>
          <NonBlockText />
          <Text>{'\n'}</Text>
          <CustomUsageStack />
          <CustomFontStack />
        </View>
      );
  }
};
