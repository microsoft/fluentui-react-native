/** @jsxImportSource @fluentui-react-native/framework-base */
import * as React from 'react';

import { Callout } from '@fluentui-react-native/callout';
import type { CalloutHandle, CalloutProps } from '@fluentui-react-native/callout';

import type { PopoverAnchor } from './usePopoverAnchor';
import type { PopoverMenuHostOptions } from './popover.types';
import type { PopoverMenuSession } from './popoverMenuSession';

type PopoverSurfaceProps = Omit<CalloutProps, 'target' | 'componentRef' | 'onRestoreFocus'> & {
  anchor: PopoverAnchor;
  liveAnchor: PopoverAnchor['target'];
  menuSession?: PopoverMenuSession;
  menuOptions?: PopoverMenuHostOptions;
};

/** A real React boundary keeps Callout's phased hooks scoped to this open session. */
export function PopoverSurface(props: PopoverSurfaceProps) {
  return props.menuSession ? <ManagedPopoverSurface {...props} /> : <LegacyPopoverSurface {...props} />;
}

function ManagedPopoverSurface({
  anchor,
  menuSession,
  menuOptions,
  liveAnchor: _liveAnchor,
  onDismiss: _onDismiss,
  ...props
}: PopoverSurfaceProps) {
  const setHandle = React.useCallback(
    (handle: CalloutHandle | null) => {
      menuSession.attachHandle(handle);
      return () => menuSession.attachHandle(null);
    },
    [menuSession],
  );
  React.useImperativeHandle(menuOptions?.bindingRef, () => menuSession.binding, [menuSession]);
  React.useLayoutEffect(() => {
    menuSession.mount();
    return () => menuSession.unmount();
  }, [menuSession]);
  return (
    <Callout
      {...props}
      target={anchor.target}
      componentRef={setHandle}
      menuFocusManagement
      setInitialFocus={false}
      onReady={menuSession.onReady}
      onDismissContext={menuSession.onDismissContext}
      onMenuPointerMove={menuSession.onPointerMove}
      onShow={menuSession.onShow}
      onDismiss={menuSession.onDismiss}
    />
  );
}

function LegacyPopoverSurface({
  anchor,
  liveAnchor,
  onDismiss,
  menuSession: _menuSession,
  menuOptions: _menuOptions,
  ...props
}: PopoverSurfaceProps) {
  const active = React.useRef(false);
  const dismissed = React.useRef(false);
  React.useLayoutEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);
  const handleDismiss = React.useCallback(() => {
    if (active.current && !dismissed.current && liveAnchor.current === anchor.target.current) {
      dismissed.current = true;
      onDismiss?.();
    }
  }, [anchor, liveAnchor, onDismiss]);

  return <Callout {...props} target={anchor.target} onDismiss={handleDismiss} />;
}
