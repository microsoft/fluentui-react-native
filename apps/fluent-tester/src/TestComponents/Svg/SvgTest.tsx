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
import { Test, TestSection, PlatformStatus } from '../Test';
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

const FancySvgTest: React.FunctionComponent = () => {
  return (
    <View>
      <Svg width={256} height={256} viewBox="0 0 48 48" fill="none">
        <Path
          d="M20.0842 3.02588L19.8595 3.16179C19.5021 3.37799 19.1654 3.61972 18.8512 3.88385L19.4993 3.42798H25L26 11L21 16L16 19.4754V23.4829C16 26.2819 17.4629 28.8774 19.8574 30.3268L25.1211 33.5129L14 40.0002H11.8551L7.85737 37.5804C5.46286 36.131 4 33.5355 4 30.7365V17.2606C4 14.4607 5.46379 11.8645 7.85952 10.4154L19.8595 3.15687C19.9339 3.11189 20.0088 3.06823 20.0842 3.02588Z"
          fill="url(#paint0_radial_1533_187044)"
        />
        <Path
          d="M20.0842 3.02588L19.8595 3.16179C19.5021 3.37799 19.1654 3.61972 18.8512 3.88385L19.4993 3.42798H25L26 11L21 16L16 19.4754V23.4829C16 26.2819 17.4629 28.8774 19.8574 30.3268L25.1211 33.5129L14 40.0002H11.8551L7.85737 37.5804C5.46286 36.131 4 33.5355 4 30.7365V17.2606C4 14.4607 5.46379 11.8645 7.85952 10.4154L19.8595 3.15687C19.9339 3.11189 20.0088 3.06823 20.0842 3.02588Z"
          fill="url(#paint1_linear_1533_187044)"
        />
        <Path
          d="M32 18.9999V23.4802C32 26.2792 30.5372 28.8747 28.1427 30.3241L16.1427 37.5877C13.6879 39.0736 10.6336 39.1272 8.13559 37.7486L19.8574 44.8439C22.404 46.3854 25.596 46.3854 28.1426 44.8439L40.1427 37.5802C42.5372 36.1308 44 33.5353 44 30.7363V27.4999L43 25.9999L32 18.9999Z"
          fill="url(#paint2_radial_1533_187044)"
        />
        <Path
          d="M32 18.9999V23.4802C32 26.2792 30.5372 28.8747 28.1427 30.3241L16.1427 37.5877C13.6879 39.0736 10.6336 39.1272 8.13559 37.7486L19.8574 44.8439C22.404 46.3854 25.596 46.3854 28.1426 44.8439L40.1427 37.5802C42.5372 36.1308 44 33.5353 44 30.7363V27.4999L43 25.9999L32 18.9999Z"
          fill="url(#paint3_linear_1533_187044)"
        />
        <Path
          d="M40.1405 10.4153L28.1405 3.15678C25.6738 1.66471 22.6021 1.61849 20.0979 3.01811L19.8595 3.16231C17.4638 4.61143 16 7.20757 16 10.0075V19.4914L19.8595 17.1568C22.4051 15.6171 25.5949 15.6171 28.1405 17.1568L40.1405 24.4153C42.4613 25.8192 43.9076 28.2994 43.9957 30.9985C43.9986 30.9113 44 30.824 44 30.7364V17.2605C44 14.4606 42.5362 11.8644 40.1405 10.4153Z"
          fill="url(#paint4_radial_1533_187044)"
        />
        <Path
          d="M40.1405 10.4153L28.1405 3.15678C25.6738 1.66471 22.6021 1.61849 20.0979 3.01811L19.8595 3.16231C17.4638 4.61143 16 7.20757 16 10.0075V19.4914L19.8595 17.1568C22.4051 15.6171 25.5949 15.6171 28.1405 17.1568L40.1405 24.4153C42.4613 25.8192 43.9076 28.2994 43.9957 30.9985C43.9986 30.9113 44 30.824 44 30.7364V17.2605C44 14.4606 42.5362 11.8644 40.1405 10.4153Z"
          fill="url(#paint5_linear_1533_187044)"
        />
        <Path d="M4.00428 30.9984C4.00428 30.9984 4.00428 30.9984 4.00428 30.9984V30.9984Z" fill="url(#paint6_radial_1533_187044)" />
        <Path d="M4.00428 30.9984C4.00428 30.9984 4.00428 30.9984 4.00428 30.9984V30.9984Z" fill="url(#paint7_linear_1533_187044)" />
        <Defs>
          <RadialGradient
            id="paint0_radial_1533_187044"
            cx={0}
            cy={0}
            r={1}
            gradientUnits="userSpaceOnUse"
            gradientTransform="translate(22.0622 11.5974) rotate(113.009) scale(42.7164 53.9043)"
          >
            <Stop offset={0.0598494} stopColor="#FF7167" />
            <Stop offset={1} stopColor="#DF0B24" />
          </RadialGradient>
          <LinearGradient id="paint1_linear_1533_187044" x1={20.343} y1={36.9279} x2={17.7482} y2={30.4819} gradientUnits="userSpaceOnUse">
            <Stop stopColor="#9E2714" />
            <Stop offset={1} stopColor="#9E2714" stopOpacity={0} />
          </LinearGradient>
          <RadialGradient
            id="paint2_radial_1533_187044"
            cx={0}
            cy={0}
            r={1}
            gradientUnits="userSpaceOnUse"
            gradientTransform="translate(16.3747 31.5364) rotate(-5.06969) scale(27.7343 20.633)"
          >
            <Stop offset={0.235071} stopColor="#FFCC47" />
            <Stop offset={1} stopColor="#FF5A23" />
          </RadialGradient>
          <LinearGradient id="paint3_linear_1533_187044" x1={41.2777} y1={21.9694} x2={35.131} y2={30.8299} gradientUnits="userSpaceOnUse">
            <Stop stopColor="#A02D1D" />
            <Stop offset={1} stopColor="#EC4528" stopOpacity={0} />
          </LinearGradient>
          <RadialGradient
            id="paint4_radial_1533_187044"
            cx={0}
            cy={0}
            r={1}
            gradientUnits="userSpaceOnUse"
            gradientTransform="translate(33.2955 23.203) rotate(-130.023) scale(32.4593 36.711)"
          >
            <Stop offset={0.0961728} stopColor="#FF98E8" />
            <Stop offset={0.990776} stopColor="#E11275" />
          </RadialGradient>
          <LinearGradient id="paint5_linear_1533_187044" x1={16.8204} y1={4.53726} x2={22.7053} y2={6.36563} gradientUnits="userSpaceOnUse">
            <Stop offset={0.159252} stopColor="#BC2363" />
            <Stop offset={1} stopColor="#EC3B85" stopOpacity={0} />
          </LinearGradient>
          <RadialGradient
            id="paint6_radial_1533_187044"
            cx={0}
            cy={0}
            r={1}
            gradientUnits="userSpaceOnUse"
            gradientTransform="translate(33.2955 23.203) rotate(-130.023) scale(32.4593 36.711)"
          >
            <Stop offset={0.0961728} stopColor="#FF98E8" />
            <Stop offset={0.990776} stopColor="#E11275" />
          </RadialGradient>
          <LinearGradient id="paint7_linear_1533_187044" x1={16.8204} y1={4.53726} x2={22.7053} y2={6.36563} gradientUnits="userSpaceOnUse">
            <Stop offset={0.159252} stopColor="#BC2363" />
            <Stop offset={1} stopColor="#EC3B85" stopOpacity={0} />
          </LinearGradient>
        </Defs>
      </Svg>
    </View>
  );
};

