import * as React from 'react';
import type { View } from 'react-native';
import type { FocusTarget } from '@fluentui-react-native/framework-base';
import type { CalloutHandle, CalloutMenuPointerMoveEvent } from '@fluentui-react-native/callout';
import type {
  PopoverProps,
  PopoverState,
  PopoverCompositionState,
  PopoverCommittedAnchor,
  PopoverMenuHostOptions,
  PopoverMenuHostHandle,
  PopoverMenuHostBinding,
  PopoverCompositionOptions,
} from './popover.types';
import { usePopover_unstable } from './usePopover';
import { usePopoverStyles_unstable } from './usePopoverStyles';
import { renderPopover_unstable } from './renderPopover';

type Assert<T extends true> = T;
type Equal<T, U> = (<V>() => V extends T ? 1 : 2) extends <V>() => V extends U ? 1 : 2 ? true : false;

function useTypeContract(lifetime: FocusTarget, handle: CalloutHandle) {
  const host: PopoverMenuHostOptions = {
    policy: 'menu-macos',
    initialFocus: 'owner',
    presentationKey: 1,
    bindingRef: React.createRef<PopoverMenuHostBinding>(),
    onPointerMove(event) {
      const native: CalloutMenuPointerMoveEvent = event;
      return native;
    },
  };
  const attachment: PopoverCommittedAnchor = {
    nativeRef: React.createRef<View>(),
    mountGeneration: lifetime.generation,
    lifetime,
  };
  const normal: PopoverState = usePopover_unstable({});
  normal.trigger({});
  const root: PopoverCompositionState = usePopover_unstable({}, { host });
  const external: PopoverCompositionState = usePopover_unstable({}, { host, anchor: { mode: 'external', attachment } });
  const union: PopoverCompositionOptions = { host, anchor: { mode: 'external', attachment: null } };
  renderPopover_unstable(normal, usePopoverStyles_unstable(normal));
  renderPopover_unstable(root, usePopoverStyles_unstable(root));
  renderPopover_unstable(external, usePopoverStyles_unstable(external));
  const managed: PopoverMenuHostHandle = handle;
  managed.focusInitialChild?.('native-1', attachment.nativeRef);
  managed.focusOwnedChild?.('native-1', attachment.nativeRef, 'repair');
  managed.closeOwned?.('native-1', 'submenu-back', true);
  // @ts-expect-error Managed bindings do not expose unguarded legacy window activation.
  managed.focusWindow();
  const props: Assert<Equal<Extract<keyof PopoverProps, 'host'>, never>> = true;
  const raw: Assert<Equal<Extract<keyof PopoverMenuHostOptions, 'dismissBehaviors'>, never>> = true;
  // @ts-expect-error There is no automatic native focus policy in managed composition.
  const automatic: PopoverMenuHostOptions = { ...host, initialFocus: 'automatic' };
  // @ts-expect-error Windows family admission is not authorized by this adapter.
  const windows: PopoverMenuHostOptions = { ...host, policy: 'menu-windows' };
  return [normal, root, external, union, managed, props, raw, automatic, windows];
}

describe('Popover composition types', () => {
  it('checks ordinary required-trigger state and narrow native-derived composition contracts', () => {
    expect(useTypeContract).toBeDefined();
  });
});
