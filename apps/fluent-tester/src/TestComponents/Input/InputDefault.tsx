import * as React from 'react';
import { View } from 'react-native';

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

  return (
    <View>
      <Input onChange={(text) => setControlText(text)} defaultValue={controlText} />
      <Input value={'Controlled text - ' + controlText} />
      <Input placeholder="Enter text here!" type="decimal-pad" accessoryIcon={null} />
      <Input placeholder="Custom dismiss icon" accessoryIcon={outlineIconProps} secondaryText="Secondary" type="email-address" />
      <Input
        placeholder="Enter text here!"
        accessoryIcon={dismissIconProps}
        label="Label"
        assistiveText="Assistive Text"
        secondaryText="Secondary"
      />
      <Input
        error={error}
        icon={outlineIconProps}
        placeholder="Only text up to 5 characters!"
        label="Label"
        onChange={(text) => {
          if (text.length > 5) setError('Text must be less than 5 characters!');
          else setError('');
        }}
      />
    </View>
  );
};
