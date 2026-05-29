import type { Framework } from '../concepts/framework.ts';
import type { Platform } from '../concepts/platform.ts';
import type { ComponentState } from '../concepts/states.ts';
import type { Size } from '../concepts/size.ts';
import type { Shape } from '../concepts/shape.ts';

/**
 * Declarative description of a single component as it ships from a
 * package. The metadata captures what the component **supports** — not
 * a hand-picked list of snapshot states. The matrix of states to
 * render is derived from this document by `deriveComponentStates`.
 *
 * One `ComponentMetadata` corresponds to one named export. Packages
 * that ship multiple components (e.g. Button + CompoundButton + FAB)
 * carry one document per export under `src/metadata/`.
 */
export interface ComponentMetadata {
  /** Display name as it appears in user code, e.g. `'Button'`. */
  name: string;
  /** Public module specifier the component is imported from, e.g.
   *  `'@fluentui-react-native/button'`. */
  importPath: string;
  /** Named export within `importPath`, e.g. `'ButtonV1'`. */
  exportName: string;

  /** Which framework the component is built against. */
  framework: Framework;
  /** Platforms the component ships on. At least one entry. */
  platforms: readonly Platform[];
  /** Interaction states the component opts into. The deriver applies
   *  each one against every appearance branch. */
  states: readonly ComponentState[];
  /** Curated multi-state combinations meaningful for this component
   *  (e.g. `['press', 'focused']` for keyboard activation). Single
   *  states are already covered by `states`; only list combos that
   *  reveal a distinct visual or behavioural result. */
  stateCombos?: readonly (readonly ComponentState[])[];

  /** Appearance values the component accepts. Standard values come
   *  from `Appearance`; components may extend with custom strings
   *  (e.g. Button adds `'accent'`, `'outline'`). Omit when the
   *  component has no appearance prop. */
  appearances?: readonly string[];
  /** Sizes the component accepts. Tested in parallel against the
   *  default render — state combinations are not applied on top. */
  sizes?: readonly Size[];
  /** Shapes the component accepts. Tested in parallel against the
   *  default render — state combinations are not applied on top. */
  shapes?: readonly Shape[];

  /** Fixture props applied in every derived render. Should include a
   *  `testID` whenever any interaction-driven state (`hover`, `press`,
   *  `focused`) is declared, so the deriver can target it. */
  baseProps?: Record<string, unknown>;
}
