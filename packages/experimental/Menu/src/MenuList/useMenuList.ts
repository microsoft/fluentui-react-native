import { InteractionEvent } from '@fluentui-react-native/interactive-hooks';
import React from 'react';
import { useMenuContext } from '../context/menuContext';
import { MenuListProps, MenuListState } from './MenuList.types';

// Track the radio items so we know what to clear selection from when selectRadio is called
const radioItems = [];
const addRadioItem = (name: string) => {
  radioItems.push(name);
};
const removeRadioItem = (name: string) => {
  radioItems.filter((item) => item !== name);
};

export const useMenuList = (_props: MenuListProps): MenuListState => {
  const context = useMenuContext();

  // MenuList v2 needs to be able to be standalone, but this is not in scope for v1
  // Assuming that checked information will come from parent Menu
  const { defaultChecked, onCheckedChange: onCheckedChangeOriginal, checked: checkedOriginal } = context;
  const [checkedInternal, setCheckedInternal] = React.useState<Record<string, boolean>>(defaultChecked ?? checkedOriginal ?? {});

  const isCheckedControlled = typeof checkedOriginal !== 'undefined';
  const checked = isCheckedControlled ? checkedOriginal : checkedInternal;

  const onCheckedChange = React.useCallback(
    (e: InteractionEvent, name: string, isChecked: boolean) => {
      if (!isCheckedControlled) {
        const updatedChecked = { ...checked };
        updatedChecked[name] = isChecked;
        setCheckedInternal(updatedChecked);
      }

      if (onCheckedChangeOriginal) {
        onCheckedChangeOriginal(e, name, isChecked);
      }
    },
    [isCheckedControlled, checked, onCheckedChangeOriginal, setCheckedInternal],
  );

  const selectRadio = React.useCallback(
    (e: InteractionEvent, name: string, isChecked: boolean) => {
      if (!isCheckedControlled) {
        const updatedChecked = {};
        for (const checkedName of Object.keys(checked)) {
          if (!radioItems.includes(checkedName)) {
            updatedChecked[checkedName] = true;
          }
        }
        updatedChecked[name] = true;
        setCheckedInternal(updatedChecked);
      }

      if (onCheckedChangeOriginal) {
        onCheckedChangeOriginal(e, name, isChecked);
      }
    },
    [isCheckedControlled, onCheckedChangeOriginal, setCheckedInternal, radioItems, checked],
  );

  return {
    ...context,
    isCheckedControlled,
    checked,
    onCheckedChange,
    selectRadio,
    addRadioItem,
    removeRadioItem,
  };
};
