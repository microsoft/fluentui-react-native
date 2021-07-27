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
    JSON.stringify(t.effects[name + 'Ambient'], undefined, ' ')
      .split('\n')
      .join(' ') +
    '\n\nKey\n' +
    JSON.stringify(t.effects[name + 'Key'], undefined, ' ')
      .split('\n')
      .join(' ')
  );
}

const ShadowEffect: React.FunctionComponent<EffectProps> = (props: EffectProps) => {
  const theme = useTheme();
  const themedStyles = getThemedStyles(theme);
  const { name, value = getShadowDescription(name, theme) } = props;
  return (
    <View
      style={[
        theme.effects[name + 'Key'],
        themedStyles.effectBox,
        themedStyles.shadowColor,
        themedStyles.borderRadiusMedium,
        themedStyles.vmargin,
      ]}
    >
      <View style={[theme.effects[name + 'Ambient'], themedStyles.shadowColor, themedStyles.borderRadiusMedium, themedStyles.padding]}>
        <Text variant="subheaderStandard" style={[commonTestStyles.vmargin]}>
          {name}
        </Text>
        <Text style={[commonTestStyles.vmargin]}>{value}</Text>
      </View>
    </View>
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
      <ShadowEffect name="shadow2" />
      <ShadowEffect name="shadow4" />
      <ShadowEffect name="shadow8" />
      <ShadowEffect name="shadow16" />
      <ShadowEffect name="shadow28" />
      <ShadowEffect name="shadow64" />
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
