/** @jsxImportSource @fluentui-react-native/framework-base */
import { StyleSheet } from 'react-native';
import type { TextStyle, ViewStyle } from 'react-native';

import { render } from '@testing-library/react-native';

import { defaultFlexTokens } from '@fluentui-react-native/design/testing';

import { Label } from './label';

const includeHidden = { includeHiddenElements: true } as const;

function renderLabel(props: React.ComponentProps<typeof Label> = {}) {
  return render(<Label {...props} />);
}

type RenderedLabel = Awaited<ReturnType<typeof renderLabel>>;

function getRoot(component: RenderedLabel) {
  if (!component.root) {
    throw new Error('Label did not render a root instance.');
  }
  if (component.root.type === 'View') {
    return component.root;
  }
  const [root] = component.root.queryAll((instance) => instance.type === 'View');
  if (!root) {
    throw new Error('Label did not render a native View.');
  }
  return root;
}

function getRootStyle(component: RenderedLabel): ViewStyle {
  return StyleSheet.flatten(getRoot(component).props.style);
}

function getText(component: RenderedLabel, text: string) {
  return component.getByText(text, includeHidden);
}

function queryText(component: RenderedLabel, text: string) {
  return component.queryByText(text, includeHidden);
}

function getTextStyle(component: RenderedLabel, text: string): TextStyle {
  return StyleSheet.flatten(getText(component, text).props.style);
}

