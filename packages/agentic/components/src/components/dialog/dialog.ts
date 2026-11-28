import type { DialogProps } from './dialog.types';
import { renderDialog_unstable } from './renderDialog';
import { useDialog_unstable } from './useDialog';
import { useDialogStyles_unstable } from './useDialogStyles';

export const Dialog = (props: DialogProps) => {
  const state = useDialog_unstable(props);
  useDialogStyles_unstable(state);
  return renderDialog_unstable(state);
};
Dialog.displayName = 'Dialog';
