import type { ColorValue } from 'react-native';

import type { ColorDiagnostic, ColorMode } from '../color-lib';
import type { SemanticColorTokenValues } from '../tokens/flex.types';

export type ContrastColorToken = keyof SemanticColorTokenValues;

export interface ContrastTokenReference {
  readonly token: ContrastColorToken;
  readonly upstream: `--gnrc-color-${string}`;
}

export interface ContrastPairing {
  readonly label: string;
  readonly source: 'x3' | 'furn';
  readonly foreground: ContrastTokenReference;
  readonly backgrounds: readonly ContrastTokenReference[];
  readonly minimumRatio: number;
}

export interface ContrastColorDiagnostic extends ColorDiagnostic {
  readonly token: ContrastColorToken;
  readonly role: 'foreground' | 'background';
}

interface ContrastPairResultBase {
  readonly pairing: ContrastPairing;
  readonly foreground: ContrastTokenReference;
  readonly background: ContrastTokenReference;
  readonly foregroundValue: ColorValue;
  readonly backgroundValue: ColorValue;
  readonly mode: ColorMode;
}

export type ResolvedContrastPairResult = ContrastPairResultBase & {
  readonly status: 'pass' | 'fail';
  readonly ratio: number;
  readonly foregroundResolved: string;
  readonly backgroundResolved: string;
  readonly diagnostics: readonly [];
};

export type UnresolvableContrastPairResult = ContrastPairResultBase & {
  readonly status: 'unresolvable';
  readonly ratio: null;
  readonly foregroundResolved: null;
  readonly backgroundResolved: null;
  readonly diagnostics: readonly ContrastColorDiagnostic[];
};

export type ContrastPairResult = ResolvedContrastPairResult | UnresolvableContrastPairResult;
