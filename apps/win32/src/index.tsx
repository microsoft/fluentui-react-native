'use strict';

import { customRegistry, FabricTester, IFabricTesterProps } from '@fluentui-react-native/tester';
import { ThemeProvider } from '@uifabricshared/theming-react-native';
import * as React from 'react';
import { AppRegistry } from 'react-native';
import { TestDescription } from '../../fluent-tester/src/RNTester/TestComponents';
import { ButtonFocusTest, HOMEPAGE_BUTTON_BUTTON } from '../../fluent-tester/src/RNTester/TestComponents/Button';
import { CalloutTest, HOMEPAGE_CALLOUT_BUTTON } from '../../fluent-tester/src/RNTester/TestComponents/Callout';
import { CheckboxTest, HOMEPAGE_CHECKBOX_BUTTON } from '../../fluent-tester/src/RNTester/TestComponents/Checkbox';
import { FocusTrapTest, HOMEPAGE_FOCUSTRAPZONE_BUTTON } from '../../fluent-tester/src/RNTester/TestComponents/FocusTrapZone';
import { HOMEPAGE_LINK_BUTTON, LinkTest } from '../../fluent-tester/src/RNTester/TestComponents/Link';
import { HOMEPAGE_PERSONA_BUTTON, PersonaTest } from '../../fluent-tester/src/RNTester/TestComponents/Persona';
import { HOMEPAGE_PERSONACOIN_BUTTON, PersonaCoinTest } from '../../fluent-tester/src/RNTester/TestComponents/PersonaCoin';
import { HOMEPAGE_PRESSABLE_BUTTON, PressableTest } from '../../fluent-tester/src/RNTester/TestComponents/Pressable';
import { HOMEPAGE_RADIOGROUP_BUTTON, RadioGroupTest } from '../../fluent-tester/src/RNTester/TestComponents/RadioGroup';
import { HOMEPAGE_SEPARATOR_BUTTON, SeparatorTest } from '../../fluent-tester/src/RNTester/TestComponents/Separator';
import { HOMEPAGE_SVG_BUTTON, SvgTest } from '../../fluent-tester/src/RNTester/TestComponents/Svg';
import { HOMEPAGE_TEXT_BUTTON, TextTest } from '../../fluent-tester/src/RNTester/TestComponents/Text';
import { HOMEPAGE_THEME_BUTTON, ThemeTest } from '../../fluent-tester/src/RNTester/TestComponents/Theme';

const tests: TestDescription[] = [
  {
    name: 'Button Test',
    component: ButtonFocusTest,
    testPage: HOMEPAGE_BUTTON_BUTTON
  },
  {
    name: 'Callout Test',
    component: CalloutTest,
    testPage: HOMEPAGE_CALLOUT_BUTTON
  },
  {
    name: 'Focus Trap Zone Test',
    component: FocusTrapTest,
    testPage: HOMEPAGE_FOCUSTRAPZONE_BUTTON
  },
  {
    name: 'Pressable Test',
    component: PressableTest,
    testPage: HOMEPAGE_PRESSABLE_BUTTON
  },
  {
    name: 'Link Test',
    component: LinkTest,
    testPage: HOMEPAGE_LINK_BUTTON
  },
  {
    name: 'Separator Test',
    component: SeparatorTest,
    testPage: HOMEPAGE_SEPARATOR_BUTTON
  },
  {
    name: 'Text Test',
    component: TextTest,
    testPage: HOMEPAGE_TEXT_BUTTON
  },
  {
    name: 'Theme Test',
    component: ThemeTest,
    testPage: HOMEPAGE_THEME_BUTTON
  },
  {
    name: 'PersonaCoin Test',
    component: PersonaCoinTest,
    testPage: HOMEPAGE_PERSONACOIN_BUTTON
  },
  {
    name: 'RadioGroup Test',
    component: RadioGroupTest,
    testPage: HOMEPAGE_RADIOGROUP_BUTTON
  },
  {
    name: 'Persona Test',
    component: PersonaTest,
    testPage: HOMEPAGE_PERSONA_BUTTON
  },
  {
    name: 'Checkbox Test',
    component: CheckboxTest,
    testPage: HOMEPAGE_CHECKBOX_BUTTON
  },
  {
    name: 'Svg Test',
    component: SvgTest,
    testPage: HOMEPAGE_SVG_BUTTON
  }
];

const FluentTester: React.FunctionComponent<IFabricTesterProps> = props => {
  return (
    <ThemeProvider registry={customRegistry}>
      <FabricTester enabledTest={tests} {...props} />
    </ThemeProvider>
  );
};

AppRegistry.registerComponent('FluentTester', () => FluentTester);

export default FluentTester;
