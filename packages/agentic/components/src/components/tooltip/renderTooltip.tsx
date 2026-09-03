/** @jsxImportSource @fluentui-react-native/framework-base */
import { FocusVisual } from '../../primitives/focus-visual/focus-visual';
import type { TooltipState } from './tooltip.types';

/**
 * Renders the resolved Tooltip slot tree. The label surface and its text mount only while the tooltip is visible, so a
 * hidden tooltip contributes no view, no accessibility node, and no focus target.
 */
export function renderTooltip_unstable(state: TooltipState) {
  const { content: Content, surface: Surface, surfaceContent: SurfaceContent, trigger: Trigger, triggerChildren, visible } = state;

  return (
    <state.root>
      <Trigger>
        <FocusVisual {...state.focusVisualProps} />
        {triggerChildren}
      </Trigger>
      {visible && (
        <Surface>
          <SurfaceContent>
            <Content />
          </SurfaceContent>
        </Surface>
      )}
    </state.root>
  );
}
