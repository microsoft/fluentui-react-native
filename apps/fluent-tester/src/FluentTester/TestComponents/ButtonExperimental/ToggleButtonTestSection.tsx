import { ToggleButton } from '@fluentui-react-native/experimental-button';
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
        <ToggleButton onClick={onDefaultClicked} checked={defaultChecked} content="Default Toggle" style={commonTestStyles.vmargin} />
        <Checkbox checked={defaultChecked} label="Default Toggle is Checked" style={[commonTestStyles.vmargin, styles.hmargin]} />
      </View>
      <ToggleButton checked content="Checked Default Toggle" style={commonTestStyles.vmargin} />
      <ToggleButton checked={false} content="Unchecked Default Toggle" style={commonTestStyles.vmargin} />
      {/* <ToggleButton primary content="Primary Toggle" /> */}
      <View style={styles.row}>
        <ToggleButton subtle onClick={onGhostClicked} checked={subtleChecked} content="Subtle Toggle" style={commonTestStyles.vmargin} />
        <Checkbox checked={subtleChecked} label="Subtle Toggle is Checked" style={[commonTestStyles.vmargin, styles.hmargin]} />
      </View>
      <ToggleButton subtle checked content="Checked Subtle Toggle" style={commonTestStyles.vmargin} />
      <ToggleButton subtle checked={false} content="Unchecked Subtle Toggle" style={commonTestStyles.vmargin} />
    </View>
  );
};
