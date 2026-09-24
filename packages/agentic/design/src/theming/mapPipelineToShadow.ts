import type { ThemeShadowDefinition } from './types/Shadow.types';

const shadowNumbers = [2, 4, 8, 16, 28, 64];

function createShadowEntry(pipelineOutputShadow: any, number: number, brand?: boolean) {
  const key = brand ? `shadowBrand${number}` : `shadow${number}`;
  return { ambient: pipelineOutputShadow[key][0], key: pipelineOutputShadow[key][1] };
}

function createThemeShadowKey(number: number, brand?: boolean) {
  return brand ? `shadow${number}brand` : `shadow${number}`;
}

/**
 * Given design token pipeline output for shadow tokens, creates an object that can be used in Theme object.
 * @param pipelineOutputShadow Assumes that this is the object in the tokens-shadow.json file of the pipeline output
 * @returns Object containing shadow tokens
 */
export function mapPipelineToShadow(pipelineOutputShadow: any): ThemeShadowDefinition {
  return Object.fromEntries(
    shadowNumbers.flatMap((number) => [
      [createThemeShadowKey(number), createShadowEntry(pipelineOutputShadow, number)],
      [createThemeShadowKey(number, true), createShadowEntry(pipelineOutputShadow, number, true)],
    ]),
  ) as ThemeShadowDefinition;
}
