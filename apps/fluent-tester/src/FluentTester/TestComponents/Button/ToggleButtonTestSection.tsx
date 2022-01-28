import { ToggleButton } from '@fluentui-react-native/button';
import { Checkbox } from '@fluentui/react-native';
import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { commonTestStyles, stackStyle } from '../Common/styles';

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
  hmargin: {
    marginHorizontal: 8,
  },
});

export const ToggleButtonTest: React.FunctionComponent = () => {
  const [defaultChecked, setDefaultChecked] = React.useState(false);
  const onDefaultClicked = React.useCallback(() => setDefaultChecked(!defaultChecked), [defaultChecked, setDefaultChecked]);
  const [subtleChecked, setSubtleChecked] = React.useState(false);
  const onGhostClicked = React.useCallback(() => setSubtleChecked(!subtleChecked), [subtleChecked, setSubtleChecked]);

  return (
    <View style={[stackStyle, commonTestStyles.view]}>
      <View style={styles.row}>
        <ToggleButton onClick={onDefaultClicked} checked={defaultChecked} style={commonTestStyles.vmargin}>
          Default Toggle
        </ToggleButton>
        <Checkbox checked={defaultChecked} label="Default Toggle is Checked" style={[commonTestStyles.vmargin, styles.hmargin]} />
      </View>
      <ToggleButton checked style={commonTestStyles.vmargin}>
        Checked Default Toggle
      </ToggleButton>
      <ToggleButton checked={false} style={commonTestStyles.vmargin}>
        Unchecked Default Toggle
      </ToggleButton>
      <ToggleButton appearance="primary" style={commonTestStyles.vmargin}>
        Primary Toggle
      </ToggleButton>
      <ToggleButton defaultChecked appearance="primary" style={commonTestStyles.vmargin}>
        Primary Toggle
      </ToggleButton>
      <View style={styles.row}>
        <ToggleButton appearance="subtle" onClick={onGhostClicked} checked={subtleChecked} style={commonTestStyles.vmargin}>
          Subtle Toggle
        </ToggleButton>
        <Checkbox checked={subtleChecked} label="Subtle Toggle is Checked" style={[commonTestStyles.vmargin, styles.hmargin]} />
      </View>
      <ToggleButton appearance="subtle" checked style={commonTestStyles.vmargin}>
        Checked Subtle Toggle
      </ToggleButton>
      <ToggleButton appearance="subtle" checked={false} style={commonTestStyles.vmargin}>
        Unchecked Subtle Toggle
      </ToggleButton>
    </View>
  );
};
