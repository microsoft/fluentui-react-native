import type { OxlintConfig } from 'oxlint';

declare module '@rnx-kit/oxlint-config/sdl-required' {
  const config: OxlintConfig;
  export default config;
}

declare module '@rnx-kit/oxlint-config/strict' {
  const config: OxlintConfig;
  export default config;
}

declare module '@rnx-kit/oxlint-config/typescript-stylistic' {
  const config: OxlintConfig;
  export default config;
}
