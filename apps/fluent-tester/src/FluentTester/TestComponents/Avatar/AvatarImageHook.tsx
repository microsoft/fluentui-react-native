import * as React from 'react';
import { TextInput, View } from 'react-native';
import { commonTestStyles as commonStyles } from '../Common/styles';
import { AvatarProps, AvatarSizes, Avatar } from '@fluentui-react-native/avatar';
import { Text } from '@fluentui-react-native/experimental-text';
import { useAvatarImage } from '@fluentui-react-native/interactive-hooks';

const DataBackedAvatar: React.FunctionComponent<{ email?: string } & AvatarProps> = ({ email, ...props }) => {
  const imageProps = useAvatarImage(email);
  return <Avatar {...imageProps} {...props} />;
};

export const AvatarImageHookUsage: React.FunctionComponent = () => {
  const [email, setEmail] = React.useState('adrum@microsoft.com');
  const onSubmitEditing = React.useCallback((e) => {
    setEmail(e.nativeEvent.text);
  }, []);

  const imageUrl = useAvatarImage(email)?.imageUrl;

  return (
    <View style={commonStyles.root}>
      <View style={commonStyles.settings}>
        <Text>Email: </Text>
        <TextInput style={commonStyles.textBox} placeholder="Enter email" onSubmitEditing={onSubmitEditing} blurOnSubmit />
      </View>
      <View style={commonStyles.section}>
        <Text variant="subheaderStandard">{'URI: ' + imageUrl}</Text>
        <View style={commonStyles.root}>
          {AvatarSizes.map((size) => {
            // return <Avatar key={size} imageUrl={uri} size={size} />;
            return <DataBackedAvatar key={size} email={email} size={size} />;
          })}
        </View>
      </View>
    </View>
  );
};
