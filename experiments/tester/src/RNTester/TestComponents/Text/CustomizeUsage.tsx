import * as React from 'react';
import { View } from 'react-native';
import { Stack } from '@fluentui-react-native/stack';
import { Text } from '@fluentui-react-native/text';
import { stackStyle } from '../../TesterStyles';
import { styles } from './styles';
import { useTheme } from '@uifabricshared/theming-react-native';

export const CustomizeUsage: React.FunctionComponent<{}> = () => {
  const theme = useTheme();

  const RedCaptionBold = Text.customize({ tokens: { fontVariant: 'captionStandard', fontWeight: 'bold', color: '#ff0000' } });
  const OrangeSecondaryBold = Text.customize({ tokens: { fontVariant: 'secondaryStandard', fontWeight: 'bold', color: '#ff9900' } });
  const YellowBodyBold = Text.customize({ tokens: { fontVariant: 'bodyStandard', fontWeight: 'bold', color: '#f3ce00' } });
  const GreenSubheaderBold = Text.customize({ tokens: { fontVariant: 'subheaderStandard', fontWeight: 'bold', color: '#02c440' } });
  const BlueHeaderBold = Text.customize({ tokens: { fontVariant: 'headerStandard', fontWeight: 'bold', color: '#0229c4' } });
  const IndigoHeroBold = Text.customize({ tokens: { fontVariant: 'heroStandard', fontWeight: 'bold', color: '#4b0082' } });
  const PurpleHeroLargeBold = Text.customize({ tokens: { fontVariant: 'heroLargeStandard', fontWeight: 'bold', color: '#8402c4' } });

  const ArialBlack = Text.customize({ tokens: { fontVariant: 'heroLargeStandard', fontFamily: 'Arial Black' } });
  const BrushScriptMT = Text.customize({ tokens: { fontVariant: 'heroStandard', fontFamily: 'Brush Script MT' } });
  const CourierNew = Text.customize({ tokens: { fontVariant: 'headerStandard', fontFamily: 'Courier New' } });
  const Georgia = Text.customize({ tokens: { fontVariant: 'subheaderStandard', fontFamily: 'Georgia' } });
  const SegoeScript = Text.customize({ tokens: { fontVariant: 'bodyStandard', fontFamily: 'Segoe Script' } });
  const TimesNewRoman = Text.customize({ tokens: { fontVariant: 'secondaryStandard', fontFamily: 'Times New Roman' } });
  const Wingdings = Text.customize({ tokens: { fontVariant: 'captionStandard', fontFamily: 'Wingdings' } });

  const LightText = Text.customize({
    tokens: {
      fontFamily: theme.typography.families.primary,
      fontWeight: theme.typography.weights.light,
      fontSize: theme.typography.sizes.hero
    }
  });
  const RegularText = Text.customize({
    tokens: {
      fontFamily: theme.typography.families.primary,
      fontWeight: theme.typography.weights.regular,
      fontSize: theme.typography.sizes.hero
    }
  });
  const SemiBoldText = Text.customize({
    tokens: {
      fontFamily: theme.typography.families.primary,
      fontWeight: theme.typography.weights.semiBold,
      fontSize: theme.typography.sizes.hero
    }
  });
  const BoldText = Text.customize({
    tokens: {
      fontFamily: theme.typography.families.primary,
      fontWeight: theme.typography.weights.bold,
      fontSize: theme.typography.sizes.hero
    }
  });

  return (
    <View style={styles.root}>
      <Stack style={stackStyle} gap={5}>
        <RedCaptionBold>RedCaptionBold</RedCaptionBold>
        <OrangeSecondaryBold>OrangeSecondaryBold</OrangeSecondaryBold>
        <YellowBodyBold>YellowBodyBold</YellowBodyBold>
        <GreenSubheaderBold>GreenSubheaderBold</GreenSubheaderBold>
        <BlueHeaderBold>BlueHeaderBold</BlueHeaderBold>
        <IndigoHeroBold>IndigoHeroBold</IndigoHeroBold>
        <PurpleHeroLargeBold>PurpleHeroLargeBold</PurpleHeroLargeBold>
      </Stack>

      <Stack style={stackStyle} gap={5}>
        <ArialBlack>Arial Black</ArialBlack>
        <BrushScriptMT>Brush Script MT</BrushScriptMT>
        <CourierNew>Courier New</CourierNew>
        <Georgia>Georgia</Georgia>
        <SegoeScript>Segoe Script</SegoeScript>
        <TimesNewRoman>TimesNewRoman</TimesNewRoman>
        <Wingdings>Wingdings</Wingdings>
      </Stack>

      <Stack style={stackStyle} gap={5}>
        <LightText>Light</LightText>
        <RegularText>Regular</RegularText>
        <SemiBoldText>Semibold</SemiBoldText>
        <BoldText>Bold</BoldText>
      </Stack>
    </View>
  );
};
