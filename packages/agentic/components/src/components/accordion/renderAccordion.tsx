/** @jsxImportSource @fluentui-react-native/framework-base */
import type { ReactNode } from 'react';
import { Text } from 'react-native';
import type { StyleProp, TextStyle } from 'react-native';

import { FocusVisual } from '../../primitives/focus-visual/focus-visual';
import type { AccordionState } from './accordion.types';

type AccordionRenderStyles = {
  bodyPlaceholderStyle: StyleProp<TextStyle>;
};

/**
 * Renders the resolved Accordion slot tree.
 */
export function renderAccordion_unstable(state: AccordionState, styles: AccordionRenderStyles) {
  const {
    body: Body,
    bodyContent: BodyContent,
    chevron: Chevron,
    chevronContainer: ChevronContainer,
    header: Header,
    layout,
    leadingIcon: LeadingIcon,
    title: Title,
  } = state;
  const bodyFallback: ReactNode = <Text style={styles.bodyPlaceholderStyle}>Content placeholder</Text>;

  return (
    <state.root>
      <Header>
        <FocusVisual {...state.focusVisualProps} />
        {layout === 'chevronStart' ? (
          <>
            <ChevronContainer>
              <Chevron />
            </ChevronContainer>
            {LeadingIcon && <LeadingIcon />}
            {Title && <Title />}
          </>
        ) : (
          <>
            {LeadingIcon && <LeadingIcon />}
            {Title && <Title />}
            <ChevronContainer>
              <Chevron />
            </ChevronContainer>
          </>
        )}
      </Header>
      <Body>{BodyContent ? <BodyContent /> : bodyFallback}</Body>
    </state.root>
  );
}
