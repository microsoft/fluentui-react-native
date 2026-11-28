/** @jsxImportSource @fluentui-react-native/framework-base */
import type { TeachingPopoverState } from './teaching-popover.types';
import { StepAnnouncement } from './stepAnnouncement';

export function renderTeachingPopover_unstable(state: TeachingPopoverState) {
  if (!state.label.trim()) return null;
  return (
    <state.root>
      <state.content>
        {state.stepKey !== undefined && <StepAnnouncement stepKey={state.stepKey} text={state.stepAnnouncement} />}
        <state.header>
          <state.title />
          {state.close && <state.close />}
        </state.header>
        {state.image && <state.image />}
        {state.body && <state.body />}
        {state.children}
        {state.footer && (
          <state.footer>
            {state.progress && <state.progress />}
            {state.secondary && <state.secondary />}
            {state.primary && <state.primary />}
          </state.footer>
        )}
      </state.content>
    </state.root>
  );
}
