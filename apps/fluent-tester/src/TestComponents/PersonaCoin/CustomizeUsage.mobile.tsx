import * as React from 'react';
import { PersonaCoin } from '@fluentui/react-native';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { steveBallmerPhotoUrl, undefinedText } from './styles';
import { commonTestStyles as commonStyles } from '../Common/styles';
import { useTheme } from '@fluentui-react-native/theme-types';
import { Switch } from '@fluentui-react-native/switch';
import { InteractionEvent } from '@fluentui-react-native/interactive-hooks';

type WithUndefined<T> = T | typeof undefinedText;

const styles = StyleSheet.create({ slider: { ...commonStyles.vmargin, flex: 1 } });

const StyledSlider = (props) => {
  const { title, min, max, initial, onChange, current, step } = props;
  const theme = useTheme();
  return (
    <View style={{ flexDirection: 'row' }}>
      <Text style={{ flex: 0.5, color: theme.colors.inputText }}>{title}</Text>
      <Slider step={step || 1} minimumValue={min} maximumValue={max} value={initial} style={styles.slider} onValueChange={onChange} />
      <Text style={{ flex: 0.2, color: theme.colors.inputText }}>{current}</Text>
    </View>
  );
};

const StyledTextInput = (props) => {
  const theme = useTheme();
  const textInputStyles = [
    commonStyles.textBox,
    { flex: 1, marginHorizontal: 5, borderColor: theme.colors.disabledBodyText, color: theme.colors.inputText },
  ];
  return (
    <TextInput
      accessibilityLabel={props.placeholder}
      style={textInputStyles}
      placeholderTextColor={theme.colors.disabledBodyText}
      blurOnSubmit={true}
      {...props}
    />
  );
};

export const CustomizeUsage: React.FunctionComponent = () => {
  const [showImage, setShowImage] = React.useState(true);
  const [showRings, setShowRings] = React.useState(true);
  const [showPresence, setShowPresence] = React.useState(true);
  const [showColoredBackground, setShowColoredBackground] = React.useState(false);
  const [transparent, setTransparent] = React.useState(false);
  const [coinColor, setCoinColor] = React.useState<WithUndefined<string>>('green');
  const [textColor, setTextColor] = React.useState<WithUndefined<string>>('white');
  const [coinSize, setCoinsize] = React.useState<number>(88);
  const [ringThickness, setRingThickness] = React.useState<number>(4);
  const [innerGap, setInnerGap] = React.useState<number>(4);
  const [iconSize, setIconSize] = React.useState<number>(20);
  const [iconStrokeWidth, setIconStrokeWidth] = React.useState<number>(4);
  const [ringColor, setRingColor] = React.useState<string>('green');
  const [ringBackgroundColor, setRingBackgroundColor] = React.useState<string>(undefined);

  const CustomizedPersonaCoin = React.useMemo(() => {
    const tokens = {
      backgroundColor: coinColor,
      color: textColor,
      ring: { ringColor: 'red' },
      coinSize: coinSize,
      iconSize: iconSize,
      iconStrokeWidth: iconStrokeWidth,
    };
    return PersonaCoin.customize({ tokens });
  }, [coinColor, textColor, coinSize, iconSize, iconStrokeWidth]);

  const onSetShowColoredBackground = (_e: InteractionEvent, value: boolean) => {
    setShowColoredBackground(value);
  };

  const onSetShowImage = (_e: InteractionEvent, value: boolean) => {
    setShowImage(value);
  };

  const onSetShowPresence = (_e: InteractionEvent, value: boolean) => {
    setShowPresence(value);
  };

  const onSetShowRings = (_e: InteractionEvent, value: boolean) => {
    setShowRings(value);
  };

  const onSetTransparent = (_e: InteractionEvent, value: boolean) => {
    setTransparent(value);
  };

  return (
    <View style={{ flexDirection: 'column', padding: 10, backgroundColor: showColoredBackground ? 'gray' : 'transparent' }}>
      {/* component under test */}
      <View style={{ flexDirection: 'row', padding: 20, alignItems: 'center' }}>
        <View style={{ width: '35%', alignItems: 'center' }}>
          <CustomizedPersonaCoin
            initials="SB"
            imageDescription="Photo of Satya Nadella"
            imageUrl={showImage ? steveBallmerPhotoUrl : undefined}
            presence={showPresence && iconSize ? 'away' : undefined}
            ring={
              showRings && ringThickness
                ? {
                    ringColor,
                    ringBackgroundColor,
                    ringThickness,
                    innerGap,
                    transparent,
                  }
                : undefined
            }
          />
        </View>
        {/** Switch settings */}
        <View style={{ width: '50%', marginLeft: 30 }}>
          <Switch label="Change Background" checked={showColoredBackground} onChange={onSetShowColoredBackground} />
          <Switch label="Show Image" checked={showImage} onChange={onSetShowImage} />
          <Switch label="Show Presence" checked={showPresence} onChange={onSetShowPresence} />
          <Switch label="Show Rings" checked={showRings} onChange={onSetShowRings} />
          <Switch label="Show transparent rings" checked={transparent} onChange={onSetTransparent} />
        </View>
      </View>

      {/** settings section */}
      <View>
        <StyledSlider min={8} max={120} initial={88} onChange={setCoinsize} current={coinSize} step={8} title="coinSize" />
        <StyledSlider min={0} max={8} initial={4} onChange={setRingThickness} current={ringThickness} title="ringThickness" />
        <StyledSlider min={0} max={8} initial={4} onChange={setInnerGap} current={innerGap} title="innerGap" />
        <StyledSlider min={0} max={28} initial={20} onChange={setIconSize} current={iconSize} step={4} title="iconSize" />
        <StyledSlider min={2} max={8} initial={4} onChange={setIconStrokeWidth} current={iconStrokeWidth} title="iconStrokeWidth" />

        <View style={{ flexDirection: 'row' }}>
          <StyledTextInput
            placeholder="Ring glow color"
            onSubmitEditing={(e) => {
              setRingColor(e.nativeEvent.text);
            }}
          />

          <StyledTextInput
            placeholder="Ring background color"
            onSubmitEditing={(e) => {
              setRingBackgroundColor(e.nativeEvent.text);
            }}
          />
        </View>

        <View style={{ flexDirection: 'row' }}>
          <StyledTextInput
            placeholder="Background color"
            onSubmitEditing={(e) => {
              setCoinColor(e.nativeEvent.text);
            }}
          />

          <StyledTextInput
            placeholder="Initials text color"
            onSubmitEditing={(e) => {
              setTextColor(e.nativeEvent.text);
            }}
          />
        </View>
      </View>
    </View>
  );
};
