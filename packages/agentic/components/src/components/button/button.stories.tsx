/** @jsxImportSource @fluentui-react-native/framework-base */
import { useState } from 'react';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { Meta, StoryObj } from '@storybook/react-native';
import { ThemedRoot, useRootInputModality } from '@fluentui-react-native/design';
import type { FocusKeyboardEvent, FocusRequest } from '@fluentui-react-native/framework-base';
import type { WdioStory } from '@fluentui-react-native/storybook-desktop/testing';

import { Button } from './button';
import { useButton_unstable } from './useButton';
import { useButtonStyles_unstable } from './useButtonStyles';
import { renderButton_unstable } from './renderButton';
import type { ButtonAppearance, ButtonShape, ButtonSize } from './button.types';

type StoryGroupProps = {
  children: ReactNode;
  label: string;
  labelTestID?: string;
};

const StoryGroup = ({ children, label, labelTestID }: StoryGroupProps) => (
  <View style={styles.group}>
    {labelTestID ? (
      <View accessible accessibilityLabel={label} accessibilityRole="text" testID={labelTestID}>
        <Text accessible={false} style={styles.label}>
          {label}
        </Text>
      </View>
    ) : (
      <Text style={styles.label}>{label}</Text>
    )}
    <View style={styles.row}>{children}</View>
  </View>
);

const appearances: readonly { label: string; value: ButtonAppearance }[] = [
  { label: 'Primary', value: 'primary' },
  { label: 'Secondary', value: 'secondary' },
  { label: 'Outline', value: 'outline' },
  { label: 'Subtle', value: 'subtle' },
];

const sizes: readonly { label: string; value: ButtonSize }[] = [
  { label: 'Small', value: 'small' },
  { label: 'Medium', value: 'medium' },
  { label: 'Large', value: 'large' },
];

const shapes: readonly { label: string; value: ButtonShape }[] = [
  { label: 'Rounded', value: 'rounded' },
  { label: 'Square', value: 'square' },
  { label: 'Circle', value: 'circle' },
];

const addIcon = { fontSource: { codepoint: 0x2b, fontFamily: 'Arial' } } as const;
const regularStarIcon = { fontSource: { codepoint: 0x2606, fontFamily: 'Arial' } } as const;
const filledStarIcon = { fontSource: { codepoint: 0x2605, fontFamily: 'Arial' } } as const;

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  args: {
    appearance: 'secondary',
    content: 'Button',
    disabled: false,
    iconPosition: 'before',
    shape: 'rounded',
    size: 'medium',
    testID: 'agentic-storybook-button',
  },
  argTypes: {
    appearance: { control: 'select', options: appearances.map(({ value }) => value) },
    iconPosition: { control: 'select', options: ['before', 'after'] },
    shape: { control: 'select', options: shapes.map(({ value }) => value) },
    size: { control: 'select', options: sizes.map(({ value }) => value) },
  },
  parameters: {
    docs: {
      description: {
        component:
          'A Button triggers a single action or event. Use it for actions such as submitting, saving, or creating; use a link for navigation.',
      },
    },
  },
};

export default meta;

type Story = WdioStory<StoryObj<typeof Button>>;

export const Default: Story = {
  tags: ['desktop-e2e'],
  wdio: {
    'exposes enabled button semantics': async ({ browser, expect }) => {
      const assert: typeof import('node:assert') = (await import('node:assert')).default;
      const button = await browser.$('~agentic-storybook-button');
      await expect(button).toExist();
      await expect(button).toBeEnabled();
      assert.strictEqual(await button.getTagName(), 'button');
    },
    'supports native pointer activation': async ({ browser, expect, platform, skip }) => {
      const features = browser.capabilities['furn:features'];
      if (!features) throw new Error('Desktop Driver did not provide feature capabilities.');
      if (!features.physicalClick || !features.elementScreenshot || (platform !== 'macos' && !features.focus)) {
        skip('This test requires physical clicks, element screenshots, and focus on Windows/Win32.');
        return;
      }
      const button = await browser.$('~agentic-storybook-button');
      await button.click();
      if (platform === 'windows' || platform === 'win32') {
        await browser.waitUntil(async () => (await button.getProperty('focused')) === true, {
          timeoutMsg: 'The activated button did not receive keyboard focus.',
        });
      }
      expect(await browser.takeElementScreenshot(await button.elementId)).toMatch(/^iVBORw0KGgo/);
    },
  },
};

