import * as React from 'react';
import { useState } from 'react';
import { StyleSheet, Switch, Text, TextInput, View } from 'react-native';

import { ButtonV1 as Button, ToggleButton } from '@fluentui/react-native';
import { Separator } from '@fluentui/react-native';
import {
  Circle,
  Defs,
  G,
  Line,
  Path,
  Polygon,
  LinearGradient,
  RadialGradient,
  Rect,
  Stop,
  Svg,
  SvgUri,
  SvgXml,
  Use,
  parse,
} from 'react-native-svg';

import TestSvg from './Assets/accessible-icon-brands.svg';
import { SVG_TESTPAGE } from '../../../../E2E/src/Svg/consts';
import { Test } from '../Test';
import type { TestSection, PlatformStatus } from '../Test';

const styles = StyleSheet.create({
  svg: {
    backgroundColor: 'green',
    color: 'purple',
  },
});

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

const RadialGradientTransformTest: React.FunctionComponent = () => {
  return (
    <Svg width={256} height={256} viewBox="0 0 48 48" fill="none">
      <Rect width={48} height={48} fill="url(#paint0_radial_1533_187044)" />
      <Rect x={10} y={10} width={10} height={10} fill="red" />
      <Defs>
        <RadialGradient
          id="paint0_radial_1533_187044"
          cx={0}
          cy={0}
          r={20}
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(22 11)"
        >
          <Stop offset={0.0598494} stopColor="#FF0000" />
          <Stop offset={1} stopColor="#00FF00" />
        </RadialGradient>
      </Defs>
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

const CustomSvgInputTest: React.FunctionComponent = () => {
  const defaultxml = `
  <svg width="256" height="256" viewBox="0 0 48 48">
  <rect width="48" height="48" fill="red"/>
  </svg>
`;

  const textInputStyle = { height: 256, width: 1024, borderColor: 'gray', borderWidth: 1, fontSize: 16 };
  const [inputText, setInputText] = useState<string>(defaultxml);
  const [svgText, setSvgText] = useState<string>(defaultxml);
  const [dataText, setDataText] = useState<string>('click draw to see parsed data');
  const [showParse, setShowParsed] = useState<boolean>(false);

  const handleChangeText = React.useCallback(
    (text: string) => {
      setInputText(text);
    },
    [setInputText],
  );

  const handleDrawOnClick = React.useCallback(() => {
    const parsed = parse(inputText);
    if (parsed !== null) {
      setSvgText(inputText);
      setDataText(JSON.stringify(parsed));
    }
  }, [inputText, setSvgText, setDataText]);

  const handleShowParsed = React.useCallback(() => {
    setShowParsed(!showParse);
  }, [showParse, setShowParsed]);

  return (
    <View>
      <Text>
        Paste an svg in here and click Draw to try it out. The way it uses rnsvg&apos;s parse function to attempt to validate svg may cause
        asserts and crashes if the svg is invalid. Looking for another solution for this, but this is still useful in its current state.
      </Text>
      <TextInput
        multiline={true}
        accessibilityLabel="Custom svg text input"
        value={inputText}
        style={textInputStyle}
        onChangeText={handleChangeText}
      />
      <View style={{ flexDirection: 'row' }}>
        <Button onClick={handleDrawOnClick}>Draw</Button>
        <ToggleButton onClick={handleShowParsed}>Toggle Parsed data</ToggleButton>
      </View>
      <Separator />
      {showParse && <Text>{dataText}</Text>}
      <SvgXml width="256" height="256" xml={svgText} />
    </View>
  );
};

const svgSections: TestSection[] = [
  {
    name: 'Custom Svg Input',
    component: CustomSvgInputTest,
    testID: SVG_TESTPAGE,
  },
  {
    name: 'Rect',
    component: RectTest,
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
    name: 'Radial GradientTransform',
    component: RadialGradientTransformTest,
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
    win32Status: 'Production',
    uwpStatus: 'Production',
    iosStatus: 'Production',
    macosStatus: 'Production',
    androidStatus: 'Production',
  };

  const description = 'No description.';

  return <Test name="Svg Test" description={description} sections={svgSections} status={status} />;
};
