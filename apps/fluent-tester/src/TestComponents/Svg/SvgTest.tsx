import * as React from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { Separator } from '@fluentui/react-native';
import { Circle, Defs, G, Line, Path, Polygon, LinearGradient, RadialGradient, Rect, Stop, Svg, SvgUri, Use } from 'react-native-svg';
import TestSvg from './Assets/accessible-icon-brands.svg';
import { SVG_TESTPAGE } from './consts';
import { Test, TestSection, PlatformStatus } from '../Test';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faMugSaucer } from '@fortawesome/free-solid-svg-icons/faMugSaucer';
import { faSquareCheck } from '@fortawesome/free-solid-svg-icons/faSquareCheck';
import { faMugHot } from '@fortawesome/free-solid-svg-icons/faMugHot';
import { faMountainCity } from '@fortawesome/free-solid-svg-icons/faMountainCity';

const styles = StyleSheet.create({
  svg: {
    backgroundColor: 'green',
    color: 'purple',
  },
});

const FontAwesomeTest: React.FunctionComponent = () => {
  return (
    <React.Fragment>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <FontAwesomeIcon icon={faMugSaucer} color={'blue'} size={64} />
        <FontAwesomeIcon icon={faSquareCheck} color={'blue'} size={64} />
        <FontAwesomeIcon icon={faMugHot} color={'orange'} size={64} />
        <FontAwesomeIcon icon={faMountainCity} color={'orange'} size={64} />
      </View>
    </React.Fragment>
  );
};

const RectTest: React.FunctionComponent = () => {
  const [useColorA, setUseColorA] = React.useState(false);
  const colorA = 'red';
  const colorB = 'green';

  return (
    <React.Fragment>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Switch
          value={useColorA}
          onValueChange={(value) => {
            setUseColorA(value);
          }}
        />
        <Text>Change Color</Text>
      </View>
      <Separator />
      <Svg width="50" height="50">
        <Rect x="10" y="10" width="20" height="20" fill={useColorA ? colorA : colorB} stroke="black" />
      </Svg>
    </React.Fragment>
  );
};

const CircleTest: React.FunctionComponent = () => {
  return (
    <Svg width="50" height="50">
      <Circle cx="25" cy="25" r="20" fill="red" stroke="black" />
    </Svg>
  );
};

const LineTest: React.FunctionComponent = () => {
  return (
    <Svg width="50" height="50">
      <Line x1="10" y1="10" x2="20" y2="20" fill="red" stroke="black" />
    </Svg>
  );
};

const PathTest: React.FunctionComponent = () => {
  return (
    <Svg width="100" height="100">
      <Path d="M 0 0 A 10 10 0 0,1 0 100" fill="magenta" stroke="purple" id="path" />
    </Svg>
  );
};

const PolygonTest: React.FunctionComponent = () => {
  return (
    <Svg height="100" width="100">
      <Polygon points="40,5 70,80 25,95" fill="lime" stroke="purple" strokeWidth="1" />
    </Svg>
  );
};

const LinearGradientTest: React.FunctionComponent = () => {
  return (
    <Svg height="100" width="100" style={{ backgroundColor: 'black' }} viewBox="0 0 10 10" color="yellow">
      <Defs>
        <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="green" stopOpacity="1" />
          <Stop offset="1" stopColor="black" stopOpacity="1" />
        </LinearGradient>
      </Defs>
      <Line x1="0" y1="0" x2="10" y2="10" fill="red" stroke="url(#grad)" strokeWidth="5" />
    </Svg>
  );
};

const RadialGradientTest: React.FunctionComponent = () => {
  return (
    <Svg height="100" width="100" style={{ backgroundColor: 'black' }} viewBox="0 0 10 10" color="yellow">
      <Defs>
        <RadialGradient id="grad2">
          <Stop offset="0" stopColor="blue" />
          <Stop offset="1" stopColor="red" />
        </RadialGradient>
      </Defs>
      <Line x1="0" y1="0" x2="9" y2="9" stroke="url(#grad2)" strokeWidth="5" />
    </Svg>
  );
};

const RectCircleTest: React.FunctionComponent = () => {
  return (
    <Svg height="200" width="200">
      <Defs>
        <G id="shape">
          <G>
            <Rect x="120" y="120" width="20" height="50" fill="red" />
            <Circle cx="100" cy="100" r="20" fill="blue" stroke="black" />
          </G>
        </G>
      </Defs>
      <Use href="#shape" x="20" y="0" />
      <Use href="#shape" x="170" y="0" />
    </Svg>
  );
};

const BundledSvgTest: React.FunctionComponent = () => {
  return <TestSvg width={200} height={200} color="red" />;
};

const RemoteSvgTest: React.FunctionComponent = () => {
  // GH#1596: Temporarily stop testing this case until it can be either more robust or removed
  const shouldShowLocalNetwork = false;

  return (
    <View>
      <SvgUri
        style={styles.svg}
        viewBox="0 0 200 200"
        width="100"
        height="100"
        uri="https://upload.wikimedia.org/wikipedia/commons/8/84/Example.svg"
      />
      {shouldShowLocalNetwork && (
        <SvgUri
          x="50"
          y="50"
          viewBox="0 0 500 500"
          style={styles.svg}
          width="100"
          height="100"
          uri="http://10.122.222.112:8080/accessible-icon-brands.svg"
        />
      )}
    </View>
  );
};

const svgSections: TestSection[] = [
  {
    name: 'Rect',
    testID: SVG_TESTPAGE,
    component: RectTest,
  },
  {
    name: 'FontAwesome Test',
    component: FontAwesomeTest,
  },
  {
    name: 'Circle',
    component: CircleTest,
  },
  {
    name: 'Line',
    component: LineTest,
  },
  {
    name: 'Path',
    component: PathTest,
  },
  {
    name: 'Polygon',
    component: PolygonTest,
  },
  {
    name: 'Linear Gradient',
    component: LinearGradientTest,
  },
  {
    name: 'Radial Gradient',
    component: RadialGradientTest,
  },
  {
    name: 'Rect and Circle via Defs and Use',
    component: RectCircleTest,
  },
  {
    name: 'Bundled Svg',
    component: BundledSvgTest,
  },
  {
    name: 'Remotely Retrieved Svgs',
    component: RemoteSvgTest,
  },
];

export const SvgTest: React.FunctionComponent = () => {
  const status: PlatformStatus = {
    win32Status: 'Beta',
    uwpStatus: 'Backlog',
    iosStatus: 'Backlog',
    macosStatus: 'Backlog',
    androidStatus: 'Backlog',
  };

  const description = 'No description.';

  return <Test name="Svg Test" description={description} sections={svgSections} status={status} />;
};
