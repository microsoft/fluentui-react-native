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
  spacing: {
    gap: 8,
  },
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
  Rectangle1: {
    backgroundColor: 'yellow',
    width: 300,
    height: 300,
  },
  Rectangle2: {
    position: 'absolute',
    top: 50,
    width: 400,
    height: 200,
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
  const viewProps: ViewProps = {
    focusable: true,
    style: [styles.box, styles.borderProps],
  };
  return (
    <Stack style={stackStyle}>
      <View style={[commonStyles.root, styles.spacing]}>
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
      <View style={[commonStyles.root, styles.spacing]}>
        <Text>{descriptionString}</Text>
        <VibrancyView {...viewProps} />
        <View {...viewProps} />
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
      <View style={styles.Rectangle1}>
        <VibrancyView material={material} blendingMode={blendingMode} state={state} style={styles.Rectangle2}>
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
        </VibrancyView>
      </View>
    </Stack>
  );
};

const HitTestButton = (props: { title: string }) => {
  return (
    <Button
      onClick={(_e) => {
        Alert.alert(props.title);
      }}
    >
      {props.title}
    </Button>
  );
};

const VibrancyViewHitTest: React.FunctionComponent = () => {
  return (
    <View style={commonStyles.root}>
      <HitTestButton title={'Button 1'} />
      <VibrancyView style={styles.biggerBox}>
        <HitTestButton title={'Button 2'} />
        <View allowsVibrancy={true} style={styles.centeredBox}>
          <HitTestButton title={'Button 3'} />
        </View>
        <HitTestButton title={'Button 4'} />
      </VibrancyView>
      <HitTestButton title={'Button 5'} />
    </View>
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
  {
    name: 'VibrancyView Hit Test',
    component: VibrancyViewHitTest,
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
