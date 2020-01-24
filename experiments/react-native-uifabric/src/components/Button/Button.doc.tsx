import * as React from 'react';
import { Stack, Text, Image } from 'office-ui-fabric-react';
import { DocPagePropsFactory, Resolver } from '../../DocPageProps';
import * as dedent from 'dedent';

export const GetWin32DocPageProps: DocPagePropsFactory = (load: Resolver, getUrl: Resolver) => ({
  title: 'Button',
  componentUrl: '',
  componentName: 'ButtonExample',
  allowNativeProps: false,
  // overview: load('./docs/ButtonOverview.md'),
  // dos: load('./docs/ButtonDos.md'),
  // donts: load('./docs/ButtonDonts.md'),
  isHeaderVisible: true,
  isFeedbackVisible: false,
  examples: [
    {
      title: 'Button',
      code: dedent`
      import * as React from 'react';
      import { Button, View } from 'react-native-uifabric';

      export const ButtonExample: React.FunctionComponent<{}> = props => {
        return (
          <View>
            <Button content="Save" onClick={_alertClicked} />
          </View>
        );
      };

      function _alertClicked(): void {
        alert('Clicked');
      }`,
      view: (
        <Stack>
          <Text>{"<< Image of a 'Save' button goes here. In the mean time, you get Gandalf. >>"}</Text>
          <Image src={getUrl('./docs/ButtonExample.jpg')} />
        </Stack>
      )
    }
  ],
  propertiesTablesSources: [load('./Button.types.ts')]
});
