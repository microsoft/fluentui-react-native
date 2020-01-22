import * as React from 'react';
import { FocusTrapZone, Stack, DefaultButton } from 'office-ui-fabric-react';
import { DocPagePropsFactory, Resolver } from '../../DocPageProps';
import * as dedent from 'dedent';

export const GetWin32DocPageProps: DocPagePropsFactory = (load: Resolver) => ({
  title: 'FocusTrapZone',
  componentUrl: '',
  componentName: 'FocusTrapZone',
  allowNativeProps: false,
  overview:
    'FocusTrapZone is used to trap focus in any Component tree. Pressing tab will circle focus within the inner focusable elements of ' +
    'FocusTrapZone.',
  isHeaderVisible: true,
  isFeedbackVisible: false,
  examples: [
    {
      title: 'Simple FocusTrapZone Example',
      code: dedent`
      import { IFocusTrapZoneProps, FocusTrapZone, Button } from 'react-native-uifabric';

      const activeTrapZoneStyle: IFocusTrapZoneProps['style'] = {
        borderWidth: 2,
        borderColor: '#ababab',
        borderStyle: 'solid',
        padding: 10
      }

      export const FocusTrapZoneExample: React.FunctionComponent<{}> = props => {
        return (
          <FocusTrapZone style={activeTrapZoneStyle}>
            <Button content="Button 1" />
            <Button content="Button 2" />
            <Button content="Button 3" />
          </FocusTrapZone>
        );
      };`,
      view: (
        <Stack
          styles={{
            root: { border: `2px solid #ababab`, padding: 10 }
          }}
        >
          <FocusTrapZone forceFocusInsideTrap={false} isClickableOutsideFocusTrap>
            <DefaultButton text="Button 1" />
            <DefaultButton text="Button 2" />
            <DefaultButton text="Button 3" />
          </FocusTrapZone>
        </Stack>
      )
    }
  ],
  propertiesTablesSources: [load('./FocusTrapZone.types.ts')]
});
