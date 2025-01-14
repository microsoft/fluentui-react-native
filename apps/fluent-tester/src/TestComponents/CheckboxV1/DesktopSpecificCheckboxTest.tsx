import React from 'react';

import { Checkbox } from '@fluentui-react-native/experimental-checkbox';

export const DesktopSpecificCheckbox: React.FunctionComponent = () => {
  return (
    <>
      <Checkbox label="Checkbox will display a tooltip" tooltip="This is a tooltip" />
      <Checkbox label="A circular checkbox" shape="circular" />
      <Checkbox label="A checkbox with label placed before" labelPosition="before" />
    </>
  );
};
