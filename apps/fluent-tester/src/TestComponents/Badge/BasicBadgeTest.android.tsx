/* eslint-disable @typescript-eslint/no-var-requires */
import React from 'react';
import { View } from 'react-native';

import { Badge } from '@fluentui-react-native/badge';

import { svgProps } from '../Common/iconExamples';

export const BasicBadge: React.FunctionComponent = () => {
  return (
    <View>
      <View style={{ flexDirection: 'row', marginTop: 6 }}>
        <Badge size="small" style={{ marginRight: 6 }}>
          Neutral
        </Badge>
        <Badge size="medium" icon={{ svgSource: svgProps }}>
          Neutral
        </Badge>
      </View>
      <View style={{ flexDirection: 'row', marginTop: 6 }}>
        <Badge size="small" badgeColor="brand" style={{ marginRight: 6 }}>
          Brand
        </Badge>
        <Badge size="medium" badgeColor="brand" icon={{ svgSource: svgProps }}>
          Brand
        </Badge>
      </View>
      <View style={{ flexDirection: 'row', marginTop: 6 }}>
        <Badge size="small" badgeColor="danger" style={{ marginRight: 6 }}>
          Danger
        </Badge>
        <Badge size="medium" badgeColor="danger" icon={{ svgSource: svgProps }}>
          Danger
        </Badge>
      </View>
      <View style={{ flexDirection: 'row', marginTop: 6 }}>
        <Badge size="small" badgeColor="severe" style={{ marginRight: 6 }}>
          Severe
        </Badge>
        <Badge size="medium" badgeColor="severe" icon={{ svgSource: svgProps }}>
          Severe
        </Badge>
      </View>
      <View style={{ flexDirection: 'row', marginTop: 6 }}>
        <Badge size="small" badgeColor="warning" style={{ marginRight: 6 }}>
          Warning
        </Badge>
        <Badge size="medium" badgeColor="warning" icon={{ svgSource: svgProps }}>
          Warning
        </Badge>
      </View>
      <View style={{ flexDirection: 'row', marginTop: 6 }}>
        <Badge size="small" badgeColor="success" style={{ marginRight: 6 }}>
          Success
        </Badge>
        <Badge size="medium" badgeColor="success" icon={{ svgSource: svgProps }}>
          Success
        </Badge>
      </View>
    </View>
  );
};
