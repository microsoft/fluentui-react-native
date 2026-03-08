import { mergeProps } from '../merge-props/mergeProps.ts';
import { isObject } from './typeUtils.ts';

export type PropsFilter = (propName: string) => boolean;

export function filterProps<TProps>(props: TProps, filter?: PropsFilter): TProps {
  if (filter && isObject(props)) {
    const propsToRemove = filter ? Object.keys(props).filter((key) => !filter(key)) : [];
    if (propsToRemove?.length > 0) {
      const propsToRemoveObj = Object.fromEntries(propsToRemove.map((prop) => [prop, undefined])) as TProps;
      return mergeProps(props, propsToRemoveObj);
    }
  }
  return props;
}
