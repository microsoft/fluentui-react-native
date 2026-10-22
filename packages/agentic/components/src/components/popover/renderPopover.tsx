/** @jsxImportSource @fluentui-react-native/framework-base */
import { PopoverSurfaceContext } from './popoverContext';
import type { PopoverState } from './popover.types';

/**
 * Renders the trigger and, while presented, the native popup whose surface hosts the content inside the scene's
 * input boundary.
 */
export function renderPopover_unstable(state: PopoverState) {
  const { callout: Callout, inputBoundary: InputBoundary, trigger: Trigger } = state;
  return (
    <state.root>
      <Trigger ref={state.anchorRef} />
      <Callout placement={state.calloutPlacement} content={state.surfaceContent}>
        <InputBoundary>
          <PopoverSurfaceContext.Provider value>{state.children}</PopoverSurfaceContext.Provider>
        </InputBoundary>
      </Callout>
    </state.root>
  );
}
