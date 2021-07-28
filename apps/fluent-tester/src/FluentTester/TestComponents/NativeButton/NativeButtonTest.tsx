import { NativeButton } from '@fluentui-react-native/experimental-native-button';
import { NATIVEBUTTON_TESTPAGE } from './consts';
import * as React from 'react';
import { ImageURISource } from 'react-native';
import { Stack } from '@fluentui-react-native/stack';
import { stackStyle } from '../Common/styles';
import { PlatformStatus, Test, TestSection } from '../Test';

const icon: ImageURISource = {
  uri:
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAACTUlEQVRIib3VzYuPURQH8M8MhVIzWYghLFhQZrxL3rIYG4psyKiZbEmzUl7+BbOwpsZbWciG5B/QTMxEaCYGIxEpGoxGTYzFPeP3zOP+/Gw4dbvPc+73nHvP+Z57Lv9YplXRz8FxtKERT/C9hJmBgziKNXiEsbKj+ozzOtzEXNzBHjxEawGzE4+xD/ewMGzqasdEMwZK4F34gCMxXmNH6VADWPk3GxzAlYx+KSZiLMqsX8H+sjKXoh9V9BsxHmNLZr0+bGvKNvSUdGulFK0tfK8pYXqxtewsR8psfMEhKS3rJQ7gZcxLYr6BfjzD5bD9Wu3kjVJp9kt5HsMZjOIF1pXGMN4E5lvY9IePhrLzDrzFOSm/p3FRSscI5heimx3fTXiPxbiEU2F7Pny1Tzo/jKdYXtiwCZ9xFydC16lCcmfoTuJ2YJsK9iswFL4NoSWTstEIe2acelylTMdDNzP+RzL2LXhaH4Ac2RMZXTXJlecvnx1SFCsKiwvwSSq9Wim6Fdhyip4p8NCOd+jGdonkbonkonGO5EW4IJG8PeymkDwpDVKJ9amUaZdU18Oql2lXYCfCdkqZ/umi7Ve5aHtjbSjmZTFfl2r/Oa6qcdEmJdcqVuNjbLYhvleVMNlWMT2zwTyVljAp96U23Rv/bXhQwgyHbc0NqnXFHpUu25dZr9aFf5NmDJrKT6sUVZvUBN+qNECBHZR5cHIk10lP5RMpJbulW7mvcPJ1uCal7qbETTM2K13Qam/oHByTarxHasXlB31WRLMJr3BWIv//yk9uvpglkfrWQwAAAABJRU5ErkJggg==',
};

const nativeButton: React.FunctionComponent = () => {
  const CustomNativeButton = NativeButton.customize({
    accentColor: '#fca905',
  });
  return (
    <Stack style={stackStyle}>
      <NativeButton
        title="Primary"
        image={icon}
        buttonStyle="primary"
        toolTip="Native Tooltip"
        onPress={() => alert('Primary button clicked!')}
      />
      <NativeButton title="Secondary" buttonStyle="secondary" image={icon} onPress={() => alert('Secondary button clicked! ')} />
      <NativeButton title="Borderless" buttonStyle="borderless" image={icon} onPress={() => alert('Borderless button clicked!')} />
      <NativeButton title="Acrylic" buttonStyle="acrylic" onPress={() => alert('Acrylic button clicked!')} />
      <CustomNativeButton
        title="Custom Button"
        buttonStyle="primary"
        image={icon}
        isImageTinted={false}
        onPress={() => alert('Custom button clicked!')}
      />
      <NativeButton title="Primary disabled" buttonStyle="primary" enabled={false} />
      <NativeButton image={icon} buttonStyle="acrylic" onPress={() => alert('Icon button clicked!')} />
    </Stack>
  );
};

const nativeButtonSections: TestSection[] = [
  {
    name: 'Native Button',
    testID: NATIVEBUTTON_TESTPAGE,
    component: nativeButton,
  },
];

export const NativeButtonTest: React.FunctionComponent = () => {
  const status: PlatformStatus = {
    win32Status: 'N/A',
    uwpStatus: 'N/A',
    iosStatus: 'Experimental',
    macosStatus: 'Experimental',
    androidStatus: 'N/A',
  };

  const description =
    'Native button follows the Fluent design and provides the native feel and look to a button. \n\nThere are a few functionalities that are supprted on macOS only, like customizing button accent color and additional button styles, these additional features will be no opt in iOS.';

  return <Test name="Native Button Test" description={description} sections={nativeButtonSections} status={status}></Test>;
};