function ModalityProbe({ testID = 'focus-input-modality' }: { testID?: string }) {
  return <Text testID={testID}>{useRootInputModality()}</Text>;
}

function FocusManagementScene() {
  const [count, setCount] = useState(0);
  const [otherCount, setOtherCount] = useState(0);
  const [focusCount, setFocusCount] = useState(0);
  const [keyTrace, setKeyTrace] = useState('none');
  const recordKey = (event: FocusKeyboardEvent) => {
    setKeyTrace(`${event.nativeEvent.key}/${event.nativeEvent.code ?? 'no-code'}/self:${event.target === event.currentTarget}`);
  };
  const state = useButton_unstable({
    content: 'Focus and activate',
    testID: 'focus-probe-button',
    onPress: () => setCount((value) => value + 1),
    onFocus: () => setFocusCount((value) => value + 1),
    onKeyDown: recordKey,
    onKeyUp: recordKey,
  });
  useButtonStyles_unstable(state);
  return (
    <View>
      {renderButton_unstable(state)}
      <Button content="Disabled stop" disabled testID="focus-probe-disabled" />
      <Button content="Next focus target" testID="focus-probe-next" onPress={() => setOtherCount((value) => value + 1)} />
      <ThemedRoot appearance={{ colorScheme: 'dark' }}>
        <Button content="Nested theme target" testID="focus-probe-nested" />
        <ModalityProbe testID="focus-nested-modality" />
      </ThemedRoot>
      <Text testID="focus-probe-state">{state.focused ? 'focused' : 'blurred'}</Text>
      <Text testID="focus-probe-count">{String(count)}</Text>
      <Text testID="focus-probe-next-count">{String(otherCount)}</Text>
      <Text testID="focus-probe-focus-count">{String(focusCount)}</Text>
      <Text testID="focus-probe-key">{keyTrace}</Text>
      <ModalityProbe />
    </View>
  );
}

