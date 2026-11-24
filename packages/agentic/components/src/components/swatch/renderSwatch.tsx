/** @jsxImportSource @fluentui-react-native/framework-base */
import type { SwatchState } from './swatch.types';

export function renderSwatch_unstable(state: SwatchState) {
  if (!state.hasIdentity) return null;
  return (
    <state.root ref={state.focusTargetRef}>
      <state.sample>
        {state.image && <state.image />}
        {state.indicator && state.mark && (
          <state.indicator>
            <state.mark />
          </state.indicator>
        )}
      </state.sample>
      {state.FocusRing && <state.FocusRing />}
    </state.root>
  );
}
