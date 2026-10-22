import type { CalloutPresentation } from './Callout.types';
import { presentationBrand } from './Callout.types';

/** One native presentation of a Callout; its generation fences native events and operations. */
export class Presentation implements CalloutPresentation {
  readonly [presentationBrand] = true as const;
  readonly generation: number;
  constructor(generation: number) {
    this.generation = generation;
  }
}