export const FocusManagement: Story = {
  render: () => <FocusManagementScene />,
  tags: ['desktop-focus'],
  wdio: {
    'focuses on pointer activation and invokes exactly once per Enter and Space': async (context) => {
      const { requireDesktopFocus, expectNativeState } = await import('../../common/desktopFocus.wdio.ts');
      if (!requireDesktopFocus(context)) return;
      const { browser, expect } = context;
      const button = await browser.$('~focus-probe-button');
      const count = await browser.$('~focus-probe-count');
      await button.click();
      await expectNativeState(browser, 'focus-probe-button', 'focused', true);
      await expect(await browser.$('~focus-probe-state')).toHaveText('focused');
      await expect(count).toHaveText('1');
      await browser.keys('\uE007');
      await expect(count).toHaveText('2');
      await expect(await browser.$('~focus-input-modality')).toHaveText('keyboard');
      await browser.keys('\uE00D');
      await expect(count).toHaveText('3');
      await button.click();
      await expect(count).toHaveText('4');
      await expect(await browser.$('~focus-input-modality')).toHaveText('pointer');
    },
    'updates same-target modality without refocusing and shares it with nested themes': async (context) => {
      const { requireDesktopFocus, expectNativeState } = await import('../../common/desktopFocus.wdio.ts');
      if (!requireDesktopFocus(context)) return;
      const { browser, expect } = context;
      const button = await browser.$('~focus-probe-button');
      await button.click();
      await expectNativeState(browser, 'focus-probe-button', 'focused', true);
      await expect(await browser.$('~focus-probe-focus-count')).toHaveText('1');
      await browser.keys('x');
      await expect(await browser.$('~focus-input-modality')).toHaveText('keyboard');
      await expect(await browser.$('~focus-nested-modality')).toHaveText('keyboard');
      await expect(await browser.$('~focus-probe-count')).toHaveText('1');
      await button.click();
      await expect(await browser.$('~focus-input-modality')).toHaveText('pointer');
      await expect(await browser.$('~focus-probe-focus-count')).toHaveText('1');
      await (await browser.$('~focus-probe-nested')).click();
      await expectNativeState(browser, 'focus-probe-nested', 'focused', true);
      await browser.keys('x');
      await expect(await browser.$('~focus-input-modality')).toHaveText('keyboard');
      await expect(await browser.$('~focus-nested-modality')).toHaveText('keyboard');
      await expect(await browser.$('~focus-probe-state')).toHaveText('blurred');
    },
    'skips disabled stops and does not activate the new owner on a stale key-up': async (context) => {
      const { requireDesktopFocus, expectNativeState } = await import('../../common/desktopFocus.wdio.ts');
      if (!requireDesktopFocus(context)) return;
      const { browser, expect } = context;
      await (await browser.$('~focus-probe-button')).click();
      await expect(await browser.$('~focus-probe-disabled')).not.toBeEnabled();
      try {
        await browser.performActions([
          {
            type: 'key',
            id: 'focus-keyboard',
            actions: [
              { type: 'keyDown', value: '\uE007' },
              { type: 'keyDown', value: '\uE004' },
              { type: 'keyUp', value: '\uE004' },
              { type: 'keyUp', value: '\uE007' },
            ],
          },
        ]);
      } finally {
        await browser.releaseActions();
      }
      await expectNativeState(browser, 'focus-probe-next', 'focused', true);
      await expectNativeState(browser, 'focus-probe-disabled', 'focused', false);
      await expect(await browser.$('~focus-probe-state')).toHaveText('blurred');
      await expect(await browser.$('~focus-probe-count')).toHaveText('1');
      await expect(await browser.$('~focus-probe-next-count')).toHaveText('0');
      await browser.keys(['\uE008', '\uE004']);
      await expectNativeState(browser, 'focus-probe-button', 'focused', true);
    },
    'suppresses repeated key-down activation until the paired key-up': async (context) => {
      const { requireDesktopFocus, expectNativeState } = await import('../../common/desktopFocus.wdio.ts');
      if (!requireDesktopFocus(context)) return;
      const { browser, expect } = context;
      await (await browser.$('~focus-probe-button')).click();
      await expectNativeState(browser, 'focus-probe-button', 'focused', true);
      try {
        await browser.performActions([
          {
            type: 'key',
            id: 'focus-keyboard',
            actions: [
              { type: 'keyDown', value: '\uE00D' },
              { type: 'keyDown', value: '\uE00D' },
              { type: 'keyDown', value: '\uE00D' },
            ],
          },
        ]);
        await expect(await browser.$('~focus-probe-count')).toHaveText('1');
        await browser.performActions([{ type: 'key', id: 'focus-keyboard', actions: [{ type: 'keyUp', value: '\uE00D' }] }]);
        await expect(await browser.$('~focus-probe-count')).toHaveText('2');
      } finally {
        await browser.releaseActions();
      }
    },
  },
};

