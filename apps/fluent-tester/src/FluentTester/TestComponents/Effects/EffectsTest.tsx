import { Theme, useTheme } from '@fluentui-react-native/theme-types';
import { themedStyleSheet } from '@fluentui-react-native/themed-stylesheet';
import { Text } from '@fluentui/react-native';
import * as React from 'react';
import { FlatList, View } from 'react-native';
import { commonTestStyles } from '../Common/styles';
import { Test, TestSection, PlatformStatus } from '../Test';
import { EFFECTS_TESTPAGE } from './consts';

const getThemedStyles = themedStyleSheet((t: Theme) => {
  return {
    effectBox: {
      width: 366,
      height: 64,
      padding: 12,
      marginVertical: 4,
    },
    borderBox: {
      borderColor: t.colors.neutralStroke1,
      borderWidth: 2,
    },
    borderRadiusSmall: {
      borderRadius: t.effects.borderRadiusSmall,
    },
    borderRadiusMedium: {
      borderRadius: t.effects.borderRadiusMedium,
    },
    borderRadiusLarge: {
      borderRadius: t.effects.borderRadiusLarge,
    },
    borderRadiusXLarge: {
      borderRadius: t.effects.borderRadiusXLarge,
    },
    shadowColor: {
      shadowColor: 'black',
      shadowOpacity: 1,
    },
  };
});

const _isShadowEffect = (effectName: string) => {
  return effectName.substr(0, 6) === 'shadow';
};

type BorderEffectProps = { name: string; value: string };
const BorderEffect: React.FunctionComponent<BorderEffectProps> = (props: BorderEffectProps) => {
  const theme = useTheme();
  const themedStyles = getThemedStyles(theme);
  const { name, value } = props;
  return (
    <View style={[themedStyles.effectBox, themedStyles.borderBox, themedStyles[name]]}>
      <Text>{name}</Text>
      <Text>{value}</Text>
    </View>
  );
};

const BorderEffectTest: React.FunctionComponent = (p) => {
  const effects = useTheme().effects;
  const aggregator = React.useCallback(
    (key: string) => {
      return { name: key, value: JSON.stringify(effects[key], undefined, ' ').replace('\n', ' ') };
    },
    [effects],
  );

  const flattenArray = React.useCallback(() => {
    return Object.keys(effects)
      .filter((val) => !_isShadowEffect(val))
      .map(aggregator);
  }, [effects]);

  const effectsAsArray = React.useMemo(flattenArray, [flattenArray]);

  const renderBorder = React.useCallback(({ item }) => {
    return <BorderEffect {...item} key={item.name} />;
  }, []);

  return (
    <View style={commonTestStyles.view}>
      <FlatList data={effectsAsArray} renderItem={renderBorder} />
    </View>
  );
};

const ShadowEffectTest: React.FunctionComponent = () => {
  return <View style={commonTestStyles.view}></View>;
};

const effectsSections: TestSection[] = [
  {
    name: 'Border Effects',
    testID: EFFECTS_TESTPAGE,
    component: BorderEffectTest,
  },
  {
    name: 'Shadow Effects',
    component: ShadowEffectTest,
  },
];

export const EffectsTest: React.FunctionComponent<{}> = () => {
  const status: PlatformStatus = {
    win32Status: 'Experimental',
    uwpStatus: 'Experimental',
    iosStatus: 'Experimental',
    macosStatus: 'Experimental',
    androidStatus: 'Experimental',
  };

  const description = 'This showcases the effects available in the Theme object.';

  return <Test name="Theme Effects Gallery" description={description} sections={effectsSections} status={status} />;
};