const CustomSvgInputTest: React.FunctionComponent = () => {
  const defaultxml = `
  <svg width="256" height="256" viewBox="0 0 48 48">
  <rect width="48" height="48" fill="red"/>
  </svg>
`;
  const [inputText, setInputText] = useState<string>(defaultxml);
  const [svgText, setSvgText] = useState<string>(defaultxml);
  const [dataText, setDataText] = useState<string>('click draw to see parsed data');
  const [showParse, setShowParsed] = useState<boolean>(false);
  return (
    <View>
      <Text>
        Paste an svg in here and click Draw to try it out. The way it uses rnsvg's parse function to attempt to validate svg may cause
        asserts and crashes if the svg is invalid. Looking for another solution for this, but this is still useful in its current state.
      </Text>
      <TextInput
        multiline={true}
        accessibilityLabel="Custom svg text input"
        value={inputText}
        style={{ height: 256, width: 1024, borderColor: 'gray', borderWidth: 1, fontSize: 16 }}
        onChangeText={(text) => {
          setInputText(text);
        }}
      />
      <View style={{ flexDirection: 'row' }}>
        <Button
          onClick={() => {
            const parsed = parse(inputText);
            if (parsed !== null) {
              setSvgText(inputText);
              setDataText(JSON.stringify(parsed));
            }
          }}
        >
          Draw
        </Button>
        <ToggleButton onClick={() => setShowParsed(!showParse)}>Toggle Parsed data</ToggleButton>
      </View>
      <Separator />
      {showParse && <Text>{dataText}</Text>}
      <SvgXml width="256" height="256" xml={svgText} />
    </View>
  );
};

const svgSections: TestSection[] = [
  {
    name: 'Fancy Svg',
    testID: SVG_TESTPAGE,
    component: FancySvgTest,
  },
  {
    name: 'Custom Svg Input',
    component: CustomSvgInputTest,
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
