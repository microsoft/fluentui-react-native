import React from 'react';

import { Checkbox } from '@fluentui-react-native/experimental-checkbox';

export const SizeCheckbox: React.FunctionComponent = () => {
  return (
    <>
      <Checkbox tooltip="Medium checkbox" size="medium" />
      <Checkbox tooltip="Large checkbox" size="large" />
      <Checkbox label="Medium checkbox" size="medium" />
      <Checkbox label="Large checkbox" size="large" />
    </>
  );
};
