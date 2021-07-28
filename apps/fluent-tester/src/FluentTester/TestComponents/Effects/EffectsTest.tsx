import { Theme, useTheme } from '@fluentui-react-native/theme-types';
import { themedStyleSheet } from '@fluentui-react-native/themed-stylesheet';
import { Text } from '@fluentui/react-native';
import { Shadow, ShadowDepth } from '@fluentui-react-native/experimental-shadow';
import * as React from 'react';
import { FlatList, View } from 'react-native';
import { commonTestStyles } from '../Common/styles';
import { Test, TestSection, PlatformStatus } from '../Test';
import { EFFECTS_TESTPAGE } from './consts';

const getThemedStyles = themedStyleSheet((t: Theme) => {
  return {
    effectBox: {
      width: 366,
      minHeight: 64,
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
      backgroundColor: t.colors.background,
    },
    padding: {
      padding: 12,
      paddingHorizontal: 24,
    },
    vmargin: {
      marginVertical: 12,
    },
  };
});

const isBorderEffect = (effectName: string) => {
  return effectName.substr(0, 6) === 'border';
};

type EffectProps = { name: string; value?: string };
const BorderEffect: React.FunctionComponent<EffectProps> = (props: EffectProps) => {
  const theme = useTheme();
  const themedStyles = getThemedStyles(theme);
  const { name, value } = props;
  return (
    <View style={[themedStyles.effectBox, themedStyles.borderBox, themedStyles[name], commonTestStyles.vmargin, themedStyles.padding]}>
      <Text variant="subheaderStandard" style={[commonTestStyles.vmargin]}>
        {name}
      </Text>
      <Text style={[commonTestStyles.vmargin]}>{value}</Text>
    </View>
  );
};

function getShadowDescription(name: string, t: Theme): string {
  return (
    'Ambient\n' +
    JSON.stringify(t.effects[name].ambient, undefined, ' ').split('\n').join(' ') +
    '\n\nKey\n' +
    JSON.stringify(t.effects[name].key, undefined, ' ').split('\n').join(' ')
  );
}

interface ShadowEffectProps {
  depth: ShadowDepth;
}
const ShadowEffect: React.FunctionComponent<ShadowEffectProps> = (props: ShadowEffectProps) => {
  const theme = useTheme();
  const themedStyles = getThemedStyles(theme);
  const { depth } = props;
  const value = getShadowDescription('shadow' + props.depth, theme);
  const name = '<Shadow depth="' + depth + '" />';
  return (
    <Shadow
      depth={depth}
      borderRadius={theme.effects.borderRadiusMedium}
      padding={12}
      paddingHorizontal={24}
      style={[themedStyles.effectBox, themedStyles.vmargin]}
    >
      <Text variant="subheaderStandard" style={[commonTestStyles.vmargin]}>
        {name}
      </Text>
      <Text style={[commonTestStyles.vmargin]}>{value}</Text>
    </Shadow>
  );
};

const BorderEffectTest: React.FunctionComponent = () => {
  const effects = useTheme().effects;
  const aggregator = React.useCallback(
    (key: string) => {
      return { name: key, value: JSON.stringify(effects[key], undefined, ' ').replace('\n', ' ') };
    },
    [effects],
  );

  const flattenArray = React.useCallback(() => {
    return Object.keys(effects).filter(isBorderEffect).map(aggregator);
  }, [effects]);

  const effectsAsArray = React.useMemo(flattenArray, [flattenArray]);

  const renderBorder = React.useCallback(({ item }) => {
    return <BorderEffect {...item} key={item.name} />;
  }, []);

  return (
    <View style={[commonTestStyles.view, getThemedStyles(useTheme()).padding]}>
      <FlatList data={effectsAsArray} renderItem={renderBorder} />
    </View>
  );
};

const ShadowEffectTest: React.FunctionComponent = () => {
  return (
    <View style={[commonTestStyles.view, getThemedStyles(useTheme()).padding]}>
      <ShadowEffect depth="2" />
      <ShadowEffect depth="4" />
      <ShadowEffect depth="8" />
      <ShadowEffect depth="16" />
      <ShadowEffect depth="28" />
      <ShadowEffect depth="64" />
    </View>
  );
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
