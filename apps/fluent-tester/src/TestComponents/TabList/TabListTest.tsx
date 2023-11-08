import React from 'react';
import { TextInput, View } from 'react-native';

import { ButtonV1 as Button } from '@fluentui-react-native/button';
import { CheckboxV1 as Checkbox } from '@fluentui-react-native/checkbox';
import { Divider } from '@fluentui-react-native/divider';
import { useFluentTheme } from '@fluentui-react-native/framework';
import { RadioGroupV1 as RadioGroup, Radio } from '@fluentui-react-native/radio-group';
import { TabList, Tab } from '@fluentui-react-native/tablist';
import type { TabListProps, TabProps, TabTokens } from '@fluentui-react-native/tablist';
import { TextV1 as Text } from '@fluentui-react-native/text';
import type { Theme } from '@fluentui-react-native/theme-types';
import { themedStyleSheet } from '@fluentui-react-native/themed-stylesheet';

import { TabListE2ETest } from './TabListE2ETest';
import { TABLIST_TESTPAGE } from '../../../../E2E/src/index.consts';
import { svgProps, fontProps } from '../Common/iconExamples';
import { commonTestStyles } from '../Common/styles';
import { stackStyle } from '../Common/styles';
import type { PlatformStatus, TestSection } from '../Test';
import { Test } from '../Test';

const SubHeader = Text.customize({ variant: 'subheaderStandard' });
const Header = Text.customize({ variant: 'headerStandard' });
const Line = Divider.customize({ paddingVertical: 4 });
const LineV = Divider.customize({ paddingHorizontal: 8 });
const PaddedTabList = TabList.customize({
  paddingVertical: 4,
});

const TabListDefaultTest: React.FunctionComponent = () => {
  const [key, setKey] = React.useState('tab1');
  return (
    <View style={stackStyle}>
      <Header>Uncontrolled Component</Header>
      <Line />
      <PaddedTabList defaultSelectedKey={'tab1'}>
        <Tab tabKey="tab1">Tab 1</Tab>
        <Tab tabKey="tab2">Tab 2</Tab>
        <Tab tabKey="tab3">Tab 3</Tab>
      </PaddedTabList>
      <Header>Controlled Component</Header>
      <Line />
      <Text>Selected Key: {key}</Text>
      <PaddedTabList
        selectedKey={key}
        onTabSelect={(val) => {
          console.log('New key:', val);
          setKey(val);
        }}
      >
        <Tab tabKey="tab1">Tab 1</Tab>
        <Tab tabKey="tab2">Tab 2</Tab>
        <Tab tabKey="tab3">Tab 3</Tab>
      </PaddedTabList>
    </View>
  );
};

const getStyles = themedStyleSheet((theme: Theme) => {
  return {
    horizontalStack: { display: 'flex', flexDirection: 'row' },
    flexOne: { flex: 1 },
    textInput: { ...commonTestStyles.textBox, backgroundColor: theme.colors.neutralBackground2 },
  };
});

interface SubmitInputProps {
  onSubmit: (value: string) => void;
  initialValue?: string;
  label?: string;
}
const SubmitInput: React.FunctionComponent<SubmitInputProps> = ({ label, onSubmit, initialValue }) => {
  const styles = getStyles(useFluentTheme());
  const [value, setValue] = React.useState(initialValue ?? '');

  const handleSubmit = React.useCallback(() => onSubmit(value), [onSubmit, value]);

  return (
    <View>
      {label && <Text variant="body2Strong">{label}</Text>}
      <View style={styles.horizontalStack}>
        <TextInput style={styles.textInput} value={value} onChangeText={setValue} />
        <Button onClick={handleSubmit}>Submit</Button>
      </View>
    </View>
  );
};

const tabStates = [
  'small',
  'medium',
  'large',
  'vertical',
  'hovered',
  'disabled',
  'selected',
  'focused',
  'pressed',
  'transparent',
  'subtle',
  'hasIcon',
];