function FocusRequestsScene() {
  const [disabled, setDisabled] = useState(false);
  const [mounted, setMounted] = useState(true);
  const [request, setRequest] = useState<FocusRequest>();
  const state = useButton_unstable({ content: 'Requested focus target', disabled, testID: 'focus-request-target' });
  useButtonStyles_unstable(state);
  return (
    <View>
      {mounted && renderButton_unstable(state)}
      <Button
        content="Request focus"
        testID="focus-request-command"
        onPress={() => setRequest(state.focusTarget.requestFocus('programmatic'))}
      />
      <Button content="Toggle disabled" testID="focus-request-disable" onPress={() => setDisabled((value) => !value)} />
      <Button content="Toggle mounted" testID="focus-request-mount" onPress={() => setMounted((value) => !value)} />
      <Text testID="focus-request-status">{request?.status ?? 'none'}</Text>
      <ModalityProbe />
    </View>
  );
}

export const FocusRequests: Story = {
  render: () => <FocusRequestsScene />,
  tags: ['desktop-focus'],
  wdio: {
    'confirms native requests without changing modality and rejects disabled or detached targets': async (context) => {
      const { requireDesktopFocus, expectNativeState } = await import('../../common/desktopFocus.wdio.ts');
      if (!requireDesktopFocus(context)) return;
      const { browser, expect } = context;
      const command = await browser.$('~focus-request-command');
      const status = await browser.$('~focus-request-status');
      await command.click();
      await expectNativeState(browser, 'focus-request-target', 'focused', true);
      await expect(status).toHaveText('confirmed');
      await expect(await browser.$('~focus-input-modality')).toHaveText('pointer');
      await (await browser.$('~focus-request-disable')).click();
      await expect(await browser.$('~focus-request-target')).not.toBeEnabled();
      await command.click();
      await expect(status).toHaveText('not-focusable');
      await (await browser.$('~focus-request-mount')).click();
      await expect(await browser.$('~focus-request-target')).not.toExist();
      await command.click();
      await expect(status).toHaveText('not-mounted');
    },
  },
};

export const Overview: Story = {
  render: () => (
    <View style={styles.story}>
      <StoryGroup label="Appearance">
        {appearances.map(({ label, value }) => (
          <Button key={value} appearance={value} content={label} testID={`agentic-storybook-button-overview-${value}`} />
        ))}
      </StoryGroup>
      <StoryGroup label="Size">
        {sizes.map(({ label, value }) => (
          <Button key={value} content={label} size={value} />
        ))}
      </StoryGroup>
      <StoryGroup label="Content">
        <Button content="Text only" />
        <Button content="Icon and text" icon={addIcon} />
        <Button accessibilityLabel="Add item" icon={addIcon} />
      </StoryGroup>
      <StoryGroup label="Availability">
        <Button content="Enabled" />
        <Button content="Disabled" disabled />
      </StoryGroup>
    </View>
  ),
  parameters: {
    docs: {
      description: {
        story: 'A grouped scan of the main appearance, size, content, and availability variants.',
      },
    },
  },
};

export const Appearance: Story = {
  render: () => (
    <StoryGroup label="Appearance">
      {appearances.map(({ label, value }) => (
        <Button key={value} appearance={value} content={label} icon={addIcon} />
      ))}
    </StoryGroup>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Secondary is the default. Use Primary for the highest-emphasis action, Outline for light containment, and Subtle for low-emphasis actions.',
      },
    },
  },
};

export const Size: Story = {
  render: () => (
    <View style={styles.story}>
      {sizes.map(({ label, value }) => (
        <StoryGroup key={value} label={label}>
          <Button content={label} size={value} />
          <Button content={`${label} with icon`} icon={addIcon} size={value} />
          <Button accessibilityLabel={`Add item (${label.toLowerCase()})`} icon={addIcon} size={value} />
        </StoryGroup>
      ))}
    </View>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Button supports Small, Medium, and Large sizes. Medium is the default.',
      },
    },
  },
};

export const Shape: Story = {
  render: () => (
    <StoryGroup label="Shape">
      {shapes.map(({ label, value }) =>
        value === 'rounded' ? (
          <Button key={value} content={label} shape={value} />
        ) : (
          <Button key={value} accessibilityLabel={`Add item (${label.toLowerCase()})`} icon={addIcon} shape={value} />
        ),
      )}
    </StoryGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Text buttons are rounded by default. Icon-only buttons are circular by default and can also be square.',
      },
    },
  },
};

