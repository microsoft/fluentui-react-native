/** @jsxImportSource @fluentui-react-native/framework-base */
import { hiddenFromAccessibilityProps } from '../../common/accessibility';
import { Divider } from '../divider/divider';
import type { ToolbarState } from './toolbar.types';
import { ToolbarButton, ToolbarToggleButton } from './toolbarCommand';

export function renderToolbar_unstable(state: ToolbarState) {
  return (
    <state.root>
      {state.items.map((item) => {
        if (item.kind === 'divider') {
          return <Divider key={item.value} {...item.element.props} {...hiddenFromAccessibilityProps} vertical showContent={false} />;
        }
        return item.kind === 'button' ? (
          <ToolbarButton key={item.value} value={item.value} props={item.element.props} size={state.size} focus={state.focus} />
        ) : (
          <ToolbarToggleButton key={item.value} value={item.value} props={item.element.props} size={state.size} focus={state.focus} />
        );
      })}
    </state.root>
  );
}
