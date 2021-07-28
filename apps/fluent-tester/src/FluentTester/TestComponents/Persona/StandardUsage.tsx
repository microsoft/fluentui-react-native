import * as React from 'react';
import { Persona, PersonaSize } from '@fluentui/react-native';
import { rajeshImageUrl } from './styles';
import { commonTestStyles as commonStyles } from '../Common/styles';
import { View, Text, Switch, Picker } from 'react-native';
import { undefinedText } from '../PersonaCoin/styles';

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

interface ISwitchWithLabelProps {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

function SwitchWithLabel(props: ISwitchWithLabelProps): React.ReactElement {
  const { label, value, onValueChange } = props;
  return (
    <View style={commonStyles.switch}>
      <Text>{label}</Text>
      <Switch value={value} onValueChange={onValueChange} />
    </View>
  );
}

export const StandardUsage: React.FunctionComponent = () => {
  const [showImage, setShowImage] = React.useState(true);
  const [showPrimary, setShowPrimary] = React.useState(true);
  const [showSecondary, setShowSecondary] = React.useState(true);
  const [showTertiary, setShowTertiary] = React.useState(true);
  const [showOptional, setShowOptional] = React.useState(true);
  const [imageSize, setImageSize] = React.useState<PersonaSize | undefined>('size72');

  return (
    <View style={commonStyles.root}>
      {/* settings */}
      <View style={commonStyles.settings}>
        <SwitchWithLabel label="Show image" value={showImage} onValueChange={setShowImage} />
        <SwitchWithLabel label="Show primary text" value={showPrimary} onValueChange={setShowPrimary} />
        <SwitchWithLabel label="Show secondary text" value={showSecondary} onValueChange={setShowSecondary} />
        <SwitchWithLabel label="Show tertiary text" value={showTertiary} onValueChange={setShowTertiary} />
        <SwitchWithLabel label="Show optional text" value={showOptional} onValueChange={setShowOptional} />

        <Picker
          prompt="Size"
          style={commonStyles.header}
          selectedValue={imageSize || undefinedText}
          onValueChange={size => setImageSize(size === undefinedText ? undefined : size)}
        >
          {allSizes.map((size, index) => (
            <Picker.Item label={size} key={index} value={size} />
          ))}
        </Picker>
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
