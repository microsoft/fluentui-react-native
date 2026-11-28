import { directComponent, phasedComponent } from '@fluentui-react-native/framework-base';
import { renderTextarea_unstable } from './renderTextarea';
import type { TextareaProps } from './textarea.types';
import { useTextarea_unstable } from './useTextarea';
import { useTextareaStyles_unstable } from './useTextareaStyles';

export const Textarea = phasedComponent<TextareaProps>((props) => {
  const state = useTextarea_unstable(props);
  useTextareaStyles_unstable(state);
  return directComponent<TextareaProps>(() => renderTextarea_unstable(state));
});
Textarea.displayName = 'Textarea';
