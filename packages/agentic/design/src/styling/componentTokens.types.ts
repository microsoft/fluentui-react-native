import type { ThemeState } from '../flex/themeState.types';
import type { FlexTokens } from '../flex/tokens.types';
import type { AssetField } from './assetField';

export type TokenMember = string | number | boolean;
export type TokenAxes = readonly (readonly [field: string, members: readonly TokenMember[]])[];
export type TokenState<A extends TokenAxes> = { readonly [Axis in A[number] as Axis[0]]: Axis[1][number] };

type NonColorGroup = Exclude<keyof FlexTokens, 'color'>;
type ColorReference = `tokens:color.${keyof FlexTokens['color']}.${'rest' | 'hover' | 'pressed' | 'active'}`;
type TokenReference<T> =
  | {
      [Group in NonColorGroup]: {
        [Key in keyof FlexTokens[Group] & string]: NonNullable<FlexTokens[Group][Key]> extends T ? `tokens:${Group}.${Key}` : never;
      }[keyof FlexTokens[Group] & string];
    }[NonColorGroup]
  | (FlexTokens['color'][keyof FlexTokens['color']]['rest'] extends T ? ColorReference : never);

type ValueParser = (value: unknown) => unknown;
export type TokenFields = Readonly<Record<string, ValueParser | AssetField<string, string, unknown>>>;
export type TokenSlotDomains = Readonly<Record<string, { readonly style: TokenFields; readonly props: TokenFields }>>;
type ResolvedField<F> = F extends AssetField<string, string, infer Result> ? Result : F extends ValueParser ? ReturnType<F> : never;
export type ResolvedFields<F extends TokenFields> = { readonly [K in keyof F]?: ResolvedField<F[K]> };

type AuthoredField<F> =
  F extends AssetField<infer Protocol, infer Name, unknown>
    ? `${Protocol}:${Name}` | `${Protocol}: ${Name}`
    : NonNullable<ResolvedField<F>> | TokenReference<NonNullable<ResolvedField<F>>>;

type TokenValues<F extends TokenFields> = {
  readonly [K in keyof F]?: AuthoredField<F[K]>;
};
type TokenBranches<State extends object, F extends TokenFields> = {
  readonly [K in keyof State & string as `when.${K}.${Extract<State[K], TokenMember>}`]?: TokenValues<F> & TokenBranches<Omit<State, K>, F>;
};

export type ComponentTokenPatch<State extends object, D extends TokenSlotDomains> = {
  readonly [S in keyof D]?: TokenValues<D[S]['style'] & D[S]['props']> & TokenBranches<State, D[S]['style'] & D[S]['props']>;
};

/** Components augment this registry with their qualified component IDs and patch types. */
// oxlint-disable-next-line typescript/no-empty-object-type -- The interface is a declaration-merging target.
export interface ComponentTokenRegistry {}

export type ComponentTokenContext = Readonly<Pick<ThemeState, 'tokens' | 'appearance'>>;
export type ComponentTokenLayer = {
  readonly [K in keyof ComponentTokenRegistry]?: ComponentTokenRegistry[K] | ((theme: ComponentTokenContext) => ComponentTokenRegistry[K]);
};

export type ResolvedSlotTokens<S extends TokenFields, P extends TokenFields> = {
  readonly style: ResolvedFields<S>;
  readonly props: ResolvedFields<P>;
};
