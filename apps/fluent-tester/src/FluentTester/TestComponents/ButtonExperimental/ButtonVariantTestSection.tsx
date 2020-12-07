import { Button, CompoundButton } from '@fluentui-react-native/experimental-button';
import * as React from 'react';
import { View, Platform, processColor } from 'react-native';
import { commonTestStyles, stackStyle } from '../Common/styles';

export const ButtonVariantTest: React.FunctionComponent<{}> = () => {
  if (Platform.OS == 'macos') {
    const CustomizedNativeButton = Button.customize({
      contentTintColor: processColor('white'),
      restBackgroundColor: processColor('orange'),
    });
    return (
      <View style={[stackStyle, commonTestStyles.view]}>
        <Button
          title="PrimaryFilled"
          buttonStyle="primaryFilled"
          style={{ width: 250, height: 30, marginBottom: 15 }}
          onPress={() => alert('PrimaryFilled button clicked!')}
        />
        <Button
          title="PrimaryOutline"
          buttonStyle="primaryOutline"
          style={{ width: 250, height: 30, marginBottom: 15 }}
          onPress={() => alert('PrimaryOutline button clicked!')}
        />
        <Button
          title="Borderless"
          buttonStyle="borderless"
          style={{ width: 250, height: 30, marginBottom: 15 }}
          onPress={() => alert('Borderless button clicked!')}
        />
        <CustomizedNativeButton
          title="Customized Button"
          buttonStyle="primaryFilled"
          style={{ width: 250, height: 30, marginBottom: 15 }}
          onPress={() => alert('Custom button clicked!')}
        />
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
