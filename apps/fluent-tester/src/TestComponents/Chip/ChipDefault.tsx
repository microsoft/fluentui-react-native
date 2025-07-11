import React, { useCallback } from 'react';
import { StyleSheet, View, ToastAndroid } from 'react-native';

import { Chip } from '@fluentui-react-native/chip';
import type { InteractionEvent } from '@fluentui-react-native/interactive-hooks';
import { Switch } from '@fluentui-react-native/switch';
import { Text } from '@fluentui-react-native/text';

import { svgProps } from '../Common/iconExamples';

export const ChipDefault: React.FunctionComponent = () => {
  const [showCloseIcon, setShowCloseIcon] = React.useState<boolean>(false);
  const toggleActivityState = useCallback((_e: InteractionEvent, isActive: boolean) => setShowCloseIcon(isActive), []);
  const showToast = () => {
    ToastAndroid.show('Close icon clicked!', ToastAndroid.SHORT);
  };

  return (
    <View>
      <Switch label={'Show Close Icon'} defaultChecked={showCloseIcon} onChange={toggleActivityState} />
      <View style={styles.rowStyle}>
        <Chip size="small" style={styles.rowGap} showCloseIcon={showCloseIcon} closeIconOnPress={showToast}>
          Neutral
        </Chip>
        <Chip size="medium" icon={{ svgSource: svgProps }} showCloseIcon={showCloseIcon} closeIconOnPress={showToast}>
          Neutral
        </Chip>
      </View>
      <View style={styles.rowStyle}>
        <Chip size="small" style={styles.rowGap} disabled showCloseIcon={showCloseIcon} closeIconOnPress={showToast}>
          Disabled
        </Chip>
        <Chip size="medium" icon={{ svgSource: svgProps }} disabled showCloseIcon={showCloseIcon} closeIconOnPress={showToast}>
          Disabled
        </Chip>
      </View>
      <View style={styles.rowStyle}>
        <Chip size="small" chipColor="brand" style={styles.rowGap} showCloseIcon={showCloseIcon} closeIconOnPress={showToast}>
          Brand
        </Chip>
        <Chip size="medium" chipColor="brand" icon={{ svgSource: svgProps }} showCloseIcon={showCloseIcon} closeIconOnPress={showToast}>
          Brand
        </Chip>
      </View>
      <View style={styles.rowStyle}>
        <Chip size="small" chipColor="danger" style={styles.rowGap} showCloseIcon={showCloseIcon} closeIconOnPress={showToast}>
          Danger
        </Chip>
        <Chip size="medium" chipColor="danger" icon={{ svgSource: svgProps }} showCloseIcon={showCloseIcon} closeIconOnPress={showToast}>
          Danger
        </Chip>
      </View>
      <View style={styles.rowStyle}>
        <Chip size="small" chipColor="severe" style={styles.rowGap} showCloseIcon={showCloseIcon} closeIconOnPress={showToast}>
          Severe
        </Chip>
        <Chip size="medium" chipColor="severe" icon={{ svgSource: svgProps }} showCloseIcon={showCloseIcon} closeIconOnPress={showToast}>
          Severe
        </Chip>
      </View>
      <View style={styles.rowStyle}>
        <Chip size="small" chipColor="warning" style={styles.rowGap} showCloseIcon={showCloseIcon} closeIconOnPress={showToast}>
          Warning
        </Chip>
        <Chip size="medium" chipColor="warning" icon={{ svgSource: svgProps }} showCloseIcon={showCloseIcon} closeIconOnPress={showToast}>
          Warning
        </Chip>
      </View>
      <View style={styles.rowStyle}>
        <Chip size="small" chipColor="success" style={styles.rowGap} showCloseIcon={showCloseIcon} closeIconOnPress={showToast}>
          Success
        </Chip>
        <Chip size="medium" chipColor="success" icon={{ svgSource: svgProps }} showCloseIcon={showCloseIcon} closeIconOnPress={showToast}>
          Success
        </Chip>
      </View>
      <Text>Search Bar Chip</Text>
      <View style={styles.rowStyle}>
        <Chip searchBar size="small" style={styles.rowGap} showCloseIcon={showCloseIcon} closeIconOnPress={showToast}>
          Chip
        </Chip>
        <Chip searchBar size="medium" icon={{ svgSource: svgProps }} showCloseIcon={showCloseIcon} closeIconOnPress={showToast}>
          Chip
        </Chip>
      </View>
      <View style={styles.rowStyle}>
        <Chip searchBar size="small" chipColor="brand" style={styles.rowGap} showCloseIcon={showCloseIcon} closeIconOnPress={showToast}>
          Brand
        </Chip>
        <Chip
          searchBar
          size="medium"
          chipColor="brand"
          icon={{ svgSource: svgProps }}
          showCloseIcon={showCloseIcon}
          closeIconOnPress={showToast}
        >
          Brand
        </Chip>
      </View>
      <View style={styles.rowStyle}>
        <Chip searchBar size="small" style={styles.rowGap} disabled showCloseIcon={showCloseIcon} closeIconOnPress={showToast}>
          Disabled
        </Chip>
        <Chip searchBar size="medium" icon={{ svgSource: svgProps }} disabled showCloseIcon={showCloseIcon} closeIconOnPress={showToast}>
          Disabled
        </Chip>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  rowStyle: { flexDirection: 'row', marginTop: 6 },
  rowGap: { marginRight: 6 },
});
