/** @jsxImportSource @fluentui-react-native/framework-base */
import { View } from 'react-native';

import { hiddenFromAccessibilityProps } from '../../common/accessibility';
import { getDividerChrome } from './divider.styles';
import type { DividerState } from './divider.types';

/**
 * Renders the Divider component.
 */
export function renderDivider_unstable(
  state: DividerState,
  { before, after }: Pick<ReturnType<typeof getDividerChrome>, 'before' | 'after'> = getDividerChrome(state),
) {
  return (
    <state.root>
      <View {...hiddenFromAccessibilityProps} style={before} />
      {state.contentContainer && (
        <>
          <state.contentContainer>
            {state.icon && <state.icon />}
            {state.label && <state.label />}
          </state.contentContainer>
          <View {...hiddenFromAccessibilityProps} style={after} />
        </>
      )}
    </state.root>
  );
}
