import * as React from 'react';
import { InteractionEvent } from '@fluentui-react-native/interactive-hooks';
import { useMenuListContext } from '../context/menuListContext';
import { MenuItemCheckboxProps, MenuItemCheckboxState } from '../MenuItemCheckbox/MenuItemCheckbox.types';
import { useMenuCheckboxInteraction } from '../MenuItemCheckbox/useMenuItemCheckbox';
import { useMenuContext } from '../context/menuContext';

export const useMenuItemRadio = (props: MenuItemCheckboxProps): MenuItemCheckboxState => {
  const { disabled, name, persistOnClick } = props;
  const context = useMenuContext();
  const listContext = useMenuListContext();
  const selectRadio = listContext.selectRadio;
  const setOpen = context.setOpen;
  let shouldPersist = context.persistOnItemClick;
  shouldPersist = persistOnClick ?? shouldPersist;

  const toggleChecked = React.useCallback(
    (e: InteractionEvent) => {
      if (!disabled) {
        selectRadio(e, name);
        if (!shouldPersist) {
          setOpen(e, false /*isOpen*/, true /*bubble*/);
        }
      }
    },
    [disabled, name, selectRadio, setOpen, shouldPersist],
  );

  // Explicitly only run on mount and unmount
  React.useEffect(() => {
    listContext.addRadioItem(name);

    return () => {
      listContext.removeRadioItem(name);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return useMenuCheckboxInteraction(props, toggleChecked);
};
