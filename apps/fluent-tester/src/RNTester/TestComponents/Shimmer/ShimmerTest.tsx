import * as React from 'react';
import { Shimmer, Separator } from '@fluentui/react-native';
import { Stack } from '@fluentui-react-native/stack';
import { stackStyle } from '../Common/styles';
import { SHIMMER_TESTPAGE } from './consts';
import { Text, View } from 'react-native';
import { commonTestStyles as commonStyles } from '../Common/styles';

export const ShimmerTest: React.FunctionComponent<{}> = () => {
  return (
    <View>
      <Text style={commonStyles.section} testID={SHIMMER_TESTPAGE}>
        Shimmer Test Page
      </Text>
      <Separator />
      <Stack style={stackStyle}>
        <Shimmer style={{ flex: 1, alignItems: 'center' }}>
          <View style={{ flex: 1, alignItems: 'center', flexDirection: 'row', marginStart: 16, marginEnd: 16 }}>
            <View style={{ width: 40, height: 40 }} />
            <View style={{ flexDirection: 'column', flex: 2, marginLeft: 16 }} >
              <Text style={{ marginBottom: 3, width: '40%' }}>{''}</Text>
              <Text style={{ marginTop: 3, width: '30%' }} >{''}</Text>
            </View>
          </View>
        </Shimmer>
      </Stack>
    </View >
  );
};