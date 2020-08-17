import { immutableMergeCore, MergeOptions } from '@fluentui-react-native/immutable-merge';
import { mergeStyles } from './Styles';

/**
 * Props will not deeply merge with the exception of a style property.  Also className needs to be handled specially.
 */
const _mergePropsOptions: MergeOptions = {
  className: (...names: any[]) => names.filter(v => v && typeof v === 'string').join(' '),
  style: mergeStyles,
};

type AsObject<T> = T extends object ? T : never;

/**
 * Merge props together, flattening and merging styles as appropriate
 * @param props - props to merge together
 */
export function mergeProps<TProps>(...props: (AsObject<TProps> | undefined)[]): TProps {
  return (immutableMergeCore(_mergePropsOptions, ...props) as unknown) as TProps;
}
