# Separator

## Horizontal Example

```
import { ISeparator, Separator, Stack, Text } from '@fluentui/react-native';

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
      };
```

## Vertical Example

```
import { ISeparator, Separator, Stack } from '@fluentui/react-native';

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
};
```
