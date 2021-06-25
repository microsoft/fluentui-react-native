import * as React from 'react';
import { PersonaCoin, IPersonaCoinTokens } from '@fluentui/react-native';
import { Switch, View, Text, TextInput } from 'react-native';
import Slider from '@react-native-community/slider';
import { steveBallmerPhotoUrl, undefinedText } from './styles';
import { commonTestStyles as commonStyles } from '../Common/styles';
import { useTheme } from '@fluentui-react-native/theme-types';

type WithUndefined<T> = T | typeof undefinedText;

const StyledSlider = (props) => {
  const { title, min, max, initial, onChange, current, step } = props;
  const theme = useTheme();
  return (
    <View style={{ flexDirection: 'row' }}>
      <Text style={{ flex: 0.5, color: theme.colors.inputText }}>{title}</Text>
      <Slider
        step={step || 1}
        minimumValue={min}
        maximumValue={max}
        value={initial}
        style={[commonStyles.vmargin, { flex: 1 }]}
        onValueChange={onChange}
      />
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
  return <TextInput style={textInputStyles} placeholderTextColor={theme.colors.disabledBodyText} blurOnSubmit={true} {...props} />;
};

const StyledSwitch = (props) => {
  const { title, value, onChange } = props;
  const theme = useTheme();
  return (
    <View style={commonStyles.switch}>
      <Text style={{ color: theme.colors.inputText, flex: 1 }}>{title}</Text>
      <Switch style={{ flex: 1 }} value={value} onValueChange={onChange} />
    </View>
  );
};

export const CustomizeUsage: React.FunctionComponent<{}> = () => {
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

  const tokens: Partial<IPersonaCoinTokens> = {};
  const CustomizedPersonaCoin = PersonaCoin.customize({ tokens });

  if (coinColor) {
    tokens.backgroundColor = coinColor;
  }
  if (textColor) {
    tokens.color = textColor;
  }
  if (showRings) {
    tokens.ring = { ringColor: 'red' };
  }
  if (coinSize) {
    tokens.coinSize = coinSize;
  }
  if (iconSize) {
    tokens.iconSize = iconSize;
  }
  if (iconStrokeWidth) {
    tokens.iconStrokeWidth = iconStrokeWidth;
  }

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
          <StyledSwitch title="Change Background" value={showColoredBackground} onChange={setShowColoredBackground} />
          <StyledSwitch title="Show Image" value={showImage} onChange={setShowImage} />
          <StyledSwitch title="Show Presence" value={showPresence} onChange={setShowPresence} />
          <StyledSwitch title="Show Rings" value={showRings} onChange={setShowRings} />
          <StyledSwitch title="Show transparent rings" value={transparent} onChange={setTransparent} />
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
