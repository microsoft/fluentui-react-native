import * as React from 'react';
import { View } from 'react-native';
import { Stack } from '@fluentui-react-native/stack';
import { Text } from '@fluentui-react-native/text';
import { stackStyle } from '../Common/styles';
import { styles } from './styles';

export const CustomizeUsage: React.FunctionComponent<{}> = () => {
  const RedCaptionBold = Text.customize({ tokens: { variant: 'captionStandard', fontWeight: 'semiBold', color: '#ff0000' } });
  const OrangeSecondaryBold = Text.customize({ tokens: { variant: 'secondaryStandard', fontWeight: 'semiBold', color: '#ff9900' } });
  const YellowBodyBold = Text.customize({ tokens: { variant: 'bodyStandard', fontWeight: 'semiBold', color: '#f3ce00' } });
  const GreenSubheaderBold = Text.customize({ tokens: { variant: 'subheaderStandard', fontWeight: 'semiBold', color: '#02c440' } });
  const BlueHeaderBold = Text.customize({ tokens: { variant: 'headerStandard', fontWeight: 'semiBold', color: '#0229c4' } });
  const IndigoHeroBold = Text.customize({ tokens: { variant: 'heroStandard', fontWeight: 'semiBold', color: '#4b0082' } });
  const PurpleHeroLargeBold = Text.customize({ tokens: { variant: 'heroLargeStandard', fontWeight: 'semiBold', color: '#8402c4' } });

  const ArialBlack = Text.customize({ tokens: { variant: 'heroLargeStandard', fontFamily: 'Arial Black' } });
  const BrushScriptMT = Text.customize({ tokens: { variant: 'heroStandard', fontFamily: 'Brush Script MT' } });
  const CourierNew = Text.customize({ tokens: { variant: 'headerStandard', fontFamily: 'Courier New' } });
  const Georgia = Text.customize({ tokens: { variant: 'subheaderStandard', fontFamily: 'Georgia' } });
  const SegoeScript = Text.customize({ tokens: { variant: 'bodyStandard', fontFamily: 'Segoe Script' } });
  const TimesNewRoman = Text.customize({ tokens: { variant: 'secondaryStandard', fontFamily: 'Times New Roman' } });
  const Wingdings = Text.customize({ tokens: { variant: 'captionStandard', fontFamily: 'Wingdings' } });

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
    </View>
  );
};
