import type { AccordionProps } from './accordion.types';
import { renderAccordion_unstable } from './renderAccordion';
import { useAccordionStyles_unstable } from './useAccordionStyles';
import { useAccordion_unstable } from './useAccordion';

/**
 * Accordion is a collapsible header/body composition for progressively disclosed content.
 */
export const Accordion = (props: AccordionProps) => {
  const state = useAccordion_unstable(props);
  const styles = useAccordionStyles_unstable(state);
  return renderAccordion_unstable(state, styles);
};

Accordion.displayName = 'Accordion';

export default Accordion;
