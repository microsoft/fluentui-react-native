/** @jsxImportSource @fluentui-react-native/framework-base */
import { useState } from 'react';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { AccessibilityActionEvent } from 'react-native';
import { desktopIt } from '@fluentui-react-native/storybook-desktop/testing';
import type { WdioStory } from '@fluentui-react-native/storybook-desktop/testing';

import type { Meta, StoryObj } from '@storybook/react-native';

import { Radio } from './radio';
import type { RadioProps } from './radio.types';
import { StoryStatus } from '../../common/StoryStatus.story-helpers';
import { Input } from '../input/input';
import { Button } from '../button/button';

type StoryGroupProps = {
  children: ReactNode;
  label: string;
};

const StoryGroup = ({ children, label }: StoryGroupProps) => (
  <View style={styles.group}>
    <Text style={styles.groupLabel}>{label}</Text>
    <View style={styles.column}>{children}</View>
  </View>
);

const meta: Meta<typeof Radio> = {
  title: 'Components/Radio',
  component: Radio,
  args: {
    label: 'Radio option',
    secondaryText: 'Additional detail',
    selected: false,
    showSecondaryText: true,
    testID: 'agentic-storybook-radio',
  },
  argTypes: {
    disabled: { control: 'boolean' },
    label: { control: 'text' },
    secondaryText: { control: 'text' },
    selected: { control: 'boolean' },
    showSecondaryText: { control: 'boolean' },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Radio is a molecular single-select control for choosing exactly one option from a mutually exclusive set. It always renders a visible label and can optionally show supporting text beneath the label.',
      },
    },
  },
};

export default meta;

type Story = WdioStory<StoryObj<typeof Radio>>;

export const Default: Story = {};

function KeyboardActivationScene() {
  const [presses, setPresses] = useState(0);
  return (
    <View>
      <Input accessibilityLabel="Radio entry" testID="radio-keyboard-entry" />
      <Radio label="Caller-owned option" selected={false} testID="radio-keyboard-target" onPress={() => setPresses((count) => count + 1)} />
      <Radio disabled label="Unavailable option" testID="radio-keyboard-disabled" />
      <Button content="After radio" testID="radio-keyboard-after" />
      <StoryStatus testID="radio-keyboard-presses">{String(presses)}</StoryStatus>
    </View>
  );
}

export const KeyboardActivation: Story = {
  render: () => <KeyboardActivationScene />,
  tags: ['desktop-focus'],
  wdio: [
    desktopIt(
      'RAD-003 RAD-005 activates once per Space and traverses disabled radios without claiming group navigation',
      { requires: ['physical-click', 'keyboard', 'focus'] },
      async ({ browser, expect }) => {
        const { expectNativeState, focusByTab } = await import('../../common/desktopFocus.wdio.ts');
        await focusByTab(browser, 'radio-keyboard-entry', 'radio-keyboard-target');
        expect(await (await browser.$('~radio-keyboard-target')).getTagName()).toBe('radio');
        await browser.keys('\uE00D');
        await expect(await browser.$('~radio-keyboard-presses')).toHaveText('1');
        await expectNativeState(browser, 'radio-keyboard-target', 'focused', true);
        await browser.keys('\uE00D');
        await expect(await browser.$('~radio-keyboard-presses')).toHaveText('2');
        await browser.keys('\uE004');
        await expectNativeState(browser, 'radio-keyboard-after', 'focused', true);
        await expectNativeState(browser, 'radio-keyboard-disabled', 'focused', false);
        await browser.keys(['\uE008', '\uE004']);
        await expectNativeState(browser, 'radio-keyboard-target', 'focused', true);
      },
    ),
  ],
};

