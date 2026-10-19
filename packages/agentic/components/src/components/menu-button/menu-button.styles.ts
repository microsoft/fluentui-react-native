import { getButtonIconSize } from '../button/button.styles';
import type { ButtonSize } from '../button/button.types';

/** The chevron matches Button's icon sizes: 16, 20, and 20 for small, medium, and large. */
export function getMenuButtonChevronSize(size: ButtonSize): number {
  return getButtonIconSize(size);
}
