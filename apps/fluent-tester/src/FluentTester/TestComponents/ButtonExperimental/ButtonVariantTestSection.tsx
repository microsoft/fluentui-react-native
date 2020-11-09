import { Button, CompoundButton } from '@fluentui-react-native/experimental-button';
import * as React from 'react';
import { View, Platform, TouchableOpacity } from 'react-native';
import { commonTestStyles, stackStyle } from '../Common/styles';

export const ButtonVariantTest: React.FunctionComponent<{}> = () => {
  const [buttonTitle1, setTitle1] = React.useState('Mac Native Button');
  const onPress1 = () => setTitle1('Native Button Clicked');

  const [buttonTitle2, setTitle2] = React.useState('Mac Native Button');
  const onPress2 = () => setTitle2('Native Button Clicked');

  const [buttonTitle3, setTitle3] = React.useState('Mac Native Button');
  const onPress3 = () => setTitle3('Native Button Clicked');

  if (Platform.OS == 'macos') {
    return (
      <View style={[stackStyle, commonTestStyles.view]}>
        <TouchableOpacity onPress={onPress1}>
          <Button
            title={'PrimaryFilled ' + buttonTitle1}
            buttonStyle="primaryFilled"
            style={{ width: 250, height: 30, marginBottom: 15 }}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={onPress2}>
          <Button
            title={'PrimaryOutline ' + buttonTitle2}
            buttonStyle="primaryOutline"
            style={{ width: 250, height: 30, marginBottom: 15 }}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={onPress3}>
          <Button title={'Borderless ' + buttonTitle3} buttonStyle="borderless" style={{ width: 250, height: 30, marginBottom: 15 }} />
        </TouchableOpacity>
        <CompoundButton ghost content="Ghost" secondaryContent="Compound" style={commonTestStyles.vmargin} />
        <CompoundButton content="Default" secondaryContent="Compound" style={commonTestStyles.vmargin} />
        <CompoundButton primary content="Primary" secondaryContent="Compound" style={commonTestStyles.vmargin} />
      </View>
    );
  } else {
    return (
      <View style={[stackStyle, commonTestStyles.view]}>
        <Button content="Default" style={commonTestStyles.vmargin} />
        <Button primary content="Primary" style={commonTestStyles.vmargin} />
        <Button ghost content="Ghost" style={commonTestStyles.vmargin} />
        <Button fluid content="Fluid" style={commonTestStyles.vmargin} />
        <Button primary fluid content="Fluid Primary" style={commonTestStyles.vmargin} />
        <Button ghost fluid content="Fluid Ghost" style={commonTestStyles.vmargin} />
        <CompoundButton content="Default" secondaryContent="Compound" style={commonTestStyles.vmargin} />
        <CompoundButton primary content="Primary" secondaryContent="Compound" style={commonTestStyles.vmargin} />
        <CompoundButton ghost content="Ghost" secondaryContent="Compound" style={commonTestStyles.vmargin} />
      </View>
    );
  }
};
