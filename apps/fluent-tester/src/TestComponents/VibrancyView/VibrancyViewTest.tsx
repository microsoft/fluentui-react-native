import * as React from 'react';
import { Alert, type ViewProps } from 'react-native';
import { View, StyleSheet } from 'react-native-macos';

import { ButtonV1 as Button, Text } from '@fluentui/react-native';
import { Stack } from '@fluentui-react-native/stack';
import type { Material, BlendingMode, State } from '@fluentui-react-native/vibrancy-view';
import { VibrancyView } from '@fluentui-react-native/vibrancy-view';

import { VIBRANCYVIEW_TESTPAGE } from '../../../../E2E/src/VibrancyView/consts';
import { stackStyle, commonTestStyles as commonStyles } from '../Common/styles';
import type { TestSection, PlatformStatus } from '../Test';
import { Test } from '../Test';
import { MenuPicker } from '../Common/MenuPicker';

const styles = StyleSheet.create({
  box: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bigBox: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  biggerBox: {
    backgroundColor: 'yellow',
    width: 300,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centeredBox: {
    backgroundColor: 'green',
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  borderProps: {
    backgroundColor: 'blue',
    borderColor: 'red',
    borderWidth: 1,
    borderRadius: 8,
  },
});

const VibrancyViewDefault: React.FunctionComponent = () => {
  return (
    <Stack style={stackStyle}>
      <View style={commonStyles.root}>
        <Text>Vibrancy View with no props set</Text>
        <VibrancyView style={styles.box} />
      </View>
    </Stack>
  );
};

const VibrancyViewWithViewProps: React.FunctionComponent = () => {
  const descriptionString = '<View> and <VibrancyView> with the same props set';
  const viewProps: ViewProps = {
    focusable: true,
    style: [styles.box, styles.borderProps],
  };
  return (
    <Stack style={stackStyle}>
      <View style={commonStyles.root}>
        <Text>{descriptionString}</Text>
        <Stack horizontal={false} gap={10}>
          <VibrancyView {...viewProps} />
          <View {...viewProps} />
        </Stack>
      </View>
    </Stack>
  );
};

const VibrancyViewWithVibrancyViewProps: React.FunctionComponent = () => {
  const [material, setMaterial] = React.useState<Material>(undefined);
  const [blendingMode, setBlendingMode] = React.useState<BlendingMode>(undefined);
  const [state, setState] = React.useState<State>(undefined);

  const materialSelections: Material[] = [
    'titlebar',
    'selection',
    'menu',
    'popover',
    'sidebar',
    'headerview',
    'sheet',
    'windowbackground',
    'hudWindow',
    'fullScreenUI',
    'toolTip',
    'contentBackground',
    'underWindowBackground',
    'underPageBackground',
  ];
  const materialsCollection = materialSelections.map((material) => {
    return {
      label: material,
      value: material,
    };
  });

  const blendingModeSelections: BlendingMode[] = ['withinWindow', 'behindWindow'];
  const blendingModeCollection = blendingModeSelections.map((material) => {
    return {
      label: material,
      value: material,
    };
  });

  const stateSelections: State[] = ['followsWindowActiveState', 'active', 'inactive'];
  const stateCollection = stateSelections.map((material) => {
    return {
      label: material,
      value: material,
    };
  });

  return (
    <Stack style={stackStyle}>
      <MenuPicker
        prompt="Material"
        selected={material || 'undefined'}
        onChange={(material) => setMaterial(material)}
        collection={materialsCollection}
      />
      <MenuPicker
        prompt="Blending Mode"
        selected={blendingMode || 'undefined'}
        onChange={(blendingMode) => setBlendingMode(blendingMode)}
        collection={blendingModeCollection}
      />
      <MenuPicker prompt="State" selected={state || 'undefined'} onChange={(state) => setState(state)} collection={stateCollection} />
      <View style={commonStyles.root}>
        <View style={styles.biggerBox}>
          <Button
            onClick={(_e) => {
              Alert.alert('Hello');
            }}
          >
            Hello
          </Button>

          <VibrancyView material={material} blendingMode={blendingMode} state={state} style={styles.bigBox}>
            <Button
              onClick={(_e) => {
                Alert.alert('Hello');
              }}
            >
              Hello
            </Button>
            <View allowsVibrancy={true} style={styles.centeredBox}>
              <Button
                onClick={(_e) => {
                  Alert.alert('Hello');
                }}
              >
                Hello
              </Button>
            </View>
            <Button
              onClick={(_e) => {
                Alert.alert('Hello');
              }}
            >
              Hello
            </Button>
          </VibrancyView>
        </View>
      </View>
    </Stack>
  );
};

const VibrancyViewSections: TestSection[] = [
  {
    name: 'VibrancyView Default',
    testID: VIBRANCYVIEW_TESTPAGE,
    component: VibrancyViewDefault,
  },
  {
    name: 'VibrancyView with View props',
    component: VibrancyViewWithViewProps,
  },
  {
    name: 'VibrancyView with VibrancyView props',
    component: VibrancyViewWithVibrancyViewProps,
  },
];

export const VibrancyViewTest: React.FunctionComponent = () => {
  const status: PlatformStatus = {
    win32Status: 'N/A',
    uwpStatus: 'N/A',
    iosStatus: 'Backlog',
    macosStatus: 'Beta',
    androidStatus: 'N/A',
  };

  const description = 'VibrancyView is a native module that exposes NSVisualEffectView to React Native on macOS';

  return <Test name="VibrancyView Test" description={description} sections={VibrancyViewSections} status={status}></Test>;
};
