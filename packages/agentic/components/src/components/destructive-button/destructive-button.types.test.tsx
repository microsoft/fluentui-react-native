/** @jsxImportSource @fluentui-react-native/framework-base */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { DestructiveButton } from './destructive-button';

const PrimaryDestructiveButton = <DestructiveButton content="Delete" onPress={() => undefined} />;

const FullyConfiguredDestructiveButton = (
  <DestructiveButton
    accessibilityLabel="Delete this file permanently"
    appearance="subtle"
    content={{ children: 'Delete' }}
    disabled={false}
    icon={{ imageSource: { uri: 'delete.png' } }}
    iconPosition="after"
    shape="circle"
    size="large"
  />
);

// @ts-expect-error DestructiveButton has no selection axis; toggling belongs to Button.
const InvalidSelected = <DestructiveButton content="Delete" selected />;

// @ts-expect-error DestructiveButton has no selection axis, so it has no selected icon slot either.
const InvalidSelectedIcon = <DestructiveButton content="Delete" selectedIcon={{ imageSource: { uri: 'filled.png' } }} />;

// @ts-expect-error DestructiveButton omits Button's square shape.
const InvalidShape = <DestructiveButton content="Delete" shape="square" />;

// @ts-expect-error the danger emphasis axis has only primary and subtle.
const InvalidAppearance = <DestructiveButton appearance="secondary" content="Delete" />;

// @ts-expect-error the danger emphasis axis has no outline level.
const InvalidOutlineAppearance = <DestructiveButton appearance="outline" content="Delete" />;

// @ts-expect-error size accepts only the three supported ramp values.
const InvalidSize = <DestructiveButton content="Delete" size="extra-large" />;

// @ts-expect-error iconPosition accepts only before and after.
const InvalidIconPosition = <DestructiveButton content="Delete" iconPosition="above" />;

describe('DestructiveButton types', () => {
  it('accepts the reviewed destructive button prop surface', () => {
    expect(PrimaryDestructiveButton).toBeDefined();
    expect(FullyConfiguredDestructiveButton).toBeDefined();
  });
});
