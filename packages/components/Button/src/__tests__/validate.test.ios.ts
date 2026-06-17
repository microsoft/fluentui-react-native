import { resolveButtonColorTokens, resolveButtonTokens } from './metadata.ts';

describe('Button pinning tests (ios)', () => {
  it('Button tokens match snapshot', () => {
    expect(resolveButtonTokens()).toMatchSnapshot();
  });

  it('Button color tokens map to semantic theme slots', () => {
    expect(resolveButtonColorTokens()).toMatchSnapshot();
  });
});
