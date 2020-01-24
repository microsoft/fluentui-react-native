import * as React from 'react';
import { Separator, Stack, Text } from 'office-ui-fabric-react';
import { DocPagePropsFactory, Resolver } from '../../DocPageProps';
import * as dedent from 'dedent';

export const GetWin32DocPageProps: DocPagePropsFactory = (load: Resolver) => ({
  title: 'Separator',
  componentUrl: '',
  componentName: 'Separator',
  allowNativeProps: false,
  overview:
    'A separator visually separates content into groups. You can render content in the separator by specifying ' +
    "the component's children. The component's children can be plain text or a component like Icon." +
    'The content is center-aligned by default.',
  isHeaderVisible: true,
  isFeedbackVisible: false,
  examples: [
    {
      title: 'Simple Separator Example',
      code: dedent`
      import { ISeparator, Separator, Stack, Text } from 'react-native-uifabric';

      const stackStyle: IStackProps['style'] = {
        borderWidth: 1,
        borderColor: '#bdbdbd',
        padding: 8,
        margin: 8
      };

      export const SeparatorExample: React.FunctionComponent<{}> = props => {
        return (
          <Stack style={ stackStyle } gap={ 5 }>
            <Text>This is a text element</Text>
            <Separator />
            <Text>This is a longer text element</Text>
          </Stack>
        );
      };`,
      view: (
        <Stack
          style={{
            borderWidth: 1,
            borderColor: '#bdbdbd',
            padding: 8,
            margin: 8
          }}
          gap={5}
        >
          <Text>This is a text element</Text>
          <Separator />
          <Text>This is a longer text element</Text>
        </Stack>
      )
    },
    {
      title: 'Vertical Separator Example',
      code: dedent`
      import { ISeparator, Separator, Stack } from 'react-native-uifabric';

      const separatorStackStyle: IStackProps['style'] = {
        height: 200,
        flexDirection: 'row',
        justifyContent: 'space-evenly'
      };

      export const SeparatorExample: React.FunctionComponent<{}> = props => {
        return (
          <Stack gap={ 4 } style={ separatorStackStyle }>
            <Text>Text 1</Text>
            <Separator color="blue" vertical />
            <Text>Text 2</Text>
            <Separator color="red" vertical />
            <Text>Text 3</Text>
          </Stack>
        );
      };`,
      view: (
        <Stack
          style={{
            height: 200,
            flexDirection: 'row',
            justifyContent: 'space-evenly'
          }}
          gap={4}
        >
          <Text>Text 1</Text>
          <Separator color="blue" vertical />
          <Text>Text 2</Text>
          <Separator color="red" vertical />
          <Text>Text 3</Text>
        </Stack>
      )
    }
  ],
  propertiesTablesSources: [load('./Separator.types.ts')]
});
