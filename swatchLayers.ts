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
 * A unique combination of foreground, background, and stroke. An omitted role draws nothing for that role.
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
   * name of the stroke color layer used by this component variant. Omit this for transparent strokes, since a transparent border and no
   * border are equivalent; there is no transparent stroke layer.
   */
  stroke?: string;
  /**
   * the number of times this component presentation is used across all components. This helps in identifying frequently used layers and optimizing them.
   */
  count: number;
};

/**
 * The various state based presentations of a component. Each state is a complete presentation; roles omitted from a state are not
 * inherited from base.
 */
export type ComponentLayers = {
  /** the component layer representing the default or base presentation of the component */
  base: ComponentPresentation;
  /**
   * the component layer representing the disabled presentation of the component. Its colors come from the layers it references, not from
   * extra keys on enabled layers, and it shares a layer with enabled presentations only when their values are identical.
   */
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
   * - layers in the same category with identical values must be a single layer, even when only one of them is used by disabled presentations.
   *   e.g. read-only and disabled strokes that both use --gnrc-color-stroke-neutral-disabled share one stroke layer.
   * - layers with different but non-conflicting values may also be merged, since a presentation may reference colors it does not use, but
   *   layers used by disabled presentations merge with enabled layers only when identical.
   */
  layers: Record<string, ColorLayer>;
  /**
   * collection of all component presentations, keyed by their names. Names should be based on the layer names where possible, with precedence of bg, fg, stroke.
   * Each combination is defined once, after transparent strokes are omitted and identical layers are merged.
   */
  presentations: Record<string, ComponentPresentation>;
  /**
   * collection of component color layers, keyed by component name, with an optional variant specified as part of the key. So button.subtle would refer to the
   * subtle variant. State such as selected or highlighted should be added as an alternate presentation within the component layer.
   */
  components: Record<string, ComponentLayers>;
};
