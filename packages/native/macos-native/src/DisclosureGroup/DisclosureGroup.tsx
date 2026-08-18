/** @jsxImportSource @fluentui-react-native/framework-base */
import type { DisclosureGroupProps } from './DisclosureGroup.types';
import NativeDisclosureGroup from './DisclosureGroupNativeComponent';

export const DisclosureGroup = (props: DisclosureGroupProps) => {
  const { onExpandedChange, ...rest } = props;
  const onExpandedChangeNative = onExpandedChange
    ? (event: { nativeEvent: { expanded: boolean } }) => onExpandedChange(event.nativeEvent.expanded)
    : undefined;

  return <NativeDisclosureGroup {...rest} onExpandedChange={onExpandedChangeNative} />;
};

export default DisclosureGroup;
