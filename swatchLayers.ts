export interface ColorLayerBase {
  /**
   * rest or default background layer color, values should be the --gnrc token variables from the flex designs
   */
  rest: string;
  /**
   * hover background layer color, values should be the --gnrc token variables from the flex designs.
   * If the hover color is referenced as computed like OLCH(--gnrc-*) that should be recorded explicitly.
   */
  hover?: string;
  /**
   * pressed background layer color, values should be the --gnrc token variables from the flex designs
   * If the pressed color is referenced as computed like OLCH(--gnrc-*) that should be recorded explicitly.
   */
  pressed?: string;
  /**
   * indicates if the background layer is inverted, meaning computed colors should be inverted for hover and pressed states.
   * This should be omitted if it is not known whether the background layer is inverted, i.e., if the value is indeterminate
   */
  type?: 'standard' | 'inverted';
}

/**
 * Extends ColorLayerBase to include additional arbitrary colors as key value pairs
 */
export type ColorLayer = ColorLayerBase & Record<string, string>;

/**
 * A unique combination of foreground, background, and stroke
 */
export type ComponentPresentation = {
  /**
   * name of the color layer used by this component variant, this is typically a bg.<name> layer but some components like a progress bar may use a
   * foreground layer as their background
   */
  bg?: string;
  /**
   * name of the foreground color layer used by this component variant
   */
  fg?: string;
  /**
   * name of the stroke color layer used by this component variant
   */
  stroke?: string;
};

/**
 * The various state based presentations of a component
 */
export type ComponentLayers = {
  /** the component layer representing the default or base presentation of the component */
  base: ComponentPresentation;
  /** the component layer representing the disabled presentation of the component */
  disabled?: ComponentPresentation;
  /** the component layer representing the selected presentation of the component */
  selected?: ComponentPresentation;
  /** the component layer representing any additional presentation of the component */
  [key: string]: ComponentPresentation | undefined;
};

export type SwatchLayers = {
  /**
   * collection of all color layers, keyed by their names, names should be as generic as possible, potentially using names derived from their flex
   * token names. e.g. neutralFarther or transparent. If there are multiple variants for a single color, use numbers to disambiguate them.
   * - this should include background, foreground, and stroke layers
   * - background layers should be named bg.<name>
   * - foreground layers should be named fg.<name>
   * - stroke layers should be named stroke.<name>
   */
  layers: Record<string, ColorLayer>;
  /**
   * collection of all component presentations, keyed by their names. Names should be based on the layer names where possible, with precedence of bg, fg, stroke.
   */
  presentations: Record<string, ComponentPresentation>;
  /**
   * collection of component color layers, keyed by component name, with an optional variant specified as part of the key. So button.subtle would refer to the
   * subtle variant. State such as selected or highlighted should be added as an alternate presentation within the component layer.
   */
  components: Record<string, ComponentLayers>;
};
