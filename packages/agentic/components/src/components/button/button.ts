import type { ButtonProps } from './button.types';
import { useButton_unstable } from './useButton';
import { useButtonStyles_unstable } from './useButtonStyles';
import { renderButton_unstable } from './renderButton';

/**
 * A Button component, patterned after the Fluent UI design system and fluent v9 pattern of building components
 */
export const Button = (props: ButtonProps) => {
  const state = useButton_unstable(props);
  useButtonStyles_unstable(state);
  return renderButton_unstable(state);
};
Button.displayName = 'Button';

export default Button;
