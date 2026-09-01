import { getAliasTokens, getShadowTokens } from './getTokens';

const brandBackgroundRest: string = getAliasTokens('light').brandBackground.rest;
const shadowColor: string = getShadowTokens('light').shadow2[0].color;

describe('legacy generated token types', () => {
  it('preserves concrete alias and shadow leaf types', () => {
    expect(typeof brandBackgroundRest).toBe('string');
    expect(typeof shadowColor).toBe('string');
  });
});
