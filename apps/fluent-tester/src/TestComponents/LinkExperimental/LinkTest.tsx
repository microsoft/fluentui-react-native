import * as React from 'react';
import { Alert, View, StyleSheet, Text, TextInput} from 'react-native';
import { Link, LinkTokens } from '@fluentui-react-native/experimental-link';
import { Stack } from '@fluentui-react-native/stack';
import { stackStyle, commonTestStyles as commonStyles } from '../Common/styles';
import { EXPERIMENTAL_LINK_TESTPAGE } from './consts';
import { Test, TestSection, PlatformStatus } from '../Test';
import { LinkE2ETest } from './E2ELinkTest';

const DefaultLinks: React.FunctionComponent = () => {
  const doPress = (): void => {
    Alert.alert('Alert.', 'You have been alerted.');
  };

  const doAllyTap = (): void => {
    Alert.alert('Alert.', 'You have invoked onAllyTap.');
  };

  return (
    <Stack style={stackStyle}>
      <Link tooltip={"https://www.bing.com/"} url="https://www.bing.com/">Click to navigate.</Link>
      <Link onPress={doPress} onAccessibilityTap={doAllyTap}>Click to alert.</Link>
      <Link disabled focusable>Disabled focusable Link</Link>
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
      <Text>Click <Link inline onPress={doPress} onAccessibilityTap={doAllyTap}>this link</Link> to alert me.</Text>
      <Text>This <Link inline onPress={doPress} disabled focusable>link</Link> is disabled but focusable.</Text>
      <Text>Follow this <Link inline url="https://www.bing.com/">link</Link> to navigate.</Text>
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
      <Text>This is inline Link. <Link appearance='subtle' inline onPress={doPress} onAccessibilityTap={doAllyTap}>Click to alert.</Link></Text>
      <Link appearance='subtle' onPress={doPress} disabled>Disabled Link</Link>
    </Stack>
  );
};

const SelectableLinks: React.FunctionComponent = () => {
  /*const doPress = (): void => {
    Alert.alert('Alert.', 'You have been alerted.');
  };

  const doAllyTap = (): void => {
    Alert.alert('Alert.', 'You have invoked onAllyTap.');
  };*/

  return (
    <Stack style={stackStyle}>
      {/*<Link selectable tooltip={"https://www.bing.com/"} url="https://www.bing.com/">Click to navigate.</Link>
      <Link selectable onPress={doPress} onAccessibilityTap={doAllyTap}>Click to alert.</Link>
      <Link selectable disabled focusable>Disabled focusable selectable Link</Link>
      <Text selectable>Click <Link inline onPress={doPress} onAccessibilityTap={doAllyTap}>this link</Link> to alert me.</Text>*/}
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
  },
  [linkColor,
    linkFont,
    linkFontSize,
    linkText,
    linkUrl
  ]);


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
      <CustomLink align='end' url={linkUrl}>{linkText}</CustomLink>
      <BlueHeaderBold>BlueHeaderBold</BlueHeaderBold>
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
    name: 'Selectable Link',
    component: SelectableLinks,
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