export const NativeSelectionSemantics: Story = {
  render: () => {
    const Scene = () => {
      const [actions, setActions] = useState(0);
      const [presses, setPresses] = useState(0);
      const [lastAction, setLastAction] = useState('none');
      const recordAction = (event: AccessibilityActionEvent) => {
        setLastAction(event.nativeEvent.actionName);
        setActions((value) => value + 1);
      };
      return (
        <View style={styles.story}>
          <Radio
            label="Unselected option"
            selected={false}
            testID="radio-native-off"
            onAccessibilityAction={recordAction}
            onPress={() => setPresses((value) => value + 1)}
          />
          <Radio label="Selected option" selected testID="radio-native-on" />
          <Radio
            label="Disabled option"
            selected
            disabled
            testID="radio-native-disabled"
            onAccessibilityAction={recordAction}
            onPress={() => setPresses((value) => value + 1)}
          />
          <StoryStatus testID="radio-native-actions">{String(actions)}</StoryStatus>
          <StoryStatus testID="radio-native-presses">{String(presses)}</StoryStatus>
          <StoryStatus testID="radio-native-last-action">{lastAction}</StoryStatus>
        </View>
      );
    };
    return <Scene />;
  },
  wdio: [
    desktopIt(
      'RAD-003 RAD-005 Win32 exposes native RadioButton selection, names and disabled state',
      { platforms: ['win32'] },
      async ({ browser, expect }) => {
        for (const [id, name, selected] of [
          ['radio-native-off', 'Unselected option', false],
          ['radio-native-on', 'Selected option', true],
          ['radio-native-disabled', 'Disabled option', true],
        ] as const) {
          const radio = await browser.$(`~${id}`);
          expect(await radio.getTagName()).toBe('radio');
          expect(await radio.getProperty('name')).toBe(name);
          expect(await radio.getProperty('selected')).toBe(selected);
        }
        await expect(await browser.$('~radio-native-disabled')).toBeDisabled();
      },
    ),
    desktopIt(
      'RAD-003 Win32 Select forwards once without self-selection or presses and disabled public activation rejects',
      { requires: ['accessibility-click'], platforms: ['win32'] },
      async ({ browser, expect }) => {
        const radio = await browser.$('~radio-native-off');
        const disabled = await browser.$('~radio-native-disabled');
        const actions = await browser.$('~radio-native-actions');
        const presses = await browser.$('~radio-native-presses');
        await expect(actions).toHaveAttribute('name', '0');
        await radio.click();
        await expect(actions).toHaveAttribute('name', '1');
        await expect(await browser.$('~radio-native-last-action')).toHaveAttribute('name', 'Select');
        await expect(presses).toHaveAttribute('name', '0');
        expect(await radio.getProperty('selected')).toBe(false);
        let rejection: unknown;
        try {
          await disabled.click();
        } catch (error) {
          rejection = error;
        }
        expect(rejection).toBeDefined();
        await expect(actions).toHaveAttribute('name', '1');
        await expect(presses).toHaveAttribute('name', '0');
        expect(await disabled.getProperty('selected')).toBe(true);
      },
    ),
  ],
};

export const Overview: Story = {
  render: ({ label, secondaryText }: RadioProps) => (
    <View style={styles.story}>
      <StoryGroup label="Selection">
        <Radio label={label} secondaryText={secondaryText} showSecondaryText />
        <Radio label="Selected option" secondaryText="This option is active" selected showSecondaryText />
      </StoryGroup>
      <StoryGroup label="Supporting text">
        <Radio label="Label only" showSecondaryText={false} />
        <Radio label="With supporting text" secondaryText="Explains the choice" showSecondaryText />
      </StoryGroup>
      <StoryGroup label="Availability">
        <Radio label="Enabled" />
        <Radio disabled label="Disabled" />
      </StoryGroup>
    </View>
  ),
  parameters: {
    docs: {
      description: {
        story: 'A grouped scan of the main selection, supporting text, and availability states.',
      },
    },
  },
};

export const Selection: Story = {
  render: () => (
    <StoryGroup label="Selection">
      <Radio label="Unselected" />
      <Radio label="Selected" selected />
    </StoryGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Selected radios shift the label and indicator colors to the active choice palette and expose checked semantics.',
      },
    },
  },
};

export const Group: Story = {
  render: () => {
    const options = ['Daily', 'Weekly', 'Never'];
    const Group = () => {
      const [choice, setChoice] = useState('Daily');
      return (
        <StoryGroup label={`Notify me: ${choice}`}>
          {options.map((option) => (
            <Radio key={option} label={option} onPress={() => setChoice(option)} selected={choice === option} showSecondaryText={false} />
          ))}
        </StoryGroup>
      );
    };
    return <Group />;
  },
  parameters: {
    docs: {
      description: {
        story:
          'A radio group owns the chosen option. Each radio renders the selected value it is given and reports presses through onPress, so the group is responsible for clearing the previous choice.',
      },
    },
  },
};

export const SupportingText: Story = {
  render: () => (
    <StoryGroup label="Supporting text">
      <Radio label="Hidden" showSecondaryText={false} />
      <Radio label="Visible" secondaryText="Helpful extra context" showSecondaryText />
    </StoryGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Supporting text is hidden by default and can be shown beneath the label when the option needs extra context.',
      },
    },
  },
};

export const Disabled: Story = {
  render: () => (
    <StoryGroup label="Availability">
      <Radio label="Enabled" />
      <Radio label="Disabled" disabled />
    </StoryGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Disabled radios are unavailable, expose disabled accessibility state, and do not receive focus.',
      },
    },
  },
};

export const ConstrainedLayout: Story = {
  render: () => (
    <View style={styles.story}>
      <Text style={styles.caption}>The label can wrap when the surrounding layout is narrow.</Text>
      <Radio
        label="A long radio label that wraps naturally inside the constrained layout"
        secondaryText="Supporting text stays attached to the label cluster."
        showSecondaryText
        style={styles.constrainedRadio}
      />
    </View>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Radio labels can shrink and wrap when the surrounding layout constrains their width.',
      },
    },
  },
};

const styles = StyleSheet.create({
  caption: {
    fontSize: 12,
    fontWeight: '600',
  },
  column: {
    alignItems: 'flex-start',
    gap: 8,
  },
  constrainedRadio: {
    width: 220,
  },
  group: {
    alignItems: 'flex-start',
    gap: 8,
  },
  groupLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  story: {
    alignItems: 'flex-start',
    gap: 16,
  },
});
