import * as React from 'react';
import { KeyboardAvoidingView } from 'react-native';

import type { IconProps } from '@fluentui-react-native/icon';
import { Input } from '@fluentui-react-native/input';

import DismissSvg from '../../../assets/dismissIcon.svg';
import FilledSvg from '../../../assets/filledIcon.svg';
import OutlineSvg from '../../../assets/outlineIcon.svg';

export const dismissIconProps: IconProps = { svgSource: { src: DismissSvg, viewBox: '0 0 20 20' } };
export const outlineIconProps: IconProps = { svgSource: { src: OutlineSvg, viewBox: '0 0 20 20' } };
export const filledIconProps: IconProps = { svgSource: { src: FilledSvg, viewBox: '0 0 20 20' } };

export const InputDefault: React.FunctionComponent = () => {
  const [error, setError] = React.useState<string>('');
  const [controlText, setControlText] = React.useState<string>('Controls other text input!');
  const textInputRef = React.useRef(null);

  return (
    <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={200} style={{ flex: 1 }}>
      <Input
        error={error}
        defaultIcon={outlineIconProps}
        focusedStateIcon={filledIconProps}
        textInputProps={{ autoFocus: true }}
        placeholder="Only text upto 5 characters!"
        assistiveText="Assistive Text"
        label="Label"
        onChange={(text: string) => {
          if (text.length > 5) setError('Text must be less than 5 characters!');
          else setError('');
        }}
      />
      <Input defaultIcon={outlineIconProps} placeholder="No focused state icon!" label="Label" />
      <Input
        placeholder="Enter text here!"
        accessoryIcon={dismissIconProps}
        label="Label"
        assistiveText="Assistive Text"
        accessoryText="Accessory"
      />
      <Input
        placeholder="Enter text here!"
        type="decimal-pad"
        accessoryIcon={null}
        onFocus={() => console.log('focused')}
        onBlur={() => console.log('blurred')}
      />
      <Input
        placeholder="Custom dismiss icon onPress - Blur"
        componentRef={textInputRef}
        accessoryIcon={outlineIconProps}
        accessoryButtonOnPress={() => {
          // Demonstrating blur on the text input
          textInputRef.current.blur();
        }}
        accessoryText="Accessory"
        type="email-address"
      />
      <Input onChange={(text) => setControlText(text)} placeholder={'Text entered here shows below too'} defaultValue={controlText} />
      <Input value={'Controlled text - ' + controlText} />
    </KeyboardAvoidingView>
  );
};