export const Icon: Story = {
  render: () => (
    <StoryGroup label="Icon">
      <Button content="Before content" icon={addIcon} />
      <Button content="After content" icon={addIcon} iconPosition="after" />
      <Button accessibilityLabel="Add item" icon={addIcon} />
    </StoryGroup>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'The icon slot can appear before or after content. Icon-only buttons require an action-oriented accessibilityLabel and a visible tooltip in product UI.',
      },
    },
  },
};

export const Selected: Story = {
  render: () => (
    <StoryGroup label="Selection">
      <Button content="Not selected" icon={regularStarIcon} selected={false} selectedIcon={filledStarIcon} />
      <Button content="Selected" icon={regularStarIcon} selected selectedIcon={filledStarIcon} />
    </StoryGroup>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Supplying selected enables toggle-button semantics. selectedIcon replaces icon in the selected state while the label layout remains stable.',
      },
    },
  },
};

export const ExternallyDrivenSelection: Story = {
  wdio: {
    'starts unselected': async ({ browser, expect }) => {
      await expect(await browser.$('~agentic-storybook-button-selection-state')).toHaveText('Not selected');
    },
    'updates and resets caller-owned selection': async ({ browser, expect, skip }) => {
      const features = browser.capabilities['furn:features'];
      if (!features) throw new Error('Desktop Driver did not provide feature capabilities.');
      if (!features.physicalClick) {
        skip('This test requires physical pointer input.');
        return;
      }
      const favorite = await browser.$('~agentic-storybook-button-favorite');
      const reset = await browser.$('~agentic-storybook-button-reset');
      const status = await browser.$('~agentic-storybook-button-selection-state');
      await expect(favorite).toBeEnabled();
      await expect(status).toHaveText('Not selected');
      await favorite.click();
      await expect(status).toHaveText('Selected');
      await reset.click();
      await expect(status).toHaveText('Not selected');
    },
  },
  render: () => {
    const ToggleGroup = () => {
      const [selected, setSelected] = useState(false);
      return (
        <StoryGroup label={selected ? 'Selected' : 'Not selected'} labelTestID="agentic-storybook-button-selection-state">
          <Button
            content="Favorite"
            icon={regularStarIcon}
            onPress={() => setSelected(!selected)}
            selected={selected}
            selectedIcon={filledStarIcon}
            testID="agentic-storybook-button-favorite"
          />
          <Button appearance="subtle" content="Reset" onPress={() => setSelected(false)} testID="agentic-storybook-button-reset" />
        </StoryGroup>
      );
    };
    return <ToggleGroup />;
  },
  parameters: {
    docs: {
      description: {
        story:
          'A toggle button never changes its own state. The caller owns selected and updates it from onPress, which is why an external action such as Reset can change it just as easily.',
      },
    },
  },
};

export const Disabled: Story = {
  render: () => (
    <View style={styles.story}>
      {appearances.map(({ label, value }) => (
        <StoryGroup key={value} label={label}>
          <Button appearance={value} content="Enabled" />
          <Button appearance={value} content="Disabled" disabled />
        </StoryGroup>
      ))}
    </View>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Disabled buttons are unavailable, expose disabled accessibility state, and do not receive focus.',
      },
    },
  },
};

export const WithLongText: Story = {
  render: () => (
    <StoryGroup label="Content width">
      <Button content="Short text" />
      <Button content="Long text wraps after it reaches the constrained width of the button" style={styles.longButton} />
    </StoryGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Button content wraps when the root is constrained by its surrounding layout.',
      },
    },
  },
};

const styles = StyleSheet.create({
  group: {
    alignItems: 'flex-start',
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
  longButton: {
    width: 280,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  story: {
    alignItems: 'flex-start',
    gap: 16,
  },
});
