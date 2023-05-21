/* eslint-disable @typescript-eslint/no-var-requires */
import React from 'react';
import { View } from 'react-native';

import { Badge } from '@fluentui-react-native/badge';
import type { InteractionEvent } from '@fluentui-react-native/interactive-hooks';
import { Switch } from '@fluentui-react-native/switch';
import { Text } from '@fluentui-react-native/text';

import { svgProps } from '../Common/iconExamples';

export const BasicBadge: React.FunctionComponent = () => {
  const [showCloseIcon, setShowCloseIcon] = React.useState<boolean>(false);
  const toggleActivityState = (_e: InteractionEvent, isActive: boolean) => {
    setShowCloseIcon(isActive);
  };

  return (
    <View>
      <Switch label={'Show Close Icon'} defaultChecked={showCloseIcon} onChange={toggleActivityState} />
      <View style={{ flexDirection: 'row', marginTop: 12 }}>
        <Badge size="small" style={{ marginRight: 6 }} showCloseIcon={showCloseIcon}>
          Neutral
        </Badge>
        <Badge size="medium" icon={{ svgSource: svgProps }} showCloseIcon={showCloseIcon}>
          Neutral
        </Badge>
      </View>
      <View style={{ flexDirection: 'row', marginTop: 6 }}>
        <Badge size="small" style={{ marginRight: 6 }} disabled showCloseIcon={showCloseIcon}>
          Disabled
        </Badge>
        <Badge size="medium" icon={{ svgSource: svgProps }} disabled showCloseIcon={showCloseIcon}>
          Disabled
        </Badge>
      </View>
      <View style={{ flexDirection: 'row', marginTop: 6 }}>
        <Badge size="small" badgeColor="brand" style={{ marginRight: 6 }} showCloseIcon={showCloseIcon}>
          Brand
        </Badge>
        <Badge size="medium" badgeColor="brand" icon={{ svgSource: svgProps }} showCloseIcon={showCloseIcon}>
          Brand
        </Badge>
      </View>
      <View style={{ flexDirection: 'row', marginTop: 6 }}>
        <Badge size="small" badgeColor="danger" style={{ marginRight: 6 }} showCloseIcon={showCloseIcon}>
          Danger
        </Badge>
        <Badge size="medium" badgeColor="danger" icon={{ svgSource: svgProps }} showCloseIcon={showCloseIcon}>
          Danger
        </Badge>
      </View>
      <View style={{ flexDirection: 'row', marginTop: 6 }}>
        <Badge size="small" badgeColor="severe" style={{ marginRight: 6 }} showCloseIcon={showCloseIcon}>
          Severe
        </Badge>
        <Badge size="medium" badgeColor="severe" icon={{ svgSource: svgProps }} showCloseIcon={showCloseIcon}>
          Severe
        </Badge>
      </View>
      <View style={{ flexDirection: 'row', marginTop: 6 }}>
        <Badge size="small" badgeColor="warning" style={{ marginRight: 6 }} showCloseIcon={showCloseIcon}>
          Warning
        </Badge>
        <Badge size="medium" badgeColor="warning" icon={{ svgSource: svgProps }} showCloseIcon={showCloseIcon}>
          Warning
        </Badge>
      </View>
      <View style={{ flexDirection: 'row', marginTop: 6 }}>
        <Badge size="small" badgeColor="success" style={{ marginRight: 6 }} showCloseIcon={showCloseIcon}>
          Success
        </Badge>
        <Badge size="medium" badgeColor="success" icon={{ svgSource: svgProps }} showCloseIcon={showCloseIcon}>
          Success
        </Badge>
      </View>
      <Text>Search Bar Badge</Text>
      <View style={{ flexDirection: 'row', marginTop: 6 }}>
        <Badge searchBar size="small" style={{ marginRight: 6 }} showCloseIcon={showCloseIcon}>
          Badge
        </Badge>
        <Badge searchBar size="medium" icon={{ svgSource: svgProps }} showCloseIcon={showCloseIcon}>
          Badge
        </Badge>
      </View>
      <View style={{ flexDirection: 'row', marginTop: 6 }}>
        <Badge searchBar size="small" badgeColor="brand" style={{ marginRight: 6 }} showCloseIcon={showCloseIcon}>
          Brand
        </Badge>
        <Badge searchBar size="medium" badgeColor="brand" icon={{ svgSource: svgProps }} showCloseIcon={showCloseIcon}>
          Brand
        </Badge>
      </View>
      <View style={{ flexDirection: 'row', marginTop: 6 }}>
        <Badge searchBar size="small" style={{ marginRight: 6 }} disabled showCloseIcon={showCloseIcon}>
          Disabled
        </Badge>
        <Badge searchBar size="medium" icon={{ svgSource: svgProps }} disabled showCloseIcon={showCloseIcon}>
          Disabled
        </Badge>
      </View>
    </View>
  );
};
