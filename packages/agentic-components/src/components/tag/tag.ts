import type { TagProps } from './tag.types';
import { renderTag_unstable } from './renderTag';
import { useTagStyles_unstable } from './useTagStyles';
import { useTag_unstable } from './useTag';
import { phasedComponent, directComponent } from '@fluentui-react-native/framework-base';

export const Tag = phasedComponent<TagProps>((props) => {
  const state = useTag_unstable(props);
  useTagStyles_unstable(state);
  return directComponent<TagProps>(() => renderTag_unstable(state));
});

Tag.displayName = 'Tag';

export default Tag;
