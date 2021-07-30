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
  const [ghostChecked, setGhostChecked] = React.useState(false);
  const onGhostClicked = React.useCallback(() => setGhostChecked(!ghostChecked), [ghostChecked, setGhostChecked]);

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
        <ToggleButton ghost onClick={onGhostClicked} checked={ghostChecked} content="Ghost Toggle" style={commonTestStyles.vmargin} />
        <Checkbox checked={ghostChecked} label="Ghost Toggle is Checked" style={[commonTestStyles.vmargin, styles.hmargin]} />
      </View>
      <ToggleButton ghost checked content="Checked Ghost Toggle" style={commonTestStyles.vmargin} />
      <ToggleButton ghost checked={false} content="Unchecked Ghost Toggle" style={commonTestStyles.vmargin} />
    </View>
  );
};
