import * as React from 'react';
import { Platform, StyleSheet, Switch, View } from 'react-native';

import { Link, Separator, Text, ToggleButton } from '@fluentui/react-native';
import { ButtonV1 as Button } from '@fluentui-react-native/button';
import { E2E_MODE_SWITCH, E2E_TEST_SECTION } from '@fluentui-react-native/e2e-testing';
import type { SvgIconProps } from '@fluentui-react-native/icon';
import { Stack } from '@fluentui-react-native/stack';
import { useTheme } from '@fluentui-react-native/theme-types';
import type { SvgProps } from 'react-native-svg';
import Svg, { G, Path } from 'react-native-svg';

import { stackStyle } from './Common/styles';
import { testProps } from './Common/TestProps';

export type TestSection = {
  name: string;
  testID?: string;
  component: React.FunctionComponent;
} | null;

export type Status = 'Production' | 'Beta' | 'Experimental' | 'Backlog' | 'N/A' | 'Deprecated';
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
  spec?: string;
  status: PlatformStatus;
  sections: TestSection[];
  e2eSections?: TestSection[];
}

const definitions = {
  Production: 'Control is ready for broad partner use and to be used in production-ready scenarios.',
  Beta: 'Control is ready for partner consumption, but not ready for production release (e.g. fixing bugs).',
  Experimental: 'Control code checked into repo, but not ready for partner use.',
  Backlog: 'Control is in plan and on our backlog to deliver.',
  'N/A': 'Control is not in current plan.',
  Deprecated: 'Control is being deprecated.',
};

const styles = StyleSheet.create({
  name: {
    marginTop: 4,
    flex: Platform.select({ ios: 0, android: 0, default: 1 }),
  },
  definitionHeader: {
    marginTop: 12,
    marginBottom: 6,
  },
  description: {
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  // This button is only for our E2E testing framework. We want to be able to put keyboard focus in any test page if we need it.
  // This button will be at the top of every test page and allows us to do that. But we don't want partners to see it.
  e2eFocusButton: {
    opacity: 0,
  },
  e2eSection: {
    marginBottom: 4,
  },
  e2eSwitch: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  e2eSwitchLabel: {
    marginRight: 4,
    textAlignVertical: 'center',
  },
});

export const Test = (props: TestProps): React.ReactElement<Record<string, never>> => {
  const [showStatus, setShowStatus] = React.useState(false);
  const [showE2E, setShowE2E] = React.useState(false);

  const toggleSvg: React.FunctionComponent<SvgProps> = () => {
    const plusPath =
      'M6.5 1.75C6.5 1.33579 6.16421 1 5.75 1C5.33579 1 5 1.33579 5 1.75V5H1.75C1.33579 5 1 5.33579 1 5.75C1 6.16421 1.33579 6.5 1.75 6.5H5V9.75C5 10.1642 5.33579 10.5 5.75 10.5C6.16421 10.5 6.5 10.1642 6.5 9.75V6.5H9.75C10.1642 6.5 10.5 6.16421 10.5 5.75C10.5 5.33579 10.1642 5 9.75 5H6.5V1.75Z';
    const minusPath = 'M2.75 5.25h6.5s0.75 0 0.75 0.75v0s0 0.75 -0.75 0.75h-6.5s-0.75 0 -0.75 -0.75v0s0 -0.75 0.75 -0.75';

    const path = showStatus ? minusPath : plusPath;
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

  const theme = useTheme();
  const fontFamily = theme.typography.families.primary;

  const plusCodepoint = 0x2795;
  const minusCodepoint = 0x2796;
  const fontIconProps = {
    fontFamily: fontFamily,
    codepoint: showStatus ? minusCodepoint : plusCodepoint,
    fontSize: 10,
  };

  const toggleIconProps = Platform.OS === 'windows' ? { fontSource: fontIconProps } : { svgSource: svgProps, width: 12, height: 12 };
  const { e2eSections } = props;

  const isMobile = Platform.OS === 'ios' || Platform.OS === 'android';

  return (
    <View>
      <View style={styles.header}>
        <Text style={styles.name} variant="heroSemibold">
          {props.name}
        </Text>
        {!isMobile && (
          <Button
            /* For Android E2E testing purposes, testProps must be passed in after accessibilityLabel. */
            {...testProps('Focus_Button')}
            style={styles.e2eFocusButton}
          >
            E2E Button
          </Button>
        )}
        {props.e2eSections && (
          <View style={styles.e2eSwitch}>
            <Text style={styles.e2eSwitchLabel} {...(isMobile ? {} : { variant: 'body1Strong' })}>
              E2E Mode
            </Text>
            <Switch onValueChange={setShowE2E} value={showE2E} {...testProps(E2E_MODE_SWITCH)} />
          </View>
        )}
        {props.spec && <Link url={props.spec} content="SPEC" />}
      </View>
      <Separator />
      {e2eSections && showE2E && (
        // We can check if the E2E section renders by checking if the "E2E Tests" header has rendered for each spec
        <>
          <Text variant="headerSemibold" {...testProps(E2E_TEST_SECTION)}>
            E2E Tests
          </Text>
          {e2eSections.map((section, i) => {
            if (section === null) {
              return null;
            }
            const { component: E2EComponent } = section;
            return <E2EComponent key={i} />;
          })}
        </>
      )}
      <Stack style={stackStyle}>
        <Text style={styles.description}>{props.description}</Text>
      </Stack>
      <Stack style={stackStyle}>
        <View style={styles.statusView}>
          <Text variant="headerStandard">Platform Status</Text>
          <ToggleButton iconOnly={true} icon={toggleIconProps} onClick={() => setShowStatus(!showStatus)} />
        </View>
        {showStatus && (
          <>
            <Text style={styles.statusLabel} variant="bodySemibold">
              Win32: <Text style={styles.status}>{props.status.win32Status}</Text>
            </Text>
            <Text style={styles.statusLabel} variant="bodySemibold">
              UWP: <Text style={styles.status}>{props.status.uwpStatus}</Text>
            </Text>
            <Text style={styles.statusLabel} variant="bodySemibold">
              iOS: <Text style={styles.status}>{props.status.iosStatus}</Text>
            </Text>
            <Text style={styles.statusLabel} variant="bodySemibold">
              macOS: <Text style={styles.status}>{props.status.macosStatus}</Text>
            </Text>
            <Text style={styles.statusLabel} variant="bodySemibold">
              Android: <Text style={styles.status}>{props.status.androidStatus}</Text>
            </Text>

            <Text style={styles.definitionHeader} variant="headerStandard">
              Status Definitions
            </Text>
            {Object.entries(definitions).map(([key, value]) => {
              return (
                <Text style={styles.statusLabel} variant="bodySemibold" key={key}>
                  {key}: <Text style={styles.status}>{value}</Text>
                </Text>
              );
            })}
          </>
        )}
      </Stack>
      {props.sections.map((section, index) => {
        if (section == null) {
          return <></>;
        }

        const TestComponent = section.component;
        return (
          <View key={index}>
            <Text
              style={styles.section}
              variant="headerSemibold"
              /* For Android E2E testing purposes, testProps must be passed in after accessibilityLabel. */
              {...testProps(section.testID)}
            >
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
