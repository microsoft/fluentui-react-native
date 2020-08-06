import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Circle, Defs, G, Line, Path, Polygon, RadialGradient, Rect, Stop, Svg, SvgCssUri, Use } from 'react-native-svg';
import TestSvg from './Assets/accessible-icon-brands.svg';
import { SVG_TESTPAGE } from './consts';
import { Test, TestSection, PlatformStatus } from '../Test';

const styles = StyleSheet.create({
  svg: {
    backgroundColor: 'green',
    color: 'purple'
  }
});

const rect: React.FunctionComponent<{}> = () => {
  return (
    <Svg width="50" height="50">
      <Rect x="10" y="10" width="20" height="20" fill="red" stroke="black" />
    </Svg>
  );
}

const circle: React.FunctionComponent<{}> = () => {
  return (
    <Svg width="50" height="50">
      <Circle cx="25" cy="25" r="20" fill="red" stroke="black" />
    </Svg>
  );
}

const line: React.FunctionComponent<{}> = () => {
  return (
    <Svg width="50" height="50">
      <Line x1="10" y1="10" x2="20" y2="20" fill="red" stroke="black" />
    </Svg>
  );
}

const path: React.FunctionComponent<{}> = () => {
  return (
    <Svg width="100" height="100">
      <Path d="M 0 0 A 10 10 0 0,1 0 100" fill="magenta" stroke="purple" id="path" />
    </Svg>
  );
}

const polygon: React.FunctionComponent<{}> = () => {
  return (
    <Svg height="100" width="100">
      <Polygon points="40,5 70,80 25,95" fill="lime" stroke="purple" strokeWidth="1" />
    </Svg>
  );
}

const radialGradient: React.FunctionComponent<{}> = () => {
  return (
    <Svg height="100" width="100" style={{ backgroundColor: 'black' }} viewBox="0 0 10 10" color="yellow">
      <Defs>
        <RadialGradient id="grad" cx="10" cy="10" r="8" fx="10" fy="10" gradientUnits="objectBoundingBox">
          <Stop offset="0%" stopColor="yellow" stopOpacity=".5" />
          <Stop offset="50%" stopColor="red" stopOpacity="1" />
          <Stop offset="100%" stopColor="blue" stopOpacity="1" />
        </RadialGradient>
      </Defs>
      <Line x1="0" y1="0" x2="60" y2="60" fill="red" stroke="blue" strokeWidth="5" />
    </Svg>
  );
}

const rectCircle: React.FunctionComponent<{}> = () => {
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
}

const bundledSvg: React.FunctionComponent<{}> = () => {
  return (
    <TestSvg width={200} height={200} color="red" />
  );
}

const remoteSvg: React.FunctionComponent<{}> = () => {
  return (
    <View>
      <SvgCssUri
        style={styles.svg}
        viewBox="0 0 200 200"
        width="100"
        height="100"
        uri="https://upload.wikimedia.org/wikipedia/commons/8/84/Example.svg"
      />
      <SvgCssUri
        x="50"
        y="50"
        viewBox="0 0 500 500"
        style={styles.svg}
        width="100"
        height="100"
        uri="http://10.122.222.112:8080/accessible-icon-brands.svg"
      />
    </View>
  );
}

const svgSections: TestSection[] = [
  {
    name: 'Rect',
    testID: SVG_TESTPAGE,
    component: rect
  },
  {
    name: 'Circle',
    component: circle
  },
  {
    name: 'Line',
    component: line
  },
  {
    name: 'Path',
    component: path
  },
  {
    name: 'Polygon',
    component: polygon
  },
  {
    name: 'Radial Gradient',
    component: radialGradient
  },
  {
    name: 'Rect and Circle via Defs and Use',
    component: rectCircle
  },
  {
    name: 'Bundled Svg',
    component: bundledSvg
  },
  {
    name: 'Remotely Retrieved Svgs',
    component: remoteSvg
  }
];

export const SvgTest: React.FunctionComponent<{}> = () => {

  const status: PlatformStatus = {
    win32Status: 'beta',
    uwpStatus: 'backlog',
    iosStatus: 'backlog',
    macosStatus: 'backlog',
    androidStatus: 'backlog'
  }

  const description = 'No description.'

  return (
    <Test name="Svg Test" description={description} sections={svgSections} status={status}></Test>
  );
};
