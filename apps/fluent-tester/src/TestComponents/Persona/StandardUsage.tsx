import * as React from 'react';
import { Persona, PersonaSize } from '@fluentui/react-native';
import { rajeshImageUrl } from './styles';
import { commonTestStyles as commonStyles } from '../Common/styles';
import { View } from 'react-native';
import { undefinedText } from '../PersonaCoin/styles';
import { MenuPicker } from '../Common/MenuPicker';
import { Switch } from '@fluentui-react-native/switch';
import { InteractionEvent } from '@fluentui-react-native/interactive-hooks';

type WithUndefined<T> = T | typeof undefinedText;

const allSizes: WithUndefined<PersonaSize>[] = [
  undefinedText,
  'size8',
  'size24',
  'size32',
  'size40',
  'size48',
  'size56',
  'size72',
  'size100',
  'size120',
];

const allSizesCollection = allSizes.map((size) => {
  return {
    label: size,
    value: size,
  };
});

export const StandardUsage: React.FunctionComponent = () => {
  const [showImage, setShowImage] = React.useState(true);
  const [showPrimary, setShowPrimary] = React.useState(true);
  const [showSecondary, setShowSecondary] = React.useState(true);
  const [showTertiary, setShowTertiary] = React.useState(true);
  const [showOptional, setShowOptional] = React.useState(true);
  const [imageSize, setImageSize] = React.useState<PersonaSize | undefined>('size72');

  const onSetShowImage = (_e: InteractionEvent, value: boolean) => {
    setShowImage(value);
  };

  const onSetShowPrimary = (_e: InteractionEvent, value: boolean) => {
    setShowPrimary(value);
  };

  const onSetShowSecondary = (_e: InteractionEvent, value: boolean) => {
    setShowSecondary(value);
  };

  const onSetShowTertiary = (_e: InteractionEvent, value: boolean) => {
    setShowTertiary(value);
  };

  const onSetShowOptional = (_e: InteractionEvent, value: boolean) => {
    setShowOptional(value);
  };

  return (
    <View style={commonStyles.root}>
      {/* settings */}
      <View style={commonStyles.settings}>
        <Switch label="Show image" checked={showImage} onChange={onSetShowImage} />
        <Switch label="Show primary text" checked={showPrimary} onChange={onSetShowPrimary} />
        <Switch label="Show secondary text" checked={showSecondary} onChange={onSetShowSecondary} />
        <Switch label="Show tertiary text" checked={showTertiary} onChange={onSetShowTertiary} />
        <Switch label="Show optional text" checked={showOptional} onChange={onSetShowOptional} />
        <MenuPicker
          prompt="Size"
          style={commonStyles.header}
          selected={imageSize || undefinedText}
          onChange={(size: PersonaSize | typeof undefinedText) => setImageSize(size === undefinedText ? undefined : size)}
          collection={allSizesCollection}
        />
      </View>

      <Persona
        text={showPrimary ? 'Rajesh Jha' : undefined}
        secondaryText={showSecondary ? 'Executive Vice President' : undefined}
        tertiaryText={showTertiary ? 'E & D' : undefined}
        optionalText={showOptional ? 'Building 36/5600' : undefined}
        size={imageSize}
        initials="RJ"
        imageUrl={showImage ? rajeshImageUrl : undefined}
        imageDescription="Profile photo of Rajesh Jha"
        presence={'away'}
      />
    </View>
  );
};
