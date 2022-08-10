import * as React from 'react';
import { COMPONENT_NAME_TESTPAGE } from './consts';
import { ComponentNameDefault } from './ComponentNameDefault';
import { Test, TestSection } from '../Test';

const componentNameSections: TestSection[] = [
  {
    name: 'ComponentName Page',
    testID: COMPONENT_NAME_TESTPAGE,
    component: ComponentNameDefault,
  },
];

export const ComponentNameTest: React.FunctionComponent = () => {
  const description = 'component-description';

  return <Test name="ComponentName Test" description={description} sections={componentNameSections} />;
};
