import * as React from 'react';
import { View } from 'react-native';
import { Text } from '@fluentui-native/text';
import { styles } from './styles';

const SmallStandard = Text.customize({ tokens: { fontVariant: 'smallStandard' } });
const MediumStandard = Text.customize({ tokens: { fontVariant: 'mediumStandard' } });
const MediumSemibold = Text.customize({ tokens: { fontVariant: 'mediumSemibold' } });
const LargeStandard = Text.customize({ tokens: { fontVariant: 'largeStandard' } });
const LargeSemibold = Text.customize({ tokens: { fontVariant: 'largeSemibold' } });
const ExtraLargeStandard = Text.customize({ tokens: { fontVariant: 'extraLargeStandard' } });
const ExtraLargeSemibold = Text.customize({ tokens: { fontVariant: 'extraLargeSemibold' } });
const HugeStandard = Text.customize({ tokens: { fontVariant: 'hugeStandard' } });
const HugeSemibold = Text.customize({ tokens: { fontVariant: 'hugeSemibold' } });
const HugeBold = Text.customize({ tokens: { fontVariant: 'hugeBold' } });
const GiantStandard = Text.customize({ tokens: { fontVariant: 'giantStandard' } });
const GiantSemibold = Text.customize({ tokens: { fontVariant: 'giantSemibold' } });

export const StandardUsage: React.FunctionComponent<{}> = () => {
  return (
    <View style={styles.root}>
      <SmallStandard>SmallStandard</SmallStandard>
      <MediumStandard>MediumStandard</MediumStandard>
      <MediumSemibold>MediumSemibold</MediumSemibold>
      <LargeStandard>LargeStandard</LargeStandard>
      <LargeSemibold>LargeSemibold</LargeSemibold>
      <ExtraLargeStandard>ExtraLargeStandard</ExtraLargeStandard>
      <ExtraLargeSemibold>ExtraLargeSemibold</ExtraLargeSemibold>
      <HugeStandard>HugeStandard</HugeStandard>
      <HugeSemibold>HugeSemibold</HugeSemibold>
      <HugeBold>HugeBold</HugeBold>
      <GiantStandard>GiantStandard</GiantStandard>
      <GiantSemibold>GiantSemibold</GiantSemibold>
    </View>
  );
};
