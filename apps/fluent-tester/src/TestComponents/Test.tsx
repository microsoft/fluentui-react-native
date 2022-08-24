import * as React from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { Text, ToggleButton, Separator, createIconProps } from '@fluentui/react-native';
import { Stack } from '@fluentui-react-native/stack';
import { stackStyle } from './Common/styles';
import Svg, { G, Path, SvgProps } from 'react-native-svg';
import { Icon, SvgIconProps } from '@fluentui-react-native/icon';

export type TestSection = {
  name: string;
  testID?: string;
  component: React.FunctionComponent;
};

export type Status = 'Production' | 'Beta' | 'Experimental' | 'Backlog' | 'N/A';
export type PlatformStatus = {
  win32Status: Status;
  uwpStatus: Status;
  iosStatus: Status;
  macosStatus: Status;
  androidStatus: Status;
};

export interface TestProps {
  name: string;
  description: string;
  status: PlatformStatus;
  sections: TestSection[];
}

const styles = StyleSheet.create({
  name: {
    marginTop: 4,
  },
  definitionHeader: {
    marginTop: 12,
    marginBottom: 6,
  },
  description: {
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  section: {
    marginTop: 12,
  },
  statusView: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  statusHeader: {
    marginBottom: 6,
  },
  statusLabel: {
    marginTop: 2,
    marginStart: 4,
  },
  status: {
    fontWeight: 'normal',
  },
});

// mobile platform check to not render status components.
const isMobile = Platform.OS == 'android' || (Platform.OS == 'ios' && !Platform.isPad);

export const Test = (props: TestProps): React.ReactElement<Record<string, never>> => {
  const [showStatus, setShowStatus] = React.useState(false);
  const toggleSvg: React.FunctionComponent<SvgProps> = () => {
    const path = showStatus
      ? 'M2.75 5.25h6.5s0.75 0 0.75 0.75v0s0 0.75 -0.75 0.75h-6.5s-0.75 0 -0.75 -0.75v0s0 -0.75 0.75 -0.75'
      : 'M6.5 1.75C6.5 1.33579 6.16421 1 5.75 1C5.33579 1 5 1.33579 5 1.75V5H1.75C1.33579 5 1 5.33579 1 5.75C1 6.16421 1.33579 6.5 1.75 6.5H5V9.75C5 10.1642 5.33579 10.5 5.75 10.5C6.16421 10.5 6.5 10.1642 6.5 9.75V6.5H9.75C10.1642 6.5 10.5 6.16421 10.5 5.75C10.5 5.33579 10.1642 5 9.75 5H6.5V1.75Z';
    return (
      <Svg>
        <G>
          <Path d={path} fill="black" />
        </G>
      </Svg>
    );
  };
  const svgProps: SvgIconProps = {
    src: toggleSvg,
  };
  const toggleIconProps = createIconProps({ svgSource: svgProps, width: 12, height: 12 });

  return (
    <View testID="ScrollViewAreaForComponents">
      <Text style={[styles.name]} variant="heroSemibold">
        {props.name}
      </Text>
      <Separator />
      <Stack style={stackStyle}>
        <Text style={styles.description}>{props.description}</Text>
      </Stack>
      <ToggleButton onClick={() => setShowStatus(!showStatus)} style={[styles.statusLabel]}>
        Platform Status <Icon {...toggleIconProps} />
      </ToggleButton>
      {!isMobile && showStatus && (
        <Stack style={stackStyle}>
          <Text style={[styles.statusHeader]} variant="headerStandard">
            Platform Status
          </Text>
          <Text style={[styles.statusLabel]} variant="bodySemibold">
            Win32: <Text style={styles.status}>{props.status.win32Status}</Text>
          </Text>
          <Text style={[styles.statusLabel]} variant="bodySemibold">
            UWP: <Text style={styles.status}>{props.status.uwpStatus}</Text>
          </Text>
          <Text style={[styles.statusLabel]} variant="bodySemibold">
            iOS: <Text style={styles.status}>{props.status.iosStatus}</Text>
          </Text>
          <Text style={[styles.statusLabel]} variant="bodySemibold">
            macOS: <Text style={styles.status}>{props.status.macosStatus}</Text>
          </Text>
          <Text style={[styles.statusLabel]} variant="bodySemibold">
            Android: <Text style={styles.status}>{props.status.androidStatus}</Text>
          </Text>

          <Text style={[styles.definitionHeader]} variant="headerStandard">
            Status Definitions
          </Text>
          <Text style={[styles.statusLabel]} variant="bodySemibold">
            Production:{' '}
            <Text style={styles.status}>Control is ready for broad partner use and to be used in production-ready scenarios.</Text>
          </Text>
          <Text style={[styles.statusLabel]} variant="bodySemibold">
            Beta:{' '}
            <Text style={styles.status}>
              Control is ready for partner consumption, but not ready for production release (e.g. fixing bugs).
            </Text>
          </Text>
          <Text style={[styles.statusLabel]} variant="bodySemibold">
            Experimental: <Text style={styles.status}>Control code checked into repo, but not ready for partner use.</Text>
          </Text>
          <Text style={[styles.statusLabel]} variant="bodySemibold">
            Backlog: <Text style={styles.status}>Control is in plan and on our backlog to deliver.</Text>
          </Text>
          <Text style={[styles.statusLabel]} variant="bodySemibold">
            N/A: <Text style={styles.status}>Control is not in current plan.</Text>
          </Text>
        </Stack>
      )}
      {props.sections.map((section, index) => {
        const TestComponent = section.component;
        return (
          <View key={index}>
            <Text style={[styles.section]} variant="headerSemibold" testID={section.testID}>
              {section.name}
            </Text>
            <Separator />
            <TestComponent />
          </View>
        );
      })}
    </View>
  );
};
