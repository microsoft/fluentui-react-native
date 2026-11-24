/** @jsxImportSource @fluentui-react-native/framework-base */
import { RootInputBoundary } from '@fluentui-react-native/design';
import { Button } from '../button/button';
import { commandPressProps } from '../button/commandPress';
import type { DialogState } from './dialog.types';

export function renderDialog_unstable(state: DialogState) {
  const { body: Body, close: Close, footer: Footer } = state;
  return (
    <state.root>
      <state.window>
        <RootInputBoundary>
          <state.surface>
            <state.header>
              <state.title />
              {Close && <Close />}
            </state.header>
            {Body && <Body>{state.children}</Body>}
            {Footer && (
              <Footer>
                {state.actions.map((action) => (
                  <Button
                    key={action.key}
                    testID={action.testID}
                    content={action.label}
                    appearance={action.appearance}
                    {...commandPressProps(() => state.approve(action), false)}
                  />
                ))}
              </Footer>
            )}
          </state.surface>
        </RootInputBoundary>
      </state.window>
    </state.root>
  );
}
