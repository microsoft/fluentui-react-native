/** @jsxImportSource @fluentui-react-native/framework-base */
import type { DrawerState } from './drawer.types';

export function renderDrawer_unstable(state: DrawerState) {
  return (
    <state.root>
      {state.open && (
        <>
          <state.header>
            <state.heading>
              <state.title />
            </state.heading>
            {state.close && <state.close />}
          </state.header>
          <state.body>{state.children}</state.body>
          {state.footer && <state.footer />}
        </>
      )}
    </state.root>
  );
}
