/** @jsxImportSource @fluentui-react-native/framework-base */
import * as React from 'react';
import { StyleSheet, Text as NativeText, View } from 'react-native';
import type { LayoutChangeEvent, LayoutRectangle } from 'react-native';

import type { Meta, StoryObj } from '@storybook/react-native';
import type { WdioStory } from '@fluentui-react-native/storybook-desktop/testing';

import { StoryStatus } from '../../common/StoryStatus.story-helpers';
import { Button } from '../button/button';
import { Input } from '../input/input';
import type { Text } from '../text/text';
import { Label } from './label';
import type { LabelSize, LabelWeight } from './label.types';

const styles = StyleSheet.create({
  story: { alignItems: 'flex-start', gap: 16 },
  group: { alignItems: 'flex-start', gap: 8 },
  row: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  caption: { fontSize: 12 },
  constrained: { width: 180 },
  rtl: { direction: 'rtl' },
});

const sizes: readonly LabelSize[] = ['small', 'medium', 'large'];
const weights: readonly LabelWeight[] = ['regular', 'strong'];

function StoryGroup({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <View style={styles.group}>
      <NativeText style={styles.caption}>{label}</NativeText>
      <View style={styles.row}>{children}</View>
    </View>
  );
}

const meta: Meta<typeof Label> = {
  title: 'Components/Label',
  component: Label,
  args: {
    content: 'Display name',
    disabled: false,
    required: false,
    size: 'medium',
    weight: 'regular',
    testID: 'agentic-storybook-label',
  },
  argTypes: {
    content: { control: 'text' },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
    requiredIndicator: { control: false },
    size: { control: 'select', options: sizes },
    weight: { control: 'select', options: weights },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Non-interactive naming text with an optional decorative required marker. Explicit native naming belongs on the actual control or group; nativeID alone does not establish a relationship. Native qualification is not yet run.',
      },
    },
  },
};

export default meta;
type Story = WdioStory<StoryObj<typeof Label>>;

export const Default: Story = {
  tags: ['desktop-e2e'],
  wdio: {
    'exposes one named native text root': async ({ browser, expect }) => {
      const label = await browser.$('~agentic-storybook-label');
      await expect(label).toExist();
      expect(await label.getTagName()).toBe('text');
      expect(await label.getAttribute('name')).toBe('Display name');
      expect(await browser.$$('=Display name')).toHaveLength(1);
    },
  },
};

export const Overview: Story = {
  render: () => (
    <View style={styles.story}>
      <StoryGroup label="Weight">
        {weights.map((weight) => (
          <Label key={weight} content={weight} weight={weight} />
        ))}
      </StoryGroup>
      <StoryGroup label="Size">
        {sizes.map((size) => (
          <Label key={size} content={size} size={size} />
        ))}
      </StoryGroup>
      <StoryGroup label="Required and disabled">
        <Label content="Optional" />
        <Label content="Required" required />
        <Label content="Disabled required" required disabled />
      </StoryGroup>
    </View>
  ),
  parameters: { docs: { description: { story: 'All finite presentation axes; none owns the associated control state.' } } },
};

export const Weight: Story = {
  render: () => (
    <StoryGroup label="Weight">
      {weights.map((weight) => (
        <Label key={weight} content={weight} weight={weight} />
      ))}
    </StoryGroup>
  ),
  parameters: { docs: { description: { story: 'Regular and strong change typography weight independently of size and state.' } } },
};

export const Size: Story = {
  render: () => (
    <StoryGroup label="Size">
      {sizes.map((size) => (
        <Label key={size} content={size} size={size} />
      ))}
    </StoryGroup>
  ),
  parameters: { docs: { description: { story: 'Small, medium, and large use functional body typography without a fixed text height.' } } },
};

export const Required: Story = {
  render: () => (
    <StoryGroup label="Required marker">
      <Label content="Optional" />
      <Label content="Required" required />
      <Label content="Custom marker" required requiredIndicator="(required)" />
      <Label content="Suppressed marker" required requiredIndicator={null} />
    </StoryGroup>
  ),
  parameters: {
    docs: { description: { story: 'Marker replacement/suppression does not change control requirements or the Label name.' } },
  },
};

