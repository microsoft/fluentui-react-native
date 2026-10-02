/** @jsxImportSource @fluentui-react-native/framework-base */
import { Text } from '../text/text';
import type { PopoverState, PopoverCompositionState } from './popover.types';
import type { usePopoverStyles_unstable } from './usePopoverStyles';

export function renderPopover_unstable(
  state: PopoverState | PopoverCompositionState,
  styles: ReturnType<typeof usePopoverStyles_unstable>,
) {
  const { trigger: Trigger, surface: Surface, surfaceContent: SurfaceContent, content: Content } = state;
  return (
    <state.root>
      {Trigger && (
        <Trigger ref={state.focusTargetRef}>
          {state.FocusRing && <state.FocusRing />}
          {typeof state.triggerChildren === 'function' ? state.triggerChildren({ pressed: state.pressed }) : state.triggerChildren}
        </Trigger>
      )}
      {Surface && (
        <Surface key={state.surfaceKey}>
          <SurfaceContent>
            {Content &&
              (state.contentIsPlaceholder ? (
                <Content>
                  <Text style={styles.contentPlaceholderStyle}>Popover content</Text>
                </Content>
              ) : (
                <Content />
              ))}
          </SurfaceContent>
        </Surface>
      )}
    </state.root>
  );
}
