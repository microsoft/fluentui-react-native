import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, ToggleButton, Separator } from '@fluentui/react-native';
import { Stack } from '@fluentui-react-native/stack';
import { stackStyle } from './Common/styles';
import { useTheme } from '@fluentui-react-native/theme-types';

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

const definitions = {
  Production: 'Control is ready for broad partner use and to be used in production-ready scenarios.',
  Beta: 'Control is ready for partner consumption, but not ready for production release (e.g. fixing bugs).',
  Experimental: 'Control code checked into repo, but not ready for partner use.',
  Backlog: 'Control is in plan and on our backlog to deliver.',
  'N/A': 'Control is not in current plan.',
};

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
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusLabel: {
    marginTop: 2,
    marginStart: 4,
  },
  status: {
    fontWeight: 'normal',
  },
});

export const Test = (props: TestProps): React.ReactElement<Record<string, never>> => {
  const [showStatus, setShowStatus] = React.useState(false);
  const theme = useTheme();
  const fontFamily = theme.typography.families.primary;

  const plusCodepoint = 0x2795;
  const minusCodepoint = 0x2796;
  const fontIconProps = {
    fontFamily: fontFamily,
    codepoint: showStatus ? minusCodepoint : plusCodepoint,
    fontSize: 10,
  };

  return (
    <View testID="ScrollViewAreaForComponents">
      <Text style={[styles.name]} variant="heroSemibold">
        {props.name}
      </Text>
      <Separator />
      <Stack style={stackStyle}>
        <Text style={styles.description}>{props.description}</Text>
      </Stack>
      <Stack style={stackStyle}>
        <View style={styles.statusView}>
          <Text variant="headerStandard">Platform Status</Text>
          <ToggleButton iconOnly={true} icon={{ fontSource: fontIconProps }} onClick={() => setShowStatus(!showStatus)} />
        </View>
        {showStatus && (
          <View>
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
            {Object.entries(definitions).map(([key, value]) => {
              return (
                <Text style={[styles.statusLabel]} variant="bodySemibold" key={key}>
                  {key}: <Text style={styles.status}>{value}</Text>
                </Text>
              );
            })}
          </View>
        )}
      </Stack>
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
