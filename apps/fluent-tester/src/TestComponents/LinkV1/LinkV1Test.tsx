import * as React from 'react';
import { Alert, View, StyleSheet, Text, TextInput } from 'react-native';
import { Platform } from 'react-native';

import type { LinkTokens } from '@fluentui/react-native';
import { LinkV1 as Link } from '@fluentui/react-native';
import { LINKV1_TESTPAGE } from '@fluentui-react-native/e2e-testing';
import { Stack } from '@fluentui-react-native/stack';

import { E2ELinkV1Test } from './E2ELinkV1Test';
import { InlineLinks } from './InlineLinksTest';
import { stackStyle, commonTestStyles as commonStyles } from '../Common/styles';
import type { TestSection, PlatformStatus } from '../Test';
import { Test } from '../Test';

const DefaultLinks: React.FunctionComponent = () => {
  const doPress = React.useCallback(() => Alert.alert('Alert.', 'You have been alerted.'), []);
  const doAllyTap = React.useCallback(() => Alert.alert('Alert.', 'You have invoked onAllyTap.'), []);

  return (
    <Stack style={stackStyle}>
      <Link tooltip={'https://www.bing.com/'} url="https://www.bing.com/">
        Click to navigate.
      </Link>
      <Link onPress={doPress} onAccessibilityTap={doAllyTap}>
        Click to alert.
      </Link>
      <Link disabled>Disabled Link</Link>
    </Stack>
  );
};

const SubtleLinks: React.FunctionComponent = () => {
  const doPress = React.useCallback(() => Alert.alert('Alert.', 'You have been alerted.'), []);
  const doAllyTap = React.useCallback(() => Alert.alert('Alert.', 'You have invoked onAllyTap.'), []);
  const supportsInlineLink = Platform.OS !== ('win32' as any);

  return (
    <Stack style={stackStyle}>
      <Link appearance="subtle" url="https://www.bing.com/">
        Click to navigate.
      </Link>
      {supportsInlineLink && (
        <Text>
          This is inline Link.{' '}
          <Link appearance="subtle" inline onPress={doPress} onAccessibilityTap={doAllyTap}>
            Click to alert.
          </Link>
        </Text>
      )}
      <Link appearance="subtle" onPress={doPress} disabled>
        Disabled Link
      </Link>
    </Stack>
  );
};

const styles = StyleSheet.create({
  tokensRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  tokensColumn: {
    flexDirection: 'column',
    margin: 10,
  },
});

const BlueHeaderBold = Link.customize({ variant: 'headerStandard', fontWeight: '700', color: '#0229c4', textAlign: 'right' });
const CustomLinks: React.FunctionComponent = () => {
  const [linkColor, setLinkColor] = React.useState<string>('blue');
  const [linkFont, setLinkFont] = React.useState<string>('Ariel');
  const [linkFontSize, setLinkFontSize] = React.useState<number>(12);
  const [linkText, setLinkText] = React.useState<string>('Click to Navigate');
  const [linkUrl, setLinkUrl] = React.useState<string>('https://www.bing.com/');

  const CustomLink = React.useMemo(() => {
    const tokens: LinkTokens = {
      color: linkColor,
      fontFamily: linkFont,
      fontSize: linkFontSize,
    };
    return Link.customize(tokens);
  }, [linkColor, linkFont, linkFontSize]);

  return (
    <View style={styles.tokensColumn}>
      <View style={styles.tokensRow}>
        <View>
          <Text>Text Tokens</Text>
          <TextInput
            accessibilityLabel="Link color"
            style={commonStyles.textBox}
            placeholder="Link color"
            blurOnSubmit={true}
            onSubmitEditing={(e) => {
              setLinkColor(e.nativeEvent.text);
            }}
          />
          <TextInput
            accessibilityLabel="Link font"
            style={commonStyles.textBox}
            placeholder="Link font"
            blurOnSubmit={true}
            onSubmitEditing={(e) => {
              setLinkFont(e.nativeEvent.text);
            }}
          />
          <TextInput
            accessibilityLabel="Link font size"
            style={commonStyles.textBox}
            placeholder="Link font size"
            blurOnSubmit={true}
            onSubmitEditing={(e) => {
              setLinkFontSize(parseInt(e.nativeEvent.text));
            }}
          />
        </View>
        <View>
          <Text>Content and URL customize</Text>
          <TextInput
            accessibilityLabel="Link text"
            style={commonStyles.textBox}
            placeholder="Link text"
            blurOnSubmit={true}
            onSubmitEditing={(e) => {
              setLinkText(e.nativeEvent.text);
            }}
          />
          <TextInput
            accessibilityLabel="Link Url"
            style={commonStyles.textBox}
            placeholder="Link URL"
            blurOnSubmit={true}
            onSubmitEditing={(e) => {
              setLinkUrl(e.nativeEvent.text);
            }}
          />
        </View>
      </View>
      <CustomLink align="end" url={linkUrl}>
        {linkText}
      </CustomLink>
      <BlueHeaderBold>BlueHeaderBold</BlueHeaderBold>
    </View>
  );
};

const linkSections: TestSection[] = [
  {
    name: 'Default Links',
    testID: LINKV1_TESTPAGE,
    component: DefaultLinks,
  },
  {
    name: 'Inline Links',
    component: InlineLinks,
  },
  Platform.select({
    // As per design discussion, there is no use case for subtle link on Android, no tokens available for the same.
    android: null,
    default: {
      name: 'Subtle Links',
      component: SubtleLinks,
    },
  }),
  Platform.select({
    android: null,
    default: {
      name: 'Custom Link',
      component: CustomLinks,
    },
  }),
];

const e2eSections: TestSection[] = [
  {
    name: 'Link E2E Test',
    component: E2ELinkV1Test,
  },
];

export const LinkV1Test: React.FunctionComponent = () => {
  const status: PlatformStatus = {
    win32Status: 'Production',
    uwpStatus: 'Backlog',
    iosStatus: 'Production',
    macosStatus: 'Production',
    androidStatus: 'Production',
  };

  const description =
    'With a Link, users can navigate to another page, window, or Help topic; display a definition; initiate a command; or choose an option. A Link indicates that it can be clicked, typically by being displayed using the visited or unvisited link system colors. Traditionally, Links are underlined as well, but that approach is often unnecessary and falling out of favor to reduce visual clutter.\n\nA Link is the lightest weight clickable control, and is often used to reduce the visual complexity of a design.';

  return <Test name="LinkV1 Test" description={description} sections={linkSections} status={status} e2eSections={e2eSections}></Test>;
};
