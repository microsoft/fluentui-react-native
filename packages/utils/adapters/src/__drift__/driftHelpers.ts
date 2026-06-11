/**
 * Type-level helpers for the drift tests. These files are excluded from the package's normal build
 * (see `../../tsconfig.json` "exclude") and are checked in isolation, one fork at a time, by the
 * per-fork tsconfigs in this directory. They exist solely to fail compilation if the platform-neutral
 * redeclarations in `../platformProps.ts` fall out of alignment with the real React Native fork types.
 */

/**
 * Keys present on the fork type but missing from our local redeclaration — i.e. props a fork has
 * added that we no longer cover. This is the critical direction: an uncovered prop would be silently
 * dropped by the prop filters. Checked strictly (no allowance).
 */
export type MissingKeys<Fork, Local> = Exclude<keyof Fork, keyof Local>;

/**
 * Keys present on our local redeclaration but not on the fork type. `Allowed` excludes the canonical
 * `react-native` base props (the forks sometimes lag behind core RN) and any props the filter masks
 * intentionally inject because the fork's *types* omit a prop that exists at runtime.
 */
export type ExtraKeys<Fork, Local, Allowed extends PropertyKey = never> = Exclude<keyof Local, keyof Fork | Allowed>;

/** Compiles only when `T` is `never`; otherwise the offending keys appear in the error message. */
export type AssertNoKeyDrift<T extends never> = T;
