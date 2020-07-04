let modernBrowser: boolean | undefined = undefined;

export function enableCssVariables(): boolean {
  if (modernBrowser === undefined) {
    modernBrowser = window.CSS && window.CSS.supports('color', 'var(--has-var');
  }
  return modernBrowser;
}

export type ThemeLookup<TTheme, T = any> = (theme: TTheme) => T;
export type VarResult<TTheme> = string | ThemeLookup<TTheme>;

function asPath(target: string): string[] {
  return target.split('.');
}

export function asCSSVariable(target: string): string {
  return '--' + asPath(target).join('-');
}

export function getPathValue(target: object, path: string[]): any {
  return path.reduce((target: object, key: string) => target && target[key], target);
}

const recurse = val => typeof val === 'object' && val && !Array.isArray(val);

function iterKeyVal(target: object, cb: (key: string, val: any, collect?: any) => any, collector?: any): any {
  for (const key in target) {
    cb(key, target[key], collector);
  }
  return collector;
}

export function collectVars(base: object, prefix: string): object {
  return iterKeyVal(base, (key: string, val: any, result: object) => {
    const path = prefix + '-' + key;
    if (recurse(val)) {
      Object.assign(result, collectVars(base, path));
    } else if (typeof val !== 'function' && val !== undefined) {
      result[path] = val;
    }
  }, {});
}

export function resolveVars<T, TTheme>(base: AsObject<T>, theme: TTheme): AsObject<T> {
  return iterKeyVal(base, (key: string, val: any, result: object) => {
    if (recurse(val)) {
      result[key] = resolveVars(val, theme);
    } else if (typeof val === 'function') {
      result[key] = val(theme);
    }
  }, { ...base });
}

export function hasVars(base: object): boolean {
  return iterKeyVal(base, (_key: string, val: any, found: boolean) => {
    return found || typeof val === 'function' || (recurse(val) && hasVars(val));
  }, false);
}

type AsObject<T> = T extends object ? T : never;

export function wrapIfVars<T, TTheme>(obj: AsObject<T>): AsObject<T> | ThemeLookup<TTheme, AsObject<T>> {
  return hasVars(obj) ? (theme: TTheme) => resolveVars(obj, theme) : obj;
}

export function Var<TTheme>(target: string, backup?: VarResult<TTheme>): VarResult<AsObject<TTheme>> {
  return enableCssVariables()
    ? `var(${asCSSVariable(target)}${backup ? ((', ' + backup) as string) : ''})`
    : (theme: AsObject<TTheme>) => {
      const val = getPathValue(theme, asPath(target));
      return val ?? typeof backup === 'function' ? (backup as ThemeLookup<TTheme>)(theme) : backup;
    };
}
