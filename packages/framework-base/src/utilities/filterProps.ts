import { mergeProps } from '../merge-props/mergeProps';

export type PropsFilter = (propName: string) => boolean;

export function filterProps<TProps>(props: TProps, filter?: PropsFilter): TProps {
  if (filter && typeof props === 'object' && !Array.isArray(props)) {
    const propsToRemove = filter ? Object.keys(props).filter((key) => !filter(key)) : undefined;
    if (propsToRemove?.length > 0) {
      const propsToRemoveObj = Object.fromEntries(propsToRemove.map((prop) => [prop, undefined])) as TProps;
      return mergeProps<TProps>(props, propsToRemoveObj);
    }
  }
  return props;
}
