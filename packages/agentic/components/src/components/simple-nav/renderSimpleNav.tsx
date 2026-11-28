/** @jsxImportSource @fluentui-react-native/framework-base */
import { NavItem } from '../nav-item/nav-item';
import type { SimpleNavState } from './simple-nav.types';

export function renderSimpleNav_unstable(state: SimpleNavState) {
  const { overlay: Overlay, header: Header, footer: Footer, toggle: Toggle } = state;
  const panel = state.visible && (
    <state.panel>
      {Header && (
        <Header>
          {Toggle && <Toggle />}
          {state.headerContent}
        </Header>
      )}
      <state.body>
        {state.items.map((entry) => (
          <NavItem
            key={entry.key}
            value={entry.key}
            label={entry.label}
            leading={entry.leading}
            current={entry.key === state.currentValue}
            currentDescription={state.currentDescription}
            onNavigate={state.select}
            density={state.density}
            iconOnly={state.rail}
            disabled={entry.disabled}
            tooltip={state.rail ? entry.label : undefined}
            primary={{
              testID: entry.testID,
              ref: (instance) => state.focus.setRef(entry.key, instance),
              onFocus: () => state.focus.onFocus(entry.key),
              onBlur: () => state.focus.onBlur(entry.key),
            }}
          />
        ))}
      </state.body>
      {Footer && <Footer>{state.footerContent}</Footer>}
    </state.panel>
  );
  return <state.root>{Overlay ? <Overlay>{panel}</Overlay> : panel}</state.root>;
}
