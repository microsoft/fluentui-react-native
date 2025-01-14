import React from 'react';
import { Platform, View } from 'react-native';

import { ButtonV1 as Button } from '@fluentui-react-native/button';
import { Checkbox } from '@fluentui-react-native/experimental-checkbox';

import { mobileStyles } from '../Common/styles';

export const OtherCheckbox: React.FunctionComponent = () => {
  const [isChecked, setisChecked] = React.useState(false);

  const setCheckedTrue = React.useCallback(() => {
    setisChecked(true);
  }, []);

  const setCheckedFalse = React.useCallback(() => {
    setisChecked(false);
  }, []);

  const memoizedStyles = React.useMemo(() => (Platform.OS === 'android' ? { ...mobileStyles.containerSpacedEvenly, height: 150 } : {}), []);

  return (
    <View style={memoizedStyles}>
      <Button onClick={setCheckedTrue} size="small">
        Check controlled checkboxes below
      </Button>
      <Button onClick={setCheckedFalse} size="small">
        Uncheck controlled checkboxes below
      </Button>

      <Checkbox label="This is a controlled Checkbox" checked={isChecked} />
      {Platform.OS !== 'android' && (
        <>
          <Checkbox label="Checkbox rendered with labelPosition 'before' (controlled)" labelPosition="before" checked={isChecked} />
          <Checkbox label="A required checkbox with other required text" required="**" />
        </>
      )}
    </View>
  );
};
