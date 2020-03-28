import * as React from 'react';
<<<<<<< HEAD:apps/fluent-tester/src/RNTester/TestComponents/index.ts
import { ButtonFocusTest } from './ButtonFocusTest';
import { PressableTest } from './PressableTest';
import { LinkTest } from './LinkTest';
import { SeparatorTest } from './SeparatorTest';
import { ThemeTest } from './ThemeTest';
import { FocusTrapTest } from './FocusTrapZoneTest';
import { PersonaCoinTest } from './PersonaCoin/PersonaCoinTest';
import { RadioGroupTest } from './RadioGroupTest';
import { PersonaTest } from './Persona/PersonaTest';
=======
import { ButtonFocusTest } from './Button';
import { CalloutTest } from './Callout';
import { CheckboxTest } from './CheckboxTest';
import { FocusTrapTest } from './FocusTrapZone';
import { LinkTest } from './Link';
import { PersonaTest } from './Persona';
import { PersonaCoinTest } from './PersonaCoin';
import { PressableTest } from './Pressable';
import { RadioGroupTest } from './RadioGroup';
import { SeparatorTest } from './Separator';
import { ThemeTest } from './Theme';
>>>>>>> upstream/master:experiments/tester/src/RNTester/TestComponents/index.ts

export type TestDescription = {
  name: string;
  component: React.FunctionComponent<{}>;
};

export const allTestComponents: TestDescription[] = [
  {
    name: 'Button Test',
    component: ButtonFocusTest
  },
  {
    name: 'Callout Test',
    component: CalloutTest
  },
  {
    name: 'Focus Trap Zone Test',
    component: FocusTrapTest
  },
  {
    name: 'Pressable Test',
    component: PressableTest
  },
  {
    name: 'Link Test',
    component: LinkTest
  },
  {
    name: 'Separator Test',
    component: SeparatorTest
  },
  {
    name: 'Theme Test',
    component: ThemeTest
  },
  {
    name: 'PersonaCoin Test',
    component: PersonaCoinTest
  },
  {
    name: 'RadioGroup Test',
    component: RadioGroupTest
  },
  {
    name: 'Persona Test',
    component: PersonaTest
  },
  {
    name: 'Checkbox Test',
    component: CheckboxTest
  }
];