export const Disabled: Story = {
  render: () => (
    <StoryGroup label="Disabled presentation">
      <Label content="Rest" required />
      <Label content="Disabled" required disabled />
    </StoryGroup>
  ),
  parameters: {
    docs: { description: { story: 'Disabled affects text/marker foreground only; the native control owns disabled semantics.' } },
  },
};

function PresentationScene() {
  const [required, setRequired] = React.useState(false);
  const [disabled, setDisabled] = React.useState(false);
  return (
    <View style={styles.story}>
      <Label content="Display name" testID="label-presentation" required={required} disabled={disabled} />
      <Button content="Toggle required marker" testID="label-toggle-required" onPress={() => setRequired((value) => !value)} />
      <Button content="Toggle disabled colors" testID="label-toggle-disabled" onPress={() => setDisabled((value) => !value)} />
      <StoryStatus testID="label-presentation-state">{`required=${required};disabled=${disabled}`}</StoryStatus>
    </View>
  );
}

export const InteractivePresentation: Story = {
  render: () => <PresentationScene />,
  wdio: {
    'updates marker and disabled presentation without changing the name': async ({ browser, expect, skip }) => {
      const features = browser.capabilities['furn:features'];
      if (!features) throw new Error('Desktop Driver did not provide feature capabilities.');
      if (!features.physicalClick) {
        skip('Changing the presentation requires physical pointer input.');
        return;
      }
      const label = await browser.$('~label-presentation');
      const status = await browser.$('~label-presentation-state');
      await (await browser.$('~label-toggle-required')).click();
      await expect(status).toHaveText('required=true;disabled=false');
      expect(await label.getAttribute('name')).toBe('Display name');
      await (await browser.$('~label-toggle-disabled')).click();
      await expect(status).toHaveText('required=true;disabled=true');
      expect(await label.getAttribute('name')).toBe('Display name');
      await (await browser.$('~label-toggle-required')).click();
      await expect(status).toHaveText('required=false;disabled=true');
      expect(await label.getAttribute('name')).toBe('Display name');
    },
  },
};

export const NamePrecedence: Story = {
  render: () => (
    <View style={styles.story}>
      <Label content={0} testID="label-zero" />
      <Label content="Visible" aria-label="Alias name" testID="label-alias" />
      <Label content="Visible" aria-label="Alias name" accessibilityLabel="Explicit name" testID="label-explicit" />
      <Label content={{ children: <NativeText>Custom content</NativeText> }} accessibilityLabel="Custom content" testID="label-complex" />
    </View>
  ),
  wdio: {
    'resolves zero, normalized aliases, and explicitly named complex content': async ({ browser, expect }) => {
      for (const [id, name] of [
        ['label-zero', '0'],
        ['label-alias', 'Alias name'],
        ['label-explicit', 'Explicit name'],
        ['label-complex', 'Custom content'],
      ]) {
        const label = await browser.$(`~${id}`);
        await expect(label).toExist();
        expect(await label.getAttribute('name')).toBe(name);
      }
    },
  },
};

