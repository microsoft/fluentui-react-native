import * as React from 'react';
import { Stack, Text } from 'office-ui-fabric-react';
import { DocPagePropsFactory, Resolver } from '../../DocPageProps';
import * as dedent from 'dedent';

export const GetWin32DocPageProps: DocPagePropsFactory = (load: Resolver) => ({
  title: 'Link',
  componentUrl: '',
  componentName: 'LinkExample',
  allowNativeProps: false,
  // overview: load('./docs/LinkOverview.md'),
  // dos: load('./docs/LinkDos.md'),
  // donts: load('./docs/LinkDonts.md'),
  isHeaderVisible: true,
  isFeedbackVisible: false,
  examples: [
    {
      title: 'Link',
      code: dedent`
      import * as React from 'react';
      import * as ReactNative from 'react-native';
      import { Stack } from '../components';
      import { Link } from '../components/Link/Link.win32';
      import { stackStyle } from './TesterStyles';

      export const LinkTest: React.FunctionComponent<{}> = () => {
        const doPress = () => {
          ReactNative.Alert.alert('Alert.', 'You have been alerted.');
        };
        return (
          <Stack style={stackStyle}>
            <Link url="https://www.bing.com/" content="Click to open the URL." />
            <Link onPress={doPress} content="Click to activate the onPress event." />
            <Link url="https://www.google.com/" content="This link is disabled." disabled />
          </Stack>
        );
      };`,
      view: (
        <Stack>
          <Text>{'<< Image of Link w/ states goes here>>'}</Text>
        </Stack>
      )
    }
  ],
  propertiesTablesSources: [load('./Link.types.ts')]
});
