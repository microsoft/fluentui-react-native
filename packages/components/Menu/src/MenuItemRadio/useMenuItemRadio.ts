import * as React from 'react';

import type { InteractionEvent } from '@fluentui-react-native/interactive-hooks';

import { useMenuContext } from '../context/menuContext';
import { useMenuListContext } from '../context/menuListContext';
import { useMenuCheckboxInteraction } from '../MenuItemCheckbox/useMenuItemCheckbox';
import type { MenuItemRadioProps, MenuItemRadioInfo } from '../MenuItemRadio/MenuItemRadio.types';

export const useMenuItemRadio = (props: MenuItemRadioProps): MenuItemRadioInfo => {
  const { disabled = false, name, persistOnClick } = props;
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
  }, []);

  return useMenuCheckboxInteraction(props, toggleChecked);
};
