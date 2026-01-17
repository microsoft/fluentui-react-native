export const FIX_ENV_VAR = 'FURN_FIX_MODE';

export function isFixMode(fromParam?: boolean): boolean {
  return fromParam || Boolean(process.env[FIX_ENV_VAR]);
}
