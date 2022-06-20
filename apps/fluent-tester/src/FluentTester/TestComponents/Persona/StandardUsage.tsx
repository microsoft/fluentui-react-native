import * as React from 'react';
import { Persona, PersonaSize } from '@fluentui/react-native';
import { rajeshImageUrl } from './styles';
import { commonTestStyles as commonStyles } from '../Common/styles';
import { View, Text, Switch, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { undefinedText } from '../PersonaCoin/styles';
import { MenuPicker } from '../Common/MenuPicker';

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
  const renderMenuPicker = Platform.OS == ('win32' as any) || Platform.OS == 'macos';

  const Pickers = () => {
    return (
      <Picker
        prompt="Size"
        style={commonStyles.header}
        selectedValue={imageSize || undefinedText}
        onValueChange={(size: PersonaSize | typeof undefinedText) => setImageSize(size === undefinedText ? undefined : size)}
      >
        {allSizes.map((size, index) => (
          <Picker.Item label={size} key={index} value={size} />
        ))}
      </Picker>
    );
  };

  const MenuPickers = () => {
    return (
      <MenuPicker
        prompt="Size"
        style={commonStyles.header}
        selected={imageSize || undefinedText}
        onChange={(size: PersonaSize | typeof undefinedText) => setImageSize(size === undefinedText ? undefined : size)}
        collection={allSizes}
      />
    );
  };

  return (
    <View style={commonStyles.root}>
      {/* settings */}
      <View style={commonStyles.settings}>
        <SwitchWithLabel label="Show image" value={showImage} onValueChange={setShowImage} />
        <SwitchWithLabel label="Show primary text" value={showPrimary} onValueChange={setShowPrimary} />
        <SwitchWithLabel label="Show secondary text" value={showSecondary} onValueChange={setShowSecondary} />
        <SwitchWithLabel label="Show tertiary text" value={showTertiary} onValueChange={setShowTertiary} />
        <SwitchWithLabel label="Show optional text" value={showOptional} onValueChange={setShowOptional} />
        {renderMenuPicker ? <MenuPickers /> : <Pickers />}
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
