import { InteractionEvent } from '@fluentui-react-native/interactive-hooks';
import React from 'react';
import { useMenuContext } from '../context/menuContext';
import { MenuListProps, MenuListState } from './MenuList.types';

export const useMenuList = (props: MenuListProps): MenuListState => {
  const context = useMenuContext();

  // MenuList v2 needs to be able to be standalone, but this is not in scope for v1
  // Assuming that checked information will come from parent Menu
  const isCheckedControlled = typeof context.checked !== 'undefined';
  const [checked, onCheckedChange] = useMenuCheckedState(isCheckedControlled, context);

  return {
    ...props,
    isCheckedControlled,
    checked,
    onCheckedChange,
  };
};

const useMenuCheckedState = (
  isControlled: boolean,
  props: MenuListProps,
): [Record<string, boolean>, (e: InteractionEvent, name: string, isChecked: boolean) => void] => {
  const { defaultChecked, onCheckedChange, checked } = props;
  const initialState = defaultChecked ?? checked ?? {};
  const [checkedInternal, setCheckedInternal] = React.useState<Record<string, boolean>>(initialState);

  const state = isControlled ? checked : checkedInternal;

  const setChecked = React.useCallback(
    (e: InteractionEvent, name: string, isChecked: boolean) => {
      if (!isControlled) {
        const curChecked = state;
        curChecked[name] = isChecked;
        const updatedChecked = { ...curChecked };
        setCheckedInternal(updatedChecked);
      }

      if (onCheckedChange) {
        onCheckedChange(e, name, isChecked);
      }
    },
    [isControlled, state, onCheckedChange, setCheckedInternal],
  );

  return [state, setChecked];
};
