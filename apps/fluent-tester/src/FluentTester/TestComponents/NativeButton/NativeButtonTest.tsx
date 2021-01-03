import { NativeButton } from '@fluentui-react-native/experimental-native-button';
import { NATIVEBUTTON_TESTPAGE } from './consts';
import * as React from 'react';
import { ImageURISource, processColor } from 'react-native';
import { Stack } from '@fluentui-react-native/stack';
import { stackStyle } from '../Common/styles';
import { PlatformStatus, Test, TestSection } from '../Test';
const icon: ImageURISource = {
  uri:
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAACTUlEQVRIib3VzYuPURQH8M8MhVIzWYghLFhQZrxL3rIYG4psyKiZbEmzUl7+BbOwpsZbWciG5B/QTMxEaCYGIxEpGoxGTYzFPeP3zOP+/Gw4dbvPc+73nHvP+Z57Lv9YplXRz8FxtKERT/C9hJmBgziKNXiEsbKj+ozzOtzEXNzBHjxEawGzE4+xD/ewMGzqasdEMwZK4F34gCMxXmNH6VADWPk3GxzAlYx+KSZiLMqsX8H+sjKXoh9V9BsxHmNLZr0+bGvKNvSUdGulFK0tfK8pYXqxtewsR8psfMEhKS3rJQ7gZcxLYr6BfjzD5bD9Wu3kjVJp9kt5HsMZjOIF1pXGMN4E5lvY9IePhrLzDrzFOSm/p3FRSscI5heimx3fTXiPxbiEU2F7Pny1Tzo/jKdYXtiwCZ9xFydC16lCcmfoTuJ2YJsK9iswFL4NoSWTstEIe2acelylTMdDNzP+RzL2LXhaH4Ac2RMZXTXJlecvnx1SFCsKiwvwSSq9Wim6Fdhyip4p8NCOd+jGdonkbonkonGO5EW4IJG8PeymkDwpDVKJ9amUaZdU18Oql2lXYCfCdkqZ/umi7Ve5aHtjbSjmZTFfl2r/Oa6qcdEmJdcqVuNjbLYhvleVMNlWMT2zwTyVljAp96U23Rv/bXhQwgyHbc0NqnXFHpUu25dZr9aFf5NmDJrKT6sUVZvUBN+qNECBHZR5cHIk10lP5RMpJbulW7mvcPJ1uCal7qbETTM2K13Qam/oHByTarxHasXlB31WRLMJr3BWIv//yk9uvpglkfrWQwAAAABJRU5ErkJggg==',
};
export const nativeButtoniOS: React.FunctionComponent<{}> = () => {
  return (
    <Stack style={stackStyle}>
      <NativeButton
        title="Primary"
        buttonStyle="primary"
        style={{ width: 180, height: 35, marginBottom: 15 }}
        image={icon}
        onPress={() => alert('Primary button clicked!')}
      />
      <NativeButton
        title="Secondary disabled"
        buttonStyle="secondary"
        isEnabled={false}
        style={{ width: 230, height: 35, marginBottom: 15 }}
      />
      <NativeButton
        title="Borderless"
        buttonStyle="borderless"
        style={{ width: 150, height: 35, marginBottom: 15 }}
        onPress={() => alert('Borderless button clicked!')}
      />
    </Stack>
  );
};

export const nativeButtonMacOS: React.FunctionComponent<{}> = () => {
  const CustomNativeButton = NativeButton.customize({
    accentColor: processColor('orange'),
  });
  return (
    <Stack style={stackStyle}>
      <NativeButton
        title="Primary"
        buttonStyle="primary"
        style={{ width: 200, height: 30, marginBottom: 15 }}
        onPress={() => alert('Primary button clicked!')}
      />
      <NativeButton
        title="Secondary"
        buttonStyle="secondary"
        image={icon}
        imagePosition=".imageLeading"
        style={{ width: 200, height: 30, marginBottom: 15 }}
        onPress={() => alert('Secondary button clicked! ')}
      />
      <NativeButton
        title="Borderless"
        buttonStyle="borderless"
        style={{ width: 200, height: 30, marginBottom: 15 }}
        onPress={() => alert('Borderless button clicked!')}
      />
      <NativeButton
        title="Acrylic"
        buttonStyle="acrylic"
        style={{ width: 200, height: 30, marginBottom: 15 }}
        onPress={() => alert('Acrylic button clicked!')}
      />
      <CustomNativeButton
        title="Custom Button"
        buttonStyle="primary"
        image={icon}
        style={{ width: 200, height: 30, marginBottom: 15 }}
        onPress={() => alert('Custom button clicked!')}
      />
      <NativeButton title="Primary disabled" buttonStyle="primary" isEnabled={false} style={{ width: 200, height: 30, marginBottom: 15 }} />
    </Stack>
  );
};

const nativeButtonSections: TestSection[] = [
  {
    name: 'iOS Native Button',
    testID: NATIVEBUTTON_TESTPAGE,
    component: nativeButtoniOS,
  },
  {
    name: 'macOS Native Button',
    testID: NATIVEBUTTON_TESTPAGE,
    component: nativeButtonMacOS,
  },
];

export const NativeButtonTest: React.FunctionComponent<{}> = () => {
  const status: PlatformStatus = {
    win32Status: 'N/A',
    uwpStatus: 'N/A',
    iosStatus: 'Experimental',
    macosStatus: 'Experimental',
    androidStatus: 'N/A',
  };

  const description = 'Native button is awesome.';

  return <Test name="Native Button Test" description={description} sections={nativeButtonSections} status={status}></Test>;
};
