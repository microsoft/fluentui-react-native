/** @jsxImportSource @fluentui-react-native/framework-base */
import { FocusVisual } from '../../primitives/focus-visual/focus-visual';
import { Text } from '../text/text';
import type { PopoverRenderStyles } from './usePopoverStyles';
import type { PopoverState } from './popover.types';

/**
 * Renders the resolved Popover slot tree. The floating surface and its content mount only while the popover is open.
 */
export function renderPopover_unstable(state: PopoverState, styles: PopoverRenderStyles) {
  const {
    content: Content,
    contentIsPlaceholder,
    open,
    surface: Surface,
    surfaceContent: SurfaceContent,
    trigger: Trigger,
    triggerChildren,
  } = state;

  return (
    <state.root>
      <Trigger>
        <FocusVisual {...state.focusVisualProps} />
        {triggerChildren}
      </Trigger>
      {open && (
        <Surface>
          <SurfaceContent>
            {Content &&
              (contentIsPlaceholder ? (
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
