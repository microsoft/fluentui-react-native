/**
 * Lage doesn't support cleanly passing parameters to sub scripts, so this allows our scripts that
 * support a "fix" mode to be toggled via an environment variable. This allows things like lint --fix or
 * lint-package --fix to be run from the root level without having to have duplicate scripts entries for
 * each package.
 */

// env variable to use
export const FIX_ENV_VAR = 'FURN_FIX_MODE';

// standard helper function to check for fix mode
export function isFixMode(fromParam?: boolean): boolean {
  return fromParam || Boolean(process.env[FIX_ENV_VAR]);
}
