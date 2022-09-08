import * as React from 'react';
import { Alert, View, StyleSheet, Text, TextInput} from 'react-native';
import { Link, LinkTokens } from '@fluentui-react-native/experimental-link';
import { Stack } from '@fluentui-react-native/stack';
import { stackStyle, commonTestStyles as commonStyles } from '../Common/styles';
import { EXPERIMENTAL_LINK_TESTPAGE } from './consts';
import { Test, TestSection, PlatformStatus } from '../Test';
import { LinkE2ETest } from './E2ELinkTest';
import { Typography } from '@fluentui-react-native/theme-types';

const DefaultLinks: React.FunctionComponent = () => {
  const doPress = (): void => {
    Alert.alert('Alert.', 'You have been alerted.');
  };

  const doAllyTap = (): void => {
    Alert.alert('Alert.', 'You have invoked onAllyTap.');
  };

  return (
    <Stack style={stackStyle}>
      <Link url="https://www.bing.com/">Click to navigate.</Link>
      <Link onPress={doPress} onAccessibilityTap={doAllyTap}>Click to alert.</Link>
      <Link disabled>Disabled Link</Link>
    </Stack>
  );
};

const InlineLinks: React.FunctionComponent = () => {
  const doPress = (): void => {
    Alert.alert('Alert.', 'You have been alerted.');
  };

  const doAllyTap = (): void => {
    Alert.alert('Alert.', 'You have invoked onAllyTap.');
  };


  return (
    <Stack style={stackStyle}>
      <Link inline url="https://www.bing.com/">Click to navigate.</Link>
      <Link inline onPress={doPress} onAccessibilityTap={doAllyTap}>Click to alert.</Link>
      <Link inline onPress={doPress} disabled>Disabled Link</Link>
    </Stack>
  );
};

const SubtleLinks: React.FunctionComponent = () => {
  const doPress = (): void => {
    Alert.alert('Alert.', 'You have been alerted.');
  };

  const doAllyTap = (): void => {
    Alert.alert('Alert.', 'You have invoked onAllyTap.');
  };

  return (
    <Stack style={stackStyle}>
      <Link appearance='subtle' url="https://www.bing.com/">Click to navigate.</Link>
      <Link appearance='subtle' inline onPress={doPress} onAccessibilityTap={doAllyTap}>Click to alert.</Link>
      <Link appearance='subtle' onPress={doPress} disabled>Disabled Link</Link>
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


const CustomLinks: React.FunctionComponent = () => {
  const [linkColor, setLinkColor] = React.useState<string>('blue');
  const [linkFont, setLinkFont] = React.useState<string>('Ariel');
  const [linkFontSize, setLinkFontSize] = React.useState<number>(12);
  // const [linkFontStyle, setLinkFontStyle] = React.useState<string >('normal');
  // const [linkAlign, setLinkAlign] = React.useState<string>('auto');
  // const [linkDecorationLine, setLinkDecorationLine] = React.useState<string>('none');
  const [linkVariant, setLinkVariant] = React.useState<keyof Typography['variants']>('body2');
  const [linkText, setLinkText] = React.useState<string>('Click to Navigate');
  const [linkUrl, setLinkUrl] = React.useState<string>('https://www.bing.com/');

  const CustomLink = React.useMemo(() => {
    const tokens: LinkTokens = {
      color: linkColor,
      fontFamily: linkFont,
      fontSize: linkFontSize,
      variant: linkVariant
    };
    return Link.customize(tokens);
  },
  [linkColor,
    linkFont,
    linkFontSize,
    // linkFontStyle,
    // linkAlign,
    // linkDecorationLine,
    linkVariant,
    linkText,
    linkUrl
  ]);


  return (
    <View style={styles.tokensColumn}>
      <View style={styles.tokensRow}>
        <View>
          <Text>Track Tokens</Text>
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
          <TextInput
            accessibilityLabel="Link font variant"
            style={commonStyles.textBox}
            placeholder="Link font variant"
            blurOnSubmit={true}
            onSubmitEditing={(e) => {
              setLinkVariant(e.nativeEvent.text as keyof Typography['variants']);
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
      <CustomLink url={linkUrl}>{linkText}</CustomLink>
    </View>
  );
};

const linkSections: TestSection[] = [
  {
    name: 'Default Links',
    testID: EXPERIMENTAL_LINK_TESTPAGE,
    component: DefaultLinks,
  },
  {
    name: 'Inline Links',
    component: InlineLinks,
  },
  {
    name: 'Subtle Links',
    component: SubtleLinks,
  },
  {
    name: 'Custom Link',
    component: CustomLinks,
  },
  {
    name: 'Link E2E Test',
    component: LinkE2ETest,
  },
];

export const ExperimentalLinkTest: React.FunctionComponent = () => {
  const status: PlatformStatus = {
    win32Status: 'Beta',
    uwpStatus: 'Experimental',
    iosStatus: 'Experimental',
    macosStatus: 'Beta',
    androidStatus: 'Backlog',
  };

  const description =
    'With a Link, users can navigate to another page, window, or Help topic; display a definition; initiate a command; or choose an option. A Link indicates that it can be clicked, typically by being displayed using the visited or unvisited link system colors. Traditionally, Links are underlined as well, but that approach is often unnecessary and falling out of favor to reduce visual clutter.\n\nA Link is the lightest weight clickable control, and is often used to reduce the visual complexity of a design.';

  return <Test name="Link Test" description={description} sections={linkSections} status={status}></Test>;
};