describe('Label', () => {
  it('renders the default label text with medium regular typography and primary foreground', async () => {
    const component = await renderLabel();
    const tokens = defaultFlexTokens;

    expect(getText(component, 'Label')).toBeOnTheScreen();
    expect(getTextStyle(component, 'Label')).toMatchObject({
      color: tokens.color.foregroundNeutralPrimary,
      fontFamily: tokens.fontFamily.functional,
      fontSize: tokens.fontSize.functionalBodyMedium,
      fontWeight: tokens.fontWeight.functionalRegular,
      lineHeight: tokens.lineHeight.functionalBodyMedium,
    });
    expect(getRootStyle(component)).toMatchObject({
      alignItems: 'center',
      alignSelf: 'flex-start',
      flexDirection: 'row',
      gap: tokens.spacing.componentBase50,
      padding: 0,
    });
  });

  it('renders caller content through the content slot', async () => {
    const component = await renderLabel({ content: 'Display name' });

    expect(getText(component, 'Display name')).toBeOnTheScreen();
    expect(queryText(component, 'Label')).toBeNull();
    expect(getRoot(component).children).toHaveLength(1);
  });

  it('omits the required indicator unless required is set', async () => {
    const component = await renderLabel({ content: 'Display name' });

    expect(queryText(component, '*')).toBeNull();
  });

  it('renders a decorative required indicator after the label text', async () => {
    const component = await renderLabel({ content: 'Display name', required: true });
    const tokens = defaultFlexTokens;
    const indicator = getText(component, '*');

    expect(getRoot(component).children).toHaveLength(2);
    expect(indicator.props).toMatchObject({
      accessibilityElementsHidden: true,
      accessible: false,
      importantForAccessibility: 'no-hide-descendants',
    });
    expect(getTextStyle(component, '*')).toMatchObject({
      color: tokens.color.foregroundDangerPrimary,
      fontSize: tokens.fontSize.functionalBodyMedium,
      fontWeight: tokens.fontWeight.functionalRegular,
    });
  });

  it('keeps both text slots hidden when caller props try to expose them', async () => {
    const component = await renderLabel({
      content: {
        accessibilityElementsHidden: false,
        accessible: true,
        children: 'Display name',
        importantForAccessibility: 'yes',
      },
      required: true,
      requiredIndicator: {
        accessibilityElementsHidden: false,
        accessible: true,
        children: 'Required',
        importantForAccessibility: 'yes',
      },
    });

    for (const text of ['Display name', 'Required']) {
      expect(getText(component, text).props).toMatchObject({
        accessibilityElementsHidden: true,
        accessible: false,
        importantForAccessibility: 'no-hide-descendants',
      });
    }
    expect(getRoot(component).props.role).toBeUndefined();
  });

  it('lets a caller replace the required indicator', async () => {
    const component = await renderLabel({ content: 'Display name', required: true, requiredIndicator: 'Required' });

    expect(getText(component, 'Required')).toBeOnTheScreen();
    expect(queryText(component, '*')).toBeNull();
  });

  it('lets a caller suppress the required indicator while required is set', async () => {
    const component = await renderLabel({ content: 'Display name', required: true, requiredIndicator: null });

    expect(queryText(component, '*')).toBeNull();
    expect(getRoot(component).children).toHaveLength(1);
  });

  it.each([
    ['small', 'functionalBodySmall'],
    ['medium', 'functionalBodyMedium'],
    ['large', 'functionalBodyLarge'],
  ] as const)('resolves the %s size typography', async (size, typographyToken) => {
    const tokens = defaultFlexTokens;
    const component = await renderLabel({ content: size, required: true, size });

    for (const text of [size, '*']) {
      expect(getTextStyle(component, text)).toMatchObject({
        fontSize: tokens.fontSize[typographyToken],
        lineHeight: tokens.lineHeight[typographyToken],
      });
    }
  });

  it.each([
    ['regular', 'functionalRegular'],
    ['strong', 'functionalSemibold'],
  ] as const)('resolves the %s weight for the text and the indicator', async (weight, weightToken) => {
    const tokens = defaultFlexTokens;
    const component = await renderLabel({ content: weight, required: true, weight });

    for (const text of [weight, '*']) {
      expect(getTextStyle(component, text).fontWeight).toBe(tokens.fontWeight[weightToken]);
    }
  });

  it('applies the disabled foreground to the text and the indicator', async () => {
    const tokens = defaultFlexTokens;
    const component = await renderLabel({ content: 'Display name', disabled: true, required: true });

    expect(getTextStyle(component, 'Display name').color).toBe(tokens.color.foregroundNeutralDisabled);
    expect(getTextStyle(component, '*').color).toBe(tokens.color.foregroundNeutralDisabled);
  });

  it('does not report a disabled accessibility state of its own', async () => {
    const component = await renderLabel({ content: 'Display name', disabled: true });

    expect(getRoot(component).props.accessibilityState).toBeUndefined();
  });

  it('exposes a single non-focusable element named by its content', async () => {
    const component = await renderLabel({ content: 'Display name', required: true });

    expect(component.queryAllByRole('text')).toHaveLength(0);
    expect(getRoot(component).props).toMatchObject({
      accessibilityLabel: 'Display name',
      accessible: true,
      focusable: false,
    });
    expect(getRoot(component).props.role).toBeUndefined();
  });

  it('reads the accessible name out of content slot props', async () => {
    const component = await renderLabel({ content: { children: 'Display name' } });

    expect(getRoot(component).props.accessibilityLabel).toBe('Display name');
  });

  it('lets a caller override the accessible name', async () => {
    const component = await renderLabel({ accessibilityLabel: 'Your display name', content: 'Display name' });

    expect(getRoot(component).props.accessibilityLabel).toBe('Your display name');
  });

  it('warns when content that is not a string has no accessibility label', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation();

    await renderLabel({ content: { children: <Label content="Nested" /> } });

    expect(warn).toHaveBeenCalledWith('Label: content that is not a string requires an accessibilityLabel.');
    warn.mockRestore();
  });

  it('does not warn when content that is not a string is named by the caller', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation();

    await renderLabel({ accessibilityLabel: 'Display name', content: { children: <Label content="Nested" /> } });

    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it('passes nativeID through so a control can reference the label', async () => {
    const component = await renderLabel({ content: 'Display name', nativeID: 'display-name-label' });

    expect(getRoot(component).props.nativeID).toBe('display-name-label');
  });

  it('applies the user root style after component styles', async () => {
    const style: ViewStyle = { alignSelf: 'stretch', paddingBottom: 4 };
    const component = await renderLabel({ content: 'Display name', style });

    expect(getRootStyle(component)).toMatchObject({
      alignSelf: 'stretch',
      flexDirection: 'row',
      paddingBottom: 4,
    });
  });
});
