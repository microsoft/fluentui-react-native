/** @jsxImportSource @fluentui-react-native/framework-base */
import type { SwitchState } from './switch.types';

/**
 * Render the Switch component.
 */
export function renderSwitch_unstable(state: SwitchState) {
  const root = (
    <state.root>
      <state.track>
        <state.thumb />
      </state.track>
    </state.root>
  );

  if (state.layout === 'switch') {
    return <state.layoutContainer>{root}</state.layoutContainer>;
  }

  if (state.layout === 'horizontal') {
    return (
      <state.layoutContainer>
        {state.beforeLabel && <state.beforeLabel />}
        {root}
        {state.afterLabel && <state.afterLabel />}
      </state.layoutContainer>
    );
  }

  return (
    <state.layoutContainer>
      {state.aboveLabel && <state.aboveLabel />}
      {root}
    </state.layoutContainer>
  );
}
