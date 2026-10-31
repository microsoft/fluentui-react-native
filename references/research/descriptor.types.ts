import type { SemanticColors } from './tokens.types';

export type InteractiveColorName = keyof SemanticColors;

export type ComponentDescriptor = {
  parentDescriptor: ComponentDescriptor;

  colors: {
    /**
     * Background color, if required
     */
    bg?: InteractiveColorName;
    'bg.disabled'?: InteractiveColorName;

    /**
     * Foreground color, if needed
     */
    fg?: InteractiveColorName;
    'fg.disabled'?: InteractiveColorName;

    /**
     * Stroke/border color, if needed
     */
    stroke?: InteractiveColorName;
    'stroke.disabled'?: InteractiveColorName;

    [key: `fg.${string}`]: InteractiveColorName;
    [key: `stroke.${string}`]: InteractiveColorName;
    [key: `bg.${string}`]: InteractiveColorName;
  };

  /**
   * Which colors change on hover|press
   */
  interactiveColors?: (keyof ComponentDescriptor['colors'])[];

  /**
   * Border style
   */
  borders: 'transparent' | 'solid' | 'none';
};

export type BaseDescriptors = {
  /**
   * General surface colors with matched foregrounds
   */
  surface: ComponentDescriptor;
  transparent: ComponentDescriptor;
  shaded: ComponentDescriptor;
  emphasis: ComponentDescriptor;
};
