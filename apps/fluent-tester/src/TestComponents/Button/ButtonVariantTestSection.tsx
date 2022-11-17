import { Button, CompoundButton, FAB } from '@fluentui-react-native/experimental-button';
import * as React from 'react';
import { Platform, View } from 'react-native';
import { commonTestStyles, testContentRootViewStyle } from '../Common/styles';
import { SvgIconProps } from '@fluentui-react-native/icon';
import TestSvg from './test.svg';

// Test also pulls button from deprecated package to ensure it's still working
export const ButtonVariantTest: React.FunctionComponent = () => {
  const svgProps: SvgIconProps = {
    src: TestSvg,
    viewBox: '0 0 500 500',
  };
  const iconProps = { svgSource: svgProps, width: 20, height: 20 };

  const [showFABText, setShowFABText] = React.useState(true);
  const flipFABcontent = React.useCallback(() => setShowFABText(!showFABText), [showFABText]);

  const isMobile = ['android', 'ios'].includes(Platform.OS as string);
  const platfromSpecificNaming = isMobile ? 'Accent' : 'Primary';

  return (
    <View style={testContentRootViewStyle}>
      <Button style={commonTestStyles.vmargin}>Default</Button>
      <Button disabled style={commonTestStyles.vmargin}>
        Default Disabled
      </Button>
      <Button appearance="primary" style={commonTestStyles.vmargin}>
        {platfromSpecificNaming}
      </Button>
      <Button disabled appearance="primary" style={commonTestStyles.vmargin}>
        {`${platfromSpecificNaming} Disabled`}
      </Button>
      {isMobile && (
        <>
          <Button appearance="outline" style={commonTestStyles.vmargin}>
            Outline
          </Button>
        </>
      )}
      <Button appearance="subtle" style={commonTestStyles.vmargin}>
        Subtle
      </Button>
      <Button loading>Loading Button</Button>
      <Button block style={commonTestStyles.vmargin}>
        Block
      </Button>
      <Button appearance="primary" block style={commonTestStyles.vmargin}>
        {`Block ${platfromSpecificNaming}`}
      </Button>
      <Button appearance="subtle" block style={commonTestStyles.vmargin}>
        Block Subtle
      </Button>
      <CompoundButton secondaryContent="Compound" style={commonTestStyles.vmargin}>
        Default
      </CompoundButton>
      <CompoundButton appearance="primary" secondaryContent="Compound" style={commonTestStyles.vmargin}>
        {platfromSpecificNaming}
      </CompoundButton>
      <CompoundButton appearance="subtle" secondaryContent="Compound" style={commonTestStyles.vmargin}>
        Subtle
      </CompoundButton>
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
