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
  return (
    <View>
      <Input value="Value prop passed!" />
      <Input placeholder="Enter text here!" type="decimal-pad" />
      <Input placeholder="Enter text here!" dismissIcon={dismissIconProps} secondaryText="Secondary" type="email-address" />
      <Input
        placeholder="Enter text here!"
        dismissIcon={dismissIconProps}
        label="Label"
        assistiveText="Assistive Text"
        secondaryText="Secondary"
      />
      <Input
        error="Error occured!"
        icon={outlineIconProps}
        placeholder="Enter text here!"
        dismissIcon={dismissIconProps}
        label="Label"
        assistiveText="Assistive Text"
        secondaryText="Secondary"
      />
      <Input
        icon={outlineIconProps}
        placeholder="Enter text here!"
        dismissIcon={dismissIconProps}
        label="Label"
        assistiveText="Assistive Text"
        secondaryText="Secondary"
        defaultValue="Default value!"
        onChange={(text) => console.log('Text changed to: ' + text)}
        onFocus={() => console.log('Do this on focus')}
        onBlur={() => console.log('Do this on blur')}
      />
    </View>
  );
};