export const AssociatedControl: Story = {
  tags: ['desktop-focus'],
  render: () => (
    <View style={styles.story}>
      <Input textInput={{ accessibilityLabel: 'Before the Label', testID: 'label-focus-before' }} />
      <Label content="Display name" nativeID="display-name-label" required testID="label-focus-label" />
      <Button content="After the Label" testID="label-focus-after" />
      <Input textInput={{ accessibilityLabel: 'Display name', testID: 'label-focus-editor' }} />
    </View>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'The editor is explicitly named. This example does not claim a native labelled-by relation or a required-state announcement.',
      },
    },
  },
  wdio: {
    'names the actual editor and keeps Label outside Tab traversal': async (context) => {
      const { requireDesktopFocus, focusByTab, expectNativeState } = await import('../../common/desktopFocus.wdio.ts');
      if (!requireDesktopFocus(context)) return;
      const { browser, expect } = context;
      await focusByTab(browser, 'label-focus-before', 'label-focus-after');
      expect(await (await browser.$('~label-focus-editor')).getAttribute('name')).toBe('Display name');
      await expectNativeState(browser, 'label-focus-label', 'focused', false);
      try {
        await browser.performActions([
          {
            type: 'key',
            id: 'label-shift-tab',
            actions: [
              { type: 'keyDown', value: '\uE008' },
              { type: 'keyDown', value: '\uE004' },
              { type: 'keyUp', value: '\uE004' },
              { type: 'keyUp', value: '\uE008' },
            ],
          },
        ]);
      } finally {
        await browser.releaseActions();
      }
      await expectNativeState(browser, 'label-focus-before', 'focused', true);
      await expectNativeState(browser, 'label-focus-label', 'focused', false);
      await (await browser.$('~label-focus-editor')).click();
      await expectNativeState(browser, 'label-focus-editor', 'focused', true);
    },
    'does not forward a Label press to the editor': async (context) => {
      const { requireDesktopFocus, expectNativeState } = await import('../../common/desktopFocus.wdio.ts');
      if (!requireDesktopFocus(context)) return;
      const { browser } = context;
      await (await browser.$('~label-focus-before')).click();
      await expectNativeState(browser, 'label-focus-before', 'focused', true);
      await (await browser.$('~label-focus-label')).click();
      await expectNativeState(browser, 'label-focus-label', 'focused', false);
      await expectNativeState(browser, 'label-focus-editor', 'focused', false);
    },
  },
};

export const VisualLegend: Story = {
  render: () => (
    <View style={styles.story}>
      <Label accessible={false} content="Delivery preference" size="medium" weight="strong" required />
      <NativeText>The RadioGroup owner supplies its own explicit group name and individually accessible options.</NativeText>
    </View>
  ),
  parameters: {
    docs: { description: { story: 'Visual legend composition only, not an implemented RadioGroup or native group-announcement proof.' } },
  },
};

function MeasuredLabel({ rtl }: { rtl: boolean }) {
  const [root, setRoot] = React.useState<LayoutRectangle>();
  const [content, setContent] = React.useState<LayoutRectangle>();
  const [indicator, setIndicator] = React.useState<LayoutRectangle>();
  const [shortContent, setShortContent] = React.useState<LayoutRectangle>();
  const id = rtl ? 'rtl' : 'ltr';
  return (
    <View style={styles.group}>
      <Label
        content={{
          children: 'A long translated label that must wrap without clipping its required marker',
          onLayout: (event: LayoutChangeEvent) => setContent(event.nativeEvent.layout),
        }}
        required
        requiredIndicator={{ onLayout: (event: LayoutChangeEvent) => setIndicator(event.nativeEvent.layout) }}
        style={[styles.constrained, rtl && styles.rtl]}
        onLayout={(event: LayoutChangeEvent) => setRoot(event.nativeEvent.layout)}
        testID={`label-layout-${id}`}
      />
      <Label content={{ children: 'Short', onLayout: (event: LayoutChangeEvent) => setShortContent(event.nativeEvent.layout) }} />
      <StoryStatus testID={`label-layout-metrics-${id}`}>
        {root && content && indicator && shortContent
          ? JSON.stringify({ root, content, indicator, shortContent })
          : 'Waiting for native layout'}
      </StoryStatus>
    </View>
  );
}

export const ConstrainedLayout: Story = {
  render: () => (
    <View style={styles.story}>
      <MeasuredLabel rtl={false} />
      <MeasuredLabel rtl />
    </View>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Native measurements for constrained wrapping and a separate trailing marker in both logical directions. Rerun with enlarged system text; the marker is not promised to follow the final word.',
      },
    },
  },
  wdio: {
    'wraps long content and fits the separate marker in LTR and RTL': async ({ browser }) => {
      const assert: typeof import('node:assert') = (await import('node:assert')).default;
      for (const direction of ['ltr', 'rtl']) {
        const status = await browser.$(`~label-layout-metrics-${direction}`);
        await browser.waitUntil(async () => (await status.getText()).startsWith('{'));
        const metrics: { root: LayoutRectangle; content: LayoutRectangle; indicator: LayoutRectangle; shortContent: LayoutRectangle } =
          JSON.parse(await status.getText());
        assert(metrics.root.width > 0 && metrics.root.width <= 181, 'Constrained Label must respect its width.');
        assert(metrics.content.height > metrics.shortContent.height, 'Long content must wrap beyond one native line.');
        assert(metrics.indicator.width > 0 && metrics.indicator.height > 0, 'Marker must retain intrinsic dimensions.');
        for (const child of [metrics.content, metrics.indicator]) {
          assert(child.x >= -1 && child.x + child.width <= metrics.root.width + 1, 'Text slots must fit horizontally.');
          assert(child.y >= -1 && child.y + child.height <= metrics.root.height + 1, 'Text slots must fit vertically.');
        }
        assert(
          direction === 'rtl' ? metrics.indicator.x < metrics.content.x : metrics.indicator.x > metrics.content.x,
          'Marker must remain a logically trailing sibling.',
        );
      }
    },
  },
};

