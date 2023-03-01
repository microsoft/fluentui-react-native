import * as React from 'react';
import { StyleSheet, View, TextInput } from 'react-native';
import { Divider } from '@fluentui-react-native/divider';
import { RadioGroup, Radio } from '@fluentui-react-native/experimental-radio-group';
import { Stack } from '@fluentui-react-native/stack';
import { Switch } from '@fluentui-react-native/switch';
import { TextV1 as Text } from '@fluentui-react-native/text';
import { useFluentTheme } from '@fluentui-react-native/framework';
import { commonTestStyles } from '../Common/styles';
import type { DividerAlignment, DividerAppearance, DividerProps, DividerTokens } from '@fluentui-react-native/divider';
import { defaultTokens } from '@fluentui-react-native/divider/src/DividerTokens';
import { IconPropsV1 } from '@fluentui-react-native/icon';

import TestSvg from '../../../assets/test.svg';

const CustomSwitch = Switch.customize({
  variant: 'subheaderSemibold',
});

const bugBashStyles = StyleSheet.create({
  inputFieldView: {
    padding: 4,
    borderWidth: 1,
    borderStyle: 'solid',
    flex: 1,
    marginVertical: 4,
  },
  inputFieldText: {
    marginRight: 8,
    flex: 0,
    flexDirection: 'column',
    alignContent: 'center',
    justifyContent: 'center',
  },
  inputFieldFlex: {
    flexDirection: 'row',
  },
  dividerContainer: {
    marginVertical: 8,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  formContainer: {
    marginHorizontal: 4,
    padding: 8,
    borderStyle: 'solid',
    borderWidth: 1,
  },
});

interface TextFieldProps {
  initialValue?: string;
  label?: string;
  placeholder?: string;
  onBlur?: (val: string) => void;
  onChange?: (val: string) => void;
}

const InputField: React.FunctionComponent<TextFieldProps> = ({ label, placeholder, initialValue, onBlur }) => {
  const theme = useFluentTheme();

  const [text, setText] = React.useState(initialValue ?? '');

  const handleBlur = React.useCallback(() => {
    if (onBlur) {
      onBlur(text);
    }
  }, [onBlur, text]);

  const field = (
    <View
      style={[
        bugBashStyles.inputFieldView,
        {
          backgroundColor: theme.colors.inputBackground,
          borderColor: theme.colors.inputBorder,
        },
      ]}
    >
      <TextInput placeholder={placeholder} value={text} onChangeText={setText} onBlur={handleBlur} />
    </View>
  );
  if (label) {
    return (
      <View style={bugBashStyles.inputFieldFlex}>
        <View style={bugBashStyles.inputFieldText}>
          <Text align="center" block variant="subheaderSemibold">
            {label}
          </Text>
        </View>
        {field}
      </View>
    );
  } else {
    return field;
  }
};

const FormContainer: React.FunctionComponent = ({ children }) => {
  const theme = useFluentTheme();
  return <View style={[bugBashStyles.formContainer, { borderColor: theme.colors.neutralStroke2 }]}>{children}</View>;
};

const numKeys: readonly (keyof DividerTokens)[] = [
  'flexAfter',
  'flexBefore',
  'minLineSize',
  'thickness',
  'fontLineHeight',
  'fontLetterSpacing',
] as const;
const stringOrNumKeys: readonly (keyof DividerTokens)[] = [
  'contentPadding',
  'minWidth',
  'maxWidth',
  'minHeight',
  'maxHeight',
  'padding',
  'paddingHorizontal',
  'paddingVertical',
  'paddingStart',
  'paddingEnd',
] as const;

export const BugBashDivider: React.FunctionComponent = () => {
  // misc settings
  const [wrapperViewHeight, setWrapperViewHeight] = React.useState(100);
  const [iconSize, setIconSize] = React.useState(24);

  const handleWrapperViewHeightBlur = React.useCallback(
    (val: string) => {
      const casted = parseInt(val);
      if (!isNaN(casted)) {
        setWrapperViewHeight(casted);
      }
    },
    [setWrapperViewHeight],
  );

  const handleIconSizeBlur = React.useCallback(
    (val: string) => {
      const casted = parseInt(val);
      if (!isNaN(casted)) {
        setIconSize(casted);
      }
    },
    [setIconSize],
  );

  // props
  const [alignContent, setAlignContent] = React.useState<DividerAlignment>('center');
  const [appearance, setAppearance] = React.useState<DividerAppearance>('default');
  const [icon, setIcon] = React.useState<IconPropsV1 | null>(null);
  const [insetSize, setInsetSize] = React.useState('0');
  const [text, setText] = React.useState('');
  const [vertical, setVertical] = React.useState(false);

  const dividerProps = React.useMemo<DividerProps>(() => {
    const ret: DividerProps = {
      alignContent,
      appearance,
      vertical,
      insetSize: parseInt(insetSize) as any,
    };
    if (icon) {
      ret.icon = icon;
    }
    return ret;
  }, [alignContent, appearance, icon, insetSize, vertical]);

  const onVerticalChange = React.useCallback((_, val: boolean) => setVertical(val), [setVertical]);

  const onIconChange = React.useCallback(
    (val: string) => {
      let icon: IconPropsV1 | null = null;
      if (val === 'font') {
        icon = {
          fontSource: {
            fontFamily: 'Arial',
            codepoint: 0x2663,
            fontSize: iconSize,
            color: '#f09',
          },
        };
      } else if (val === 'svg') {
        icon = {
          svgSource: {
            viewBox: '0 0 500 500',
            src: TestSvg,
            width: iconSize,
            height: iconSize,
          },
        };
      }
      setIcon(icon);
    },
    [setIcon, iconSize],
  );

  // tokens
  const [tokens, setTokens] = React.useState<DividerTokens>({});

  const useTokenBlurHandler = (key: keyof DividerTokens) =>
    React.useCallback(
      (val: string) => {
        if (val) {
          if (stringOrNumKeys.includes(key)) {
            let casted: string | number = parseInt(val);
            casted = isNaN(casted) ? val : casted;
            setTokens((prev) => ({ ...prev, [key]: casted }));
          } else if (numKeys.includes(key)) {
            const casted = parseInt(val);
            if (!isNaN(casted)) {
              setTokens((prev) => ({ ...prev, [key]: casted }));
            }
          } else {
            setTokens((prev) => ({ ...prev, [key]: val }));
          }
        } else {
          setTokens((prev) => {
            delete prev[key];
            return { ...prev };
          });
        }
      },
      [key],
    );

  const onContentColorBlur = useTokenBlurHandler('contentColor');
  const onContentPaddingBlur = useTokenBlurHandler('contentPadding');
  const onFlexAfterBlur = useTokenBlurHandler('flexAfter');
  const onFlexBeforeBlur = useTokenBlurHandler('flexBefore');
  const onLineColorBlur = useTokenBlurHandler('lineColor');
  const onMinLineSizeBlur = useTokenBlurHandler('minLineSize');
  const onThicknessBlur = useTokenBlurHandler('thickness');
  // layout
  const onMinWidthBlur = useTokenBlurHandler('minWidth');
  const onMaxWidthBlur = useTokenBlurHandler('maxWidth');
  const onMinHeightBlur = useTokenBlurHandler('minHeight');
  const onMaxHeightBlur = useTokenBlurHandler('maxHeight');
  const onPaddingBlur = useTokenBlurHandler('padding');
  const onPaddingHorizontalBlur = useTokenBlurHandler('paddingHorizontal');
  const onPaddingVerticalBlur = useTokenBlurHandler('paddingVertical');
  const onPaddingStartBlur = useTokenBlurHandler('paddingStart');
  const onPaddingEndBlur = useTokenBlurHandler('paddingEnd');
  // font
  const onFontFamilyBlur = useTokenBlurHandler('fontFamily');
  const onFontSizeBlur = useTokenBlurHandler('fontSize');
  const onFontWeightBlur = useTokenBlurHandler('fontWeight');
  const onFontLineHeightBlur = useTokenBlurHandler('fontLineHeight');
  const onFontLetterSpacingBlur = useTokenBlurHandler('fontLetterSpacing');
  const onFontStyleBlur = useTokenBlurHandler('fontStyle');
  const onTextDecorationLineBlur = useTokenBlurHandler('textDecorationLine');
  const onVariantBlur = useTokenBlurHandler('variant');

  const CustomDivider = React.useMemo(() => Divider.customize(tokens), [tokens]);

  return (
    <Stack style={commonTestStyles.stack}>
      <Text variant="headerStandard">Customized Divider</Text>
      <View style={[bugBashStyles.dividerContainer, { height: wrapperViewHeight }]}>
        {text ? <CustomDivider {...dividerProps}>{text}</CustomDivider> : <CustomDivider {...dividerProps} />}
      </View>
      <Text variant="headerStandard">Miscellaneous</Text>
      <FormContainer>
        <InputField label="Wrapper View Height" initialValue={wrapperViewHeight.toString(10)} onBlur={handleWrapperViewHeightBlur} />
        <InputField label="Icon Size" initialValue={iconSize.toString(10)} onBlur={handleIconSizeBlur} />
      </FormContainer>
      <Text variant="headerStandard">Divider Props</Text>
      <FormContainer>
        <RadioGroup layout="horizontal" label="Align Content" value={alignContent} onChange={setAlignContent as any}>
          <Radio label="Start" value="start" />
          <Radio label="Center" value="center" />
          <Radio label="End" value="end" />
        </RadioGroup>
        <RadioGroup layout="horizontal" label="Appearance" value={appearance} onChange={setAppearance as any}>
          <Radio label="Default" value="default" />
          <Radio label="Strong" value="strong" />
          <Radio label="Brand" value="brand" />
          <Radio label="Subtle" value="subtle" />
        </RadioGroup>
        <InputField label="Children" placeholder="Enter Divider text here." onBlur={setText} />
        <RadioGroup layout="horizontal" label="Icon" defaultValue="none" onChange={onIconChange}>
          <Radio label="None" value="none" />
          <Radio label="Show Font Icon" value="font" />
          <Radio label="Show SVG Icon" value="svg" />
        </RadioGroup>
        <RadioGroup layout="horizontal" label="Inset" value={insetSize} onChange={setInsetSize}>
          <Radio label="0" value="0" />
          <Radio label="16" value="16" />
          <Radio label="56" value="56" />
          <Radio label="68" value="68" />
          <Radio label="72" value="72" />
          <Radio label="108" value="108" />
        </RadioGroup>
        <CustomSwitch labelPosition="before" label="Vertical" checked={vertical} onChange={onVerticalChange} />
      </FormContainer>
      <Text variant="headerStandard">Divider Tokens</Text>
      <FormContainer>
        <Text variant="subheaderStandard">Core Tokens</Text>
        <Divider />
        <InputField label="Content Color" placeholder="Enter content color here." onBlur={onContentColorBlur} />
        <InputField label="Content Padding" placeholder="Enter content padding here." onBlur={onContentPaddingBlur} />
        <InputField label="Flex After" placeholder="Enter 'after' line flex here." onBlur={onFlexAfterBlur} />
        <InputField label="Flex Before" placeholder="Enter 'before' line flex here." onBlur={onFlexBeforeBlur} />
        <InputField label="Line Color" placeholder="Enter line color here." onBlur={onLineColorBlur} />
        <InputField label="Minimum Line Size" placeholder="Enter minimum line size here." onBlur={onMinLineSizeBlur} />
        <InputField label="Thickness" placeholder="Enter thickness here." onBlur={onThicknessBlur} />
        <Text variant="subheaderStandard">Layout Tokens</Text>
        <Divider />
        <InputField label="Min Width" placeholder="Enter min width here." onBlur={onMinWidthBlur} />
        <InputField label="Max Width" placeholder="Enter max width here." onBlur={onMaxWidthBlur} />
        <InputField label="Min Height" placeholder="Enter min height here." onBlur={onMinHeightBlur} />
        <InputField label="Max Height" placeholder="Enter max height here." onBlur={onMaxHeightBlur} />
        <InputField label="Padding" placeholder="Enter padding here." onBlur={onPaddingBlur} />
        <InputField label="Padding Horizontal" placeholder="Enter horizontal padding here." onBlur={onPaddingHorizontalBlur} />
        <InputField label="Padding Vertical" placeholder="Enter vertical padding here." onBlur={onPaddingVerticalBlur} />
        <InputField label="Padding Start" placeholder="Enter start padding here." onBlur={onPaddingStartBlur} />
        <InputField label="Padding End" placeholder="Enter end padding here." onBlur={onPaddingEndBlur} />
        <Text variant="subheaderStandard">Layout Tokens</Text>
        <Divider />
        <InputField label="Font Family" placeholder="Enter Font Family here." onBlur={onFontFamilyBlur} />
        <InputField label="Font Size" placeholder="Enter Font Size here." onBlur={onFontSizeBlur} />
        <InputField label="Font Weight" placeholder="Enter Font Weight here." onBlur={onFontWeightBlur} />
        <InputField label="Font Line Height" placeholder="Enter Font Line Height here." onBlur={onFontLineHeightBlur} />
        <InputField label="Font Letter Spacing" placeholder="Enter Font Letter Spacing here." onBlur={onFontLetterSpacingBlur} />
        <RadioGroup layout="horizontal" label="Font Style" onChange={onFontStyleBlur}>
          <Radio label="Normal" value="normal" />
          <Radio label="Italic" value="italic" />
        </RadioGroup>
        <RadioGroup layout="horizontal" label="Text Decoration Line" onChange={onTextDecorationLineBlur}>
          <Radio label="Normal" value="normal" />
          <Radio label="Underline" value="underline" />
          <Radio label="Line-through" value="line-through" />
          <Radio label="Underline Line-through" value="underline line-through" />
        </RadioGroup>
        <RadioGroup layout="vertical" label="Variant" onChange={onVariantBlur}>
          <Radio label="captionStandard" value="captionStandard" />
          <Radio label="secondaryStandard" value="secondaryStandard" />
          <Radio label="secondarySemibold" value="secondarySemibold" />
          <Radio label="bodyStandard" value="bodyStandard" />
          <Radio label="bodySemibold" value="bodySemibold" />
          <Radio label="subheaderStandard" value="subheaderStandard" />
          <Radio label="subheaderSemibold" value="subheaderSemibold" />
          <Radio label="headerStandard" value="headerStandard" />
          <Radio label="headerSemibold" value="headerSemibold" />
          <Radio label="heroStandard" value="heroStandard" />
          <Radio label="heroSemibold" value="heroSemibold" />
          <Radio label="heroLargeStandard" value="heroLargeStandard" />
          <Radio label="heroLargeSemibold" value="heroLargeSemibold" />
          <Radio label="caption1" value="caption1" />
          <Radio label="caption1Strong" value="caption1Strong" />
          <Radio label="caption2" value="caption2" />
          <Radio label="body1" value="body1" />
          <Radio label="body1Strong" value="body1Strong" />
          <Radio label="body2" value="body2" />
          <Radio label="body2Strong" value="body2Strong" />
          <Radio label="subtitle1" value="subtitle1" />
          <Radio label="subtitle1Strong" value="subtitle1Strong" />
          <Radio label="subtitle2" value="subtitle2" />
          <Radio label="subtitle2Strong" value="subtitle2Strong" />
          <Radio label="title1" value="title1" />
          <Radio label="title1Strong" value="title1Strong" />
          <Radio label="title2" value="title2" />
          <Radio label="title3" value="title3" />
          <Radio label="largeTitle" value="largeTitle" />
          <Radio label="display" value="display" />
        </RadioGroup>
      </FormContainer>
    </Stack>
  );
};
