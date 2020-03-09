import * as React from 'react';
import { View } from 'react-native';
import { Stack } from 'react-native-uifabric';
import { Text } from '@fluentui-native/text';
import { useTheme } from '@uifabricshared/theming-react-native';
import { stackStyle } from '../../TesterStyles';
import { styles } from './styles';

export const CustomizeUsage: React.FunctionComponent<{}> = () => {
  const theme = useTheme();

  const SmallRedBold = Text.customize({ tokens: { fontVariant: 'smallStandard', fontWeight: 'bold', color: '#ff0000' } });
  const MediumOrangeBold = Text.customize({ tokens: { fontVariant: 'mediumStandard', fontWeight: 'bold', color: '#ff9900' } });
  const LargeYellowBold = Text.customize({ tokens: { fontVariant: 'largeStandard', fontWeight: 'bold', color: '#F3CE00' } });
  const ExtraLargeGreenBold = Text.customize({ tokens: { fontVariant: 'extraLargeStandard', fontWeight: 'bold', color: '#02c440' } });
  const HugeBlueBold = Text.customize({ tokens: { fontVariant: 'hugeStandard', fontWeight: 'bold', color: '#0229c4' } });
  const GiantPurpleBold = Text.customize({ tokens: { fontVariant: 'giantStandard', fontWeight: 'bold', color: '#8402c4' } });

  const ArialBlack = Text.customize({ tokens: { fontVariant: 'giantStandard', fontFamily: 'Arial Black' } });
  const BrushScriptMT = Text.customize({ tokens: { fontVariant: 'hugeStandard', fontFamily: 'Brush Script MT' } });
  const CourierNew = Text.customize({ tokens: { fontVariant: 'extraLargeStandard', fontFamily: 'Courier New' } });
  const Georgia = Text.customize({ tokens: { fontVariant: 'largeStandard', fontFamily: 'Georgia' } });
  const TimesNewRoman = Text.customize({ tokens: { fontVariant: 'mediumStandard', fontFamily: 'Times New Roman' } });
  const Wingdings = Text.customize({ tokens: { fontVariant: 'smallStandard', fontFamily: 'Wingdings' } });

  const LightText = Text.customize({
    tokens: {
      fontFamily: theme.typography.families.primary,
      fontWeight: theme.typography.weights.light,
      fontSize: theme.typography.sizes.xxxLarge
    }
  });
  const MediumText = Text.customize({
    tokens: {
      fontFamily: theme.typography.families.primary,
      fontWeight: theme.typography.weights.medium,
      fontSize: theme.typography.sizes.xxxLarge
    }
  });
  const SemiBoldText = Text.customize({
    tokens: {
      fontFamily: theme.typography.families.primary,
      fontWeight: theme.typography.weights.semiBold,
      fontSize: theme.typography.sizes.xxxLarge
    }
  });
  const BoldText = Text.customize({
    tokens: {
      fontFamily: theme.typography.families.primary,
      fontWeight: theme.typography.weights.bold,
      fontSize: theme.typography.sizes.xxxLarge
    }
  });
  return (
    <View style={styles.root}>
      <Stack style={stackStyle} gap={5}>
        <SmallRedBold>SmallRedBold</SmallRedBold>
        <MediumOrangeBold>MediumOrangeBold</MediumOrangeBold>
        <LargeYellowBold>LargeYellowBold</LargeYellowBold>
        <ExtraLargeGreenBold>ExtraLargeGreenBold</ExtraLargeGreenBold>
        <HugeBlueBold>HugeBlueBold</HugeBlueBold>
        <GiantPurpleBold>GiantPurpleBold</GiantPurpleBold>
      </Stack>

      <Stack style={stackStyle} gap={5}>
        <ArialBlack>Arial Black</ArialBlack>
        <BrushScriptMT>Brush Script MT</BrushScriptMT>
        <CourierNew>Courier New</CourierNew>
        <Georgia>Georgia</Georgia>
        <TimesNewRoman>TimesNewRoman</TimesNewRoman>
        <Wingdings>Wingdings</Wingdings>
      </Stack>

      <Stack style={stackStyle} gap={5}>
        <LightText>LightText</LightText>
        <MediumText>MediumText</MediumText>
        <SemiBoldText>SemiBoldText</SemiBoldText>
        <BoldText>BoldText</BoldText>
      </Stack>
    </View>
  );
};