function RefLifecycleScene() {
  const [mounted, setMounted] = React.useState(true);
  const [revision, setRevision] = React.useState(0);
  const [rootAttached, setRootAttached] = React.useState(0);
  const [rootDetached, setRootDetached] = React.useState(0);
  const [textAttached, setTextAttached] = React.useState(0);
  const [textDetached, setTextDetached] = React.useState(0);
  const rootTarget = React.useRef<React.ComponentRef<typeof View> | null>(null);
  const textTarget = React.useRef<React.ComponentRef<typeof Text> | null>(null);
  const rootRef = React.useCallback((node: React.ComponentRef<typeof View> | null) => {
    rootTarget.current = node;
    if (node === null) return undefined;
    setRootAttached((count) => count + 1);
    return () => {
      rootTarget.current = null;
      setRootDetached((count) => count + 1);
    };
  }, []);
  const textRef = React.useCallback((node: React.ComponentRef<typeof Text> | null) => {
    textTarget.current = node;
    if (node === null) return undefined;
    setTextAttached((count) => count + 1);
    return () => {
      textTarget.current = null;
      setTextDetached((count) => count + 1);
    };
  }, []);
  return (
    <View style={styles.story}>
      {mounted && (
        <Label
          ref={rootRef}
          content={{ children: `Revision ${revision}`, ref: textRef }}
          nativeID="label-ref-native"
          testID="label-ref-root"
        />
      )}
      <Button content="Rerender content" testID="label-ref-rerender" onPress={() => setRevision((value) => value + 1)} />
      <Button content="Toggle mount" testID="label-ref-toggle" onPress={() => setMounted((value) => !value)} />
      <StoryStatus testID="label-ref-status">
        {JSON.stringify({ rootAttached, rootDetached, textAttached, textDetached, distinct: rootTarget.current !== textTarget.current })}
      </StoryStatus>
    </View>
  );
}

export const RefLifecycle: Story = {
  render: () => <RefLifecycleScene />,
  wdio: {
    'keeps native root and Text refs distinct, stable, and cleaned up on remount': async ({ browser, expect, skip }) => {
      const features = browser.capabilities['furn:features'];
      if (!features) throw new Error('Desktop Driver did not provide feature capabilities.');
      if (!features.physicalClick) {
        skip('The ref-lifecycle scenario requires physical pointer input.');
        return;
      }
      const status = await browser.$('~label-ref-status');
      await expect(status).toHaveText('{"rootAttached":1,"rootDetached":0,"textAttached":1,"textDetached":0,"distinct":true}');
      await (await browser.$('~label-ref-rerender')).click();
      await expect(status).toHaveText('{"rootAttached":1,"rootDetached":0,"textAttached":1,"textDetached":0,"distinct":true}');
      expect(await (await browser.$('~label-ref-root')).getAttribute('name')).toBe('Revision 1');
      await (await browser.$('~label-ref-toggle')).click();
      await expect(status).toHaveText('{"rootAttached":1,"rootDetached":1,"textAttached":1,"textDetached":1,"distinct":false}');
      await expect(await browser.$('~label-ref-root')).not.toExist();
      await (await browser.$('~label-ref-toggle')).click();
      await expect(status).toHaveText('{"rootAttached":2,"rootDetached":1,"textAttached":2,"textDetached":1,"distinct":true}');
      expect(await (await browser.$('~label-ref-root')).getAttribute('name')).toBe('Revision 1');
    },
  },
};
