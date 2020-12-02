import * as React from 'react';
import { Alert, Linking, View } from 'react-native';
import { Stack } from '@fluentui-react-native/stack';
import { Text } from '@fluentui/react-native';
import { stackStyle } from '../Common/styles';
import { IKeyboardEvent, IHandledKeyboardEvent } from '@office-iss/react-native-win32';

export const CustomizeUsage: React.FunctionComponent<{}> = () => {
  const RedCaptionBold = Text.customize({ tokens: { variant: 'captionStandard', fontWeight: '700', color: '#ff0000' } });
  const OrangeSecondaryBold = Text.customize({ tokens: { variant: 'secondaryStandard', fontWeight: '700', color: '#ff9900' } });
  const YellowBodyBold = Text.customize({ tokens: { variant: 'bodyStandard', fontWeight: '700', color: '#f3ce00' } });
  const GreenSubheaderBold = Text.customize({ tokens: { variant: 'subheaderStandard', fontWeight: '700', color: '#02c440' } });
  const BlueHeaderBold = Text.customize({ tokens: { variant: 'headerStandard', fontWeight: '700', color: '#0229c4' } });
  const IndigoHeroBold = Text.customize({ tokens: { variant: 'heroStandard', fontWeight: '700', color: '#4b0082' } });
  const PurpleHeroLargeBold = Text.customize({ tokens: { variant: 'heroLargeStandard', fontWeight: '700', color: '#8402c4' } });

  const ArialBlack = Text.customize({ tokens: { variant: 'heroLargeStandard', fontFamily: 'Arial Black' } });
  const BrushScriptMT = Text.customize({ tokens: { variant: 'heroStandard', fontFamily: 'Brush Script MT' } });
  const CourierNew = Text.customize({ tokens: { variant: 'headerStandard', fontFamily: 'Courier New' } });
  const Georgia = Text.customize({ tokens: { variant: 'subheaderStandard', fontFamily: 'Georgia' } });
  const TimesNewRoman = Text.customize({ tokens: { variant: 'secondaryStandard', fontFamily: 'Times New Roman' } });
  const Wingdings = Text.customize({ tokens: { variant: 'captionStandard', fontFamily: 'Wingdings' } });

  const _onPress = (): void => {
    Linking.openURL('www.microsoft.com');
  };

  const _onKeyDown = (ev: IKeyboardEvent) => {
    if (ev.nativeEvent.key === 'Enter' || ev.nativeEvent.key == 'Space') Linking.openURL('www.microsoft.com');
  };

  const _onPress2 = (): void => {
    Alert.alert('Alert', 'Success!');
  };

  const _onKeyDown2 = (ev: IKeyboardEvent) => {
    if (ev.nativeEvent.key === 'Enter' || ev.nativeEvent.key == ' ') Alert.alert('Alert', 'Success!');
  };

  const handledNativeKeyboardEvents: IHandledKeyboardEvent[] = [{ key: 'Enter' }, { key: 'Space' }];

  return (
    <View>
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
        <TimesNewRoman>TimesNewRoman</TimesNewRoman>
        <Wingdings>Wingdings</Wingdings>
      </Stack>

      <Stack style={stackStyle} gap={5}>
        <Text variant={'bodyStandard'}>
          To learn more about microsoft, visit this{' '}
          <Text variant={'bodyStandard'} color="blue" keyDownEvents={handledNativeKeyboardEvents} onPress={_onPress} onKeyDown={_onKeyDown}>
            webpage
          </Text>{' '}
          for more details.
        </Text>
        <Text variant={'bodyStandard'}>
          Press{' '}
          <Text
            variant={'bodyStandard'}
            color="blue"
            keyDownEvents={handledNativeKeyboardEvents}
            onPress={_onPress2}
            onKeyDown={_onKeyDown2}
          >
            here
          </Text>{' '}
          to view an alert.
        </Text>
      </Stack>
    </View>
  );
};
