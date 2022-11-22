import { Button, FAB } from '@fluentui-react-native/experimental-button';
import * as React from 'react';
import { View } from 'react-native';
import { commonTestStyles, testContentRootViewStyle } from '../Common/styles';
import { iconProps } from '../Common/iconExamples';

export const ButtonVariantTest: React.FunctionComponent = () => {
  const [showFABText, setShowFABText] = React.useState(true);
  const flipFABcontent = React.useCallback(() => setShowFABText(!showFABText), [showFABText]);

  return (
    <View style={testContentRootViewStyle}>
      <Button style={commonTestStyles.vmargin}>Default</Button>
      <Button disabled style={commonTestStyles.vmargin}>
        Default Disabled
      </Button>
      <Button appearance="accent" style={commonTestStyles.vmargin}>
        Accent
      </Button>
      <Button disabled appearance="accent" style={commonTestStyles.vmargin}>
        Accent Disabled
      </Button>
      <Button appearance="outline" style={commonTestStyles.vmargin}>
        Outline
      </Button>
      <Button appearance="outline" disabled style={commonTestStyles.vmargin}>
        Outline Disabled
      </Button>
      <Button appearance="subtle" style={commonTestStyles.vmargin}>
        Subtle
      </Button>
      <Button appearance="subtle" disabled style={commonTestStyles.vmargin}>
        Subtle Disabled
      </Button>
      <FAB icon={iconProps} iconOnly disabled style={commonTestStyles.vmargin} />
      <FAB icon={iconProps} style={commonTestStyles.vmargin} showContent={showFABText} onClick={flipFABcontent}>
        Click Me!
      </FAB>
      <FAB appearance="subtle" iconOnly disabled icon={iconProps} style={commonTestStyles.vmargin} />
      <FAB appearance="subtle" icon={iconProps} style={commonTestStyles.vmargin} showContent={showFABText} onClick={flipFABcontent}>
        Click Me!
      </FAB>
    </View>
  );
};
