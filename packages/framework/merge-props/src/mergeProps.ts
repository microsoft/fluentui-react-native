import { immutableMergeCore, MergeOptions } from '@fluentui-react-native/immutable-merge';
import { mergeStyles } from './mergeStyles';

/**
 * Props will not deeply merge with the exception of a style property.  Also className needs to be handled specially.
 */
const mergePropsOptions: MergeOptions = {
  className: (...names: any[]) => names.filter((v) => v && typeof v === 'string').join(' '),
  style: mergeStyles,
};

/** take an any array and turn it into an array of objects */
// eslint-disable-next-line @typescript-eslint/ban-types
function filterAsObject(targets: any[]): object[] {
  return targets.filter((t) => typeof t === 'object');
}

/**
 * Merge props together, flattening and merging styles as appropriate
 * @param props - props to merge together
 */
export function mergeProps<TProps>(...props: (TProps | undefined)[]): TProps {
  return (immutableMergeCore(mergePropsOptions, ...filterAsObject(props)) as unknown) as TProps;
}
