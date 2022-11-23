import { ButtonV1 as Button, CompoundButton, FAB } from '@fluentui/react-native';
import * as React from 'react';
import { Platform, View } from 'react-native';
import { commonTestStyles, testContentRootViewStyle } from '../Common/styles';
import { iconProps } from '../Common/iconExamples';

export const ButtonSizeTest: React.FunctionComponent = () => {
  const svgIconsEnabled = ['ios', 'macos', 'win32', 'android'].includes(Platform.OS as string);

  return (
    <View style={testContentRootViewStyle}>
      {svgIconsEnabled && (
        <>
          <Button
            iconOnly
            size="small"
            icon={iconProps}
            accessibilityLabel="Small size button with accessibility icon"
            style={commonTestStyles.vmargin}
            tooltip="button tooltip"
          />
          <Button
            iconOnly
            size="medium"
            icon={iconProps}
            accessibilityLabel="Medium size button with accessibility icon"
            style={commonTestStyles.vmargin}
          />
          <Button
            iconOnly
            size="large"
            icon={iconProps}
            accessibilityLabel="Large size button with accessibility icon"
            style={commonTestStyles.vmargin}
          />
          <Button size="small" icon={iconProps} style={commonTestStyles.vmargin}>
            Small Button with icon
          </Button>
          <Button size="medium" icon={iconProps} style={commonTestStyles.vmargin}>
            Medium Button with icon
          </Button>
          <Button size="large" icon={iconProps} style={commonTestStyles.vmargin}>
            Large Button with icon
          </Button>
          <FAB size="small" icon={iconProps} style={commonTestStyles.vmargin}>
            Small FAB
          </FAB>
          <FAB size="large" icon={iconProps} style={commonTestStyles.vmargin}>
            Large FAB
          </FAB>
        </>
      )}
      <Button size="small" style={commonTestStyles.vmargin}>
        Small
      </Button>
      <Button size="medium" style={commonTestStyles.vmargin}>
        Medium
      </Button>
      <Button size="large" style={commonTestStyles.vmargin}>
        Large
      </Button>
      {Platform.OS !== 'android' && (
        <>
          <Button loading size="small" style={commonTestStyles.vmargin}>
            Loading Button Small
          </Button>
          <Button loading size="medium" style={commonTestStyles.vmargin}>
            Loading Button Medium
          </Button>
          <Button loading size="large" style={commonTestStyles.vmargin}>
            Loading Button Large
          </Button>
          <CompoundButton secondaryContent="Small compound button" size="small" style={commonTestStyles.vmargin}>
            Compound Button
          </CompoundButton>
          <CompoundButton secondaryContent="Medium compound button" size="medium" style={commonTestStyles.vmargin}>
            Compound Button
          </CompoundButton>
          <CompoundButton secondaryContent="Large compound button" size="large" style={commonTestStyles.vmargin}>
            Compound Button
          </CompoundButton>
          {svgIconsEnabled && (
            <>
              <CompoundButton icon={iconProps} secondaryContent="SecondaryContent" size="small" style={commonTestStyles.vmargin}>
                Content
              </CompoundButton>
              <CompoundButton icon={iconProps} secondaryContent="SecondaryContent" size="medium" style={commonTestStyles.vmargin}>
                Content
              </CompoundButton>
              <CompoundButton icon={iconProps} secondaryContent="SecondaryContent" size="large" style={commonTestStyles.vmargin}>
                Content
              </CompoundButton>
            </>
          )}
        </>
      )}
    </View>
  );
};