const CustomizableTabList: React.FunctionComponent = () => {
  const styles = getStyles(useFluentTheme());
  const [tablistProps, setTablistProps] = React.useState<TabListProps>({
    defaultSelectedKey: 'A',
    appearance: 'transparent',
    size: 'medium',
    vertical: false,
    disabled: false,
  });
  const [tabPropsDict, setTabPropsDict] = React.useState<{ [tabKey: string]: TabProps }>({
    A: { tabKey: 'A', children: 'Tab A' },
    B: { tabKey: 'B', children: 'Tab B' },
    C: { tabKey: 'C', children: 'Tab C' },
    D: { tabKey: 'D', children: 'Tab D' },
  });
  const [tabsToRender, setTabsToRender] = React.useState({
    A: true,
    B: true,
    C: true,
    D: true,
  });
  const [showTabControls, setShowTabControls] = React.useState({
    A: false,
    B: false,
    C: false,
    D: false,
  });
  const [tabTokensDict, setTabTokensDict] = React.useState<{ [tabKey: string]: TabTokens }>({ A: {}, B: {}, C: {}, D: {} });

  const setTabProp = React.useCallback(
    <T extends keyof TabProps>(tabKey: string, propName: T, value: TabProps[T]) => {
      setTabPropsDict((prev) => {
        const newProps = prev[tabKey];
        if (value === '') {
          delete newProps[propName];
        } else {
          newProps[propName] = value;
        }
        return { ...prev, [tabKey]: newProps };
      });
    },
    [setTabPropsDict],
  );
  const setTabToken = React.useCallback(
    <T extends keyof TabTokens>(tabKey: string, tokenName: T, value: TabTokens[T]) => {
      setTabTokensDict((prev) => {
        const newTokens = prev[tabKey];
        if (value === '') {
          delete newTokens[tokenName];
          for (const state of tabStates) {
            if (newTokens[state][tokenName]) delete newTokens[state][tokenName];
          }
        } else {
          newTokens[tokenName] = value;
          for (const state of tabStates) {
            if (newTokens[state]) {
              newTokens[state][tokenName] = value;
            } else {
              newTokens[state] = { [tokenName]: value };
            }
          }
        }
        return { ...prev, [tabKey]: newTokens };
      });
    },
    [setTabTokensDict],
  );
  const setTabTokenIfCastableToInt = React.useCallback(
    <T extends keyof TabTokens>(tabKey: string, tokenName: T, value: string) => {
      const casted = parseInt(value);
      if (casted) {
        setTabToken(tabKey, tokenName, casted as any);
      } else if (value === '') {
        setTabToken(tabKey, tokenName, value as any);
      } else {
        console.warn(value, 'could not be casted to an integer.');
      }
    },
    [setTabToken],
  );

  const customizedTabs = {
    A: Tab.customize(tabTokensDict['A']),
    B: Tab.customize(tabTokensDict['B']),
    C: Tab.customize(tabTokensDict['C']),
    D: Tab.customize(tabTokensDict['D']),
  };

  return (
    <View style={stackStyle}>
      <Header>TabList Props</Header>
      <View style={styles.horizontalStack}>
        <RadioGroup
          value={tablistProps.appearance}
          label="Appearance"
          onChange={(appearance) => setTablistProps((prev) => ({ ...prev, appearance: appearance as any }))}
        >
          <Radio label="Transparent" value="transparent" />
          <Radio label="Subtle" value="subtle" />
        </RadioGroup>
        <LineV insetSize={16} vertical />
        <RadioGroup value={tablistProps.size} label="Size" onChange={(size) => setTablistProps((prev) => ({ ...prev, size: size as any }))}>
          <Radio label="Small" value="small" />
          <Radio label="Medium" value="medium" />
          <Radio label="Large" value="large" />
        </RadioGroup>
        <LineV insetSize={16} vertical />
        <View>
          <Checkbox
            label="Disabled"
            checked={tablistProps.disabled}
            onChange={(_, checked) => setTablistProps((prev) => ({ ...prev, disabled: checked }))}
          />
          <Checkbox
            label="Vertical"
            checked={tablistProps.vertical}
            onChange={(_, checked) => setTablistProps((prev) => ({ ...prev, vertical: checked }))}
          />
        </View>
      </View>
      <View>
        <Header>Tab Props / Tokens / Settings</Header>
        {Object.entries(tabPropsDict).map(([tabKey, props], i) => {
          const controls = (
            <>
              <View style={styles.horizontalStack} key={i}>
                <View>
                  <SubmitInput
                    label="Text Content"
                    initialValue={props.children as any}
                    onSubmit={(val) => setTabProp(tabKey, 'children', val)}
                  />
                  <Checkbox label="Disabled" checked={props.disabled} onChange={(_, checked) => setTabProp(tabKey, 'disabled', checked)} />
                  <Checkbox
                    label="Render"
                    checked={tabsToRender[tabKey]}
                    onChange={(_, checked) => setTabsToRender((prev) => ({ ...prev, [tabKey]: checked }))}
                  />
                  <RadioGroup
                    label="Icon"
                    defaultValue="none"
                    onChange={(key) => {
                      switch (key) {
                        case 'none':
                          setTabProp(tabKey, 'icon', undefined);
                          break;
                        case 'font':
                          setTabProp(tabKey, 'icon', { fontSource: fontProps });
                          break;
                        case 'svg':
                          setTabProp(tabKey, 'icon', { svgSource: svgProps });
                          break;
                        default:
                      }
                    }}
                  >
                    <Radio label="None" value="none" />
                    <Radio label="Font Icon" value="font" />
                    <Radio label="SVG Icon" value="svg" />
                  </RadioGroup>
                </View>
                <LineV vertical />
                <View>
                  <SubmitInput label="Background Color" onSubmit={(v) => setTabToken(tabKey, 'backgroundColor', v)} />
                  <SubmitInput label="Border Color" onSubmit={(v) => setTabToken(tabKey, 'borderColor', v)} />
                  <SubmitInput label="Border Width" onSubmit={(v) => setTabTokenIfCastableToInt(tabKey, 'borderWidth', v)} />
                  <SubmitInput label="Border Radius" onSubmit={(v) => setTabTokenIfCastableToInt(tabKey, 'borderRadius', v)} />
                  <SubmitInput label="Border Style" onSubmit={(v) => setTabToken(tabKey, 'borderStyle', v as any)} />
                </View>
                <LineV vertical />
                <View>
                  <SubmitInput label="Color" onSubmit={(v) => setTabToken(tabKey, 'color', v)} />
                  <SubmitInput label="Content Margin Start" onSubmit={(v) => setTabTokenIfCastableToInt(tabKey, 'contentMarginStart', v)} />
                  <SubmitInput label="Content Margin End" onSubmit={(v) => setTabTokenIfCastableToInt(tabKey, 'contentMarginEnd', v)} />
                  <SubmitInput label="Flex Direction" onSubmit={(v) => setTabToken(tabKey, 'flexDirection', v as any)} />
                  <SubmitInput label="Indicator Color" onSubmit={(v) => setTabToken(tabKey, 'indicatorColor', v)} />
                </View>
                <LineV vertical />
                <View>
                  <SubmitInput label="Indicator Margin" onSubmit={(v) => setTabTokenIfCastableToInt(tabKey, 'indicatorMargin', v)} />
                  <SubmitInput label="Indicator Orientation" onSubmit={(v) => setTabToken(tabKey, 'indicatorOrientation', v as any)} />
                  <SubmitInput label="Indicator Radius" onSubmit={(v) => setTabTokenIfCastableToInt(tabKey, 'indicatorRadius', v)} />
                  <SubmitInput label="Indicator Thickness" onSubmit={(v) => setTabTokenIfCastableToInt(tabKey, 'indicatorThickness', v)} />
                  <SubmitInput label="Icon Color" onSubmit={(v) => setTabToken(tabKey, 'iconColor', v)} />
                </View>
                <LineV vertical />
                <View>
                  <SubmitInput label="Icon Size" onSubmit={(v) => setTabTokenIfCastableToInt(tabKey, 'iconSize', v)} />
                  <SubmitInput
                    label="Stack Margin Horizontal"
                    onSubmit={(v) => setTabTokenIfCastableToInt(tabKey, 'stackMarginHorizontal', v)}
                  />
                  <SubmitInput
                    label="Stack Margin Vertical"
                    onSubmit={(v) => setTabTokenIfCastableToInt(tabKey, 'stackMarginVertical', v)}
                  />
                </View>
              </View>
            </>
          );
          return (
            <>
              <View style={styles.horizontalStack}>
                <SubHeader style={styles.flexOne}>Tab {tabKey}</SubHeader>
                <Button onClick={() => setShowTabControls((prev) => ({ ...prev, [tabKey]: !prev[tabKey] }))}>
                  {showTabControls[tabKey] ? 'Collapse ^' : 'Expand v'}
                </Button>
              </View>
              <Line />
              {showTabControls[tabKey] && controls}
            </>
          );
        })}
      </View>
      <Line />
      <TabList {...tablistProps}>
        {Object.keys(tabPropsDict)
          .filter((tabKey) => tabsToRender[tabKey])
          .map((tabKey, i) => {
            const CustomizedTab = customizedTabs[tabKey];
            return <CustomizedTab key={i} {...tabPropsDict[tabKey]} />;
          })}
      </TabList>
    </View>
  );
};

const sections: TestSection[] = [
  {
    name: 'Controlled vs Uncontrolled',
    component: TabListDefaultTest,
    testID: TABLIST_TESTPAGE,
  },
  {
    name: 'Customized TabList',
    component: CustomizableTabList,
  },
];

const e2eSections: TestSection[] = [
  {
    name: 'E2E Tests',
    component: TabListE2ETest,
  },
];

export const TabListTest: React.FunctionComponent = () => {
  const status: PlatformStatus = {
    win32Status: 'Experimental',
    uwpStatus: 'Experimental',
    iosStatus: 'Backlog',
    macosStatus: 'Experimental',
    androidStatus: 'Backlog',
  };

  const description = 'With Tabs, users can navigate to another view.';

  return <Test name="TabsV1 Test" description={description} sections={sections} status={status} e2eSections={e2eSections} />;
};
