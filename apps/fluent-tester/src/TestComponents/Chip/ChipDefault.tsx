/* eslint-disable @typescript-eslint/no-var-requires */
import React, { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';

import { Chip } from '@fluentui-react-native/chip';
import type { InteractionEvent } from '@fluentui-react-native/interactive-hooks';
import { Switch } from '@fluentui-react-native/switch';
import { Text } from '@fluentui-react-native/text';

import { svgProps } from '../Common/iconExamples';

export const ChipDefault: React.FunctionComponent = () => {
  const [showCloseIcon, setShowCloseIcon] = React.useState<boolean>(false);
  const toggleActivityState = useCallback((_e: InteractionEvent, isActive: boolean) => setShowCloseIcon(isActive), []);

  return (
    <View>
      <Switch label={'Show Close Icon'} defaultChecked={showCloseIcon} onChange={toggleActivityState} />
      <View style={styles.rowStyle}>
        <Chip size="small" style={styles.rowGap} showCloseIcon={showCloseIcon}>
          Neutral
        </Chip>
        <Chip size="medium" icon={{ svgSource: svgProps }} showCloseIcon={showCloseIcon}>
          Neutral
        </Chip>
      </View>
      <View style={styles.rowStyle}>
        <Chip size="small" style={styles.rowGap} disabled showCloseIcon={showCloseIcon}>
          Disabled
        </Chip>
        <Chip size="medium" icon={{ svgSource: svgProps }} disabled showCloseIcon={showCloseIcon}>
          Disabled
        </Chip>
      </View>
      <View style={styles.rowStyle}>
        <Chip size="small" chipColor="brand" style={styles.rowGap} showCloseIcon={showCloseIcon}>
          Brand
        </Chip>
        <Chip size="medium" chipColor="brand" icon={{ svgSource: svgProps }} showCloseIcon={showCloseIcon}>
          Brand
        </Chip>
      </View>
      <View style={styles.rowStyle}>
        <Chip size="small" chipColor="danger" style={styles.rowGap} showCloseIcon={showCloseIcon}>
          Danger
        </Chip>
        <Chip size="medium" chipColor="danger" icon={{ svgSource: svgProps }} showCloseIcon={showCloseIcon}>
          Danger
        </Chip>
      </View>
      <View style={styles.rowStyle}>
        <Chip size="small" chipColor="severe" style={styles.rowGap} showCloseIcon={showCloseIcon}>
          Severe
        </Chip>
        <Chip size="medium" chipColor="severe" icon={{ svgSource: svgProps }} showCloseIcon={showCloseIcon}>
          Severe
        </Chip>
      </View>
      <View style={styles.rowStyle}>
        <Chip size="small" chipColor="warning" style={styles.rowGap} showCloseIcon={showCloseIcon}>
          Warning
        </Chip>
        <Chip size="medium" chipColor="warning" icon={{ svgSource: svgProps }} showCloseIcon={showCloseIcon}>
          Warning
        </Chip>
      </View>
      <View style={styles.rowStyle}>
        <Chip size="small" chipColor="success" style={styles.rowGap} showCloseIcon={showCloseIcon}>
          Success
        </Chip>
        <Chip size="medium" chipColor="success" icon={{ svgSource: svgProps }} showCloseIcon={showCloseIcon}>
          Success
        </Chip>
      </View>
      <Text>Search Bar Chip</Text>
      <View style={styles.rowStyle}>
        <Chip searchBar size="small" style={styles.rowGap} showCloseIcon={showCloseIcon}>
          Chip
        </Chip>
        <Chip searchBar size="medium" icon={{ svgSource: svgProps }} showCloseIcon={showCloseIcon}>
          Chip
        </Chip>
      </View>
      <View style={styles.rowStyle}>
        <Chip searchBar size="small" chipColor="brand" style={styles.rowGap} showCloseIcon={showCloseIcon}>
          Brand
        </Chip>
        <Chip searchBar size="medium" chipColor="brand" icon={{ svgSource: svgProps }} showCloseIcon={showCloseIcon}>
          Brand
        </Chip>
      </View>
      <View style={styles.rowStyle}>
        <Chip searchBar size="small" style={styles.rowGap} disabled showCloseIcon={showCloseIcon}>
          Disabled
        </Chip>
        <Chip searchBar size="medium" icon={{ svgSource: svgProps }} disabled showCloseIcon={showCloseIcon}>
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
