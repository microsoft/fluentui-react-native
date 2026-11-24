/** @jsxImportSource @fluentui-react-native/framework-base */
import { NavItem } from '../nav-item/nav-item';
import type { NavItemProps } from '../nav-item/nav-item.types';
import type { NavState } from './nav.types';

export function renderNav_unstable(state: NavState) {
  const { header: Header, footer: Footer, overlay: Overlay } = state;
  const panel = state.open && (
    <state.panel>
      {Header && <Header>{state.headerContent}</Header>}
      <state.body>
        {state.rows.map(({ entry, key, level }) => {
          const props: Pick<
            NavItemProps,
            'value' | 'label' | 'density' | 'nesting' | 'leading' | 'disabled' | 'primary' | 'secondaryActions'
          > = {
            value: key,
            label: entry.label,
            density: state.density,
            nesting: level > 1 ? 'subitem' : 'top-level',
            disabled: entry.disabled,
            leading: entry.leading,
            secondaryActions: entry.secondaryActions,
            primary: {
              ref: (instance) => state.focus.setRef(key, instance),
              onFocus: () => state.focus.onFocus(key),
              onBlur: () => state.focus.onBlur(key),
              testID: entry.testID,
            },
          };
          return entry.type === 'category' ? (
            <NavItem
              key={key}
              {...props}
              type="category"
              expanded={state.expanded.has(key)}
              carriedCurrent={state.currentAncestors.has(key)}
              onExpandedChange={(next) => state.expand(key, next)}
            />
          ) : (
            <NavItem
              key={key}
              {...props}
              current={key === state.currentValue}
              currentDescription={state.currentDescription}
              onNavigate={state.select}
            />
          );
        })}
      </state.body>
      {Footer && <Footer>{state.footerContent}</Footer>}
    </state.panel>
  );
  return <state.root>{Overlay ? <Overlay>{panel}</Overlay> : panel}</state.root>;
}
