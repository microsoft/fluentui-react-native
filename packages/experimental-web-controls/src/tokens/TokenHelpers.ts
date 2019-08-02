import { IStyleProp } from '@uifabric/theme-settings';

export function extractAndReduce<TObj extends object>(target: TObj, keys: (keyof TObj)[]): object {
  const result: TObj = {} as TObj;
  keys.forEach((key: keyof TObj) => {
    if (target.hasOwnProperty(key)) {
      result[key] = target[key];
    }
  });
  return result;
}

type IWithStyleProp<T> = T & { style?: IStyleProp<object> };

export function processTokens<TTokens extends object, TProps extends object>(
  tokens: TTokens,
  keys: (keyof TTokens)[],
  ...targetProps: TProps[]
): void {
  const style = extractAndReduce(tokens, keys);
  targetProps.forEach((props: IWithStyleProp<TProps>) => {
    props.style = props.style ? [props.style, style] : style;
  });
}
