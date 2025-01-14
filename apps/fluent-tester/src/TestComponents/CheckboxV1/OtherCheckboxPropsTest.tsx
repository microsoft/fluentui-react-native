import React from 'react';
import { Platform, Pressable, View, type ViewStyle } from 'react-native';

import { ButtonV1 as Button } from '@fluentui-react-native/button';
import { Checkbox } from '@fluentui-react-native/experimental-checkbox';
import { TextV1 } from '@fluentui-react-native/text';

import { mobileStyles } from '../Common/styles';

const pressableStyle: ViewStyle = { borderWidth: 1, padding: 4, gap: 4, flexDirection: 'row', alignItems: 'center' };

export const OtherCheckbox: React.FunctionComponent = () => {
  const [isChecked, setisChecked] = React.useState(false);

  const setCheckedTrue = React.useCallback(() => {
    setisChecked(true);
  }, []);

  const setCheckedFalse = React.useCallback(() => {
    setisChecked(false);
  }, []);

  const onChange = React.useCallback((_e, checked: boolean) => {
    setisChecked(checked);
  }, []);

  const onPress = React.useCallback(() => {
    setisChecked(!isChecked);
  }, [isChecked]);

  const memoizedStyles = React.useMemo(
    () => (Platform.OS === 'android' ? { ...mobileStyles.containerSpacedEvenly, height: 150 } : { gap: 8 }),
    [],
  );

  return (
    <View style={memoizedStyles}>
      <View>
        <Button onClick={setCheckedTrue} size="small">
          Check controlled checkboxes below
        </Button>
        <Button onClick={setCheckedFalse} size="small">
          Uncheck controlled checkboxes below
        </Button>
      </View>

      <View>
        <Checkbox label="This is a controlled Checkbox" checked={isChecked} onChange={onChange} />
        <Pressable style={pressableStyle} onPress={onPress}>
          <Checkbox checked={isChecked} onChange={onChange} />
          <TextV1>A controlled checkbox in a Pressable. Pressing Pressable also toggles Checkbox</TextV1>
        </Pressable>

        {Platform.OS !== 'android' && (
          <>
            <Checkbox label="Checkbox rendered with labelPosition 'before' (controlled)" labelPosition="before" checked={isChecked} />
            <Checkbox label="A required checkbox with other required text" required="**" />
          </>
        )}
      </View>
    </View>
  );
};
