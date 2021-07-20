import * as React from 'react';
import { SHIMMER_TESTPAGE } from './consts';
import { Test, TestSection, PlatformStatus } from '../Test';
import { Stack } from '@fluentui-react-native/stack';
import { stackStyle } from '../Common/styles';
import { View } from 'react-native';

import { Shimmer, ShimmerElement } from '@fluentui-react-native/experimental-shimmer';
const shimmer: React.FunctionComponent<{}> = () => {
  const lines: Array<ShimmerElement> = [
    {
      type: 'rect',
      width: 100,
      height: 20,
      borderRadius: 3,
      xPos: 90,
      yPos: 70,
    },
    {
      type: 'rect',
      width: 150,
      height: 20,
      borderRadius: 3,
      xPos: 90,
      yPos: 42,
    },
    {
      type: 'rect',
      width: 200,
      height: 20,
      borderRadius: 3,
      xPos: 90,
      yPos: 15,
    },
  ];
  const circle = lines.slice();
  circle.push({ type: 'circle', height: 70, xPos: 20, yPos: 35 });
  const rect = lines.slice();
  rect.push({ type: 'rect', height: 60, width: 60, xPos: 10, yPos: 25, borderRadius: 3 });
  rect.push({ type: 'circle', height: 70, xPos: 20, yPos: 35 });

  return (
    <Stack style={stackStyle}>
      <View>
        <Shimmer elements={rect} duration={2000} delay={2000} width={100} height={100} />
      </View>
    </Stack>
  );
};

// import { Svg, Circle, ClipPath, Defs, LinearGradient, Polygon, Rect, Stop, Path } from 'react-native-svg';
// import { ensureNativeComponent } from '@fluentui-react-native/component-cache';
// export const RCTNativeAnimatedShimmer = ensureNativeComponent('RCTNativeAnimatedShimmer');
// const PATSTESTS: React.FunctionComponent<{}> = () => {
//   return (
//     <Stack style={stackStyle}>
//       <View style={{ width: 400, height: 400, backgroundColor: 'yellow' }}>
//         <RCTNativeAnimatedShimmer {...{ duration: 10000, delay: 500, style: { overflow: 'hidden' } }}>
//           <Svg height="100" width="101">
//             <Defs>
//               <LinearGradient id="gradient">
//                 <Stop offset="20%" stopColor="red" />
//                 <Stop offset="30%" stopColor="blue" />
//               </LinearGradient>
//               <ClipPath id="pat">
//                 <Circle cx="30" cy="30" r="20" />
//               </ClipPath>
//             </Defs>
//             <Rect x="0" y="0" width="200" height="200" fill="url(#gradient)" clipPath="url(#pat)" />
//           </Svg>
//         </RCTNativeAnimatedShimmer>
//         <Svg height="400" width="400" viewBox="0 0 400 400" style={{ position: 'absolute' }}>
//           <Defs>
//             <ClipPath id="pat">
//               <Path d="M50,0 21,90 98,35 2,35 79,90z" id="star" clip-rule="nonzero" />
//             </ClipPath>
//           </Defs>
//           <Rect x="0" y="0" width="100" height="100" fill="gray" clipPath="url(#pat)" />
//         </Svg>
//       </View>
//     </Stack>
//   );
// };

import { Svg, Circle, ClipPath, Defs, LinearGradient, Polygon, Rect, Stop } from 'react-native-svg';
const linearGradient: React.FunctionComponent<{}> = () => {
  return (
    <React.Fragment>
      {/* <Svg width="100" viewBox="0 0 100 90">
        <Defs>
          <Path d="M50,0 21,90 98,35 2,35 79,90z" id="star" />
        </Defs>

        <ClipPath id="emptyStar">
          <Use clipPath="url(#star)" clip-rule="evenodd" />
        </ClipPath>
        <Rect clip-path="url(#emptyStar)" width="50" height="90" fill="blue" />

        <ClipPath id="filledStar">
          <Use clipPath="url(#star)" clip-rule="nonzero" />
        </ClipPath>
        <Rect clip-path="url(#filledStar)" width="50" height="90" x="50" fill="red" />
      </Svg> */}
      <Svg height="100" width="100">
        <Defs>
          <LinearGradient id="gradient">
            <Stop offset="10%" stopColor="green" />
            <Stop offset="20%" stopColor="red" />
            <Stop offset="30%" stopColor="blue" />
          </LinearGradient>
          <ClipPath id="pat">
            <Circle cx="30" cy="30" r="20" />
            <Rect x="65" y="15" width="30" height="30" />
            <Polygon points="20,60 20,80 50,70" />
          </ClipPath>
        </Defs>
        <Rect x="0" y="0" width="100" height="100" fill="url(#gradient)" clipPath="url(#pat)" />
      </Svg>
    </React.Fragment>
  );
};

// const specialDemo: React.FunctionComponent<{}> = () => {
//   return (
//     <Stack style={stackStyle}>
//       <View style={{ width: 400, height: 400, backgroundColor: 'green' }}>
//         <Svg width={100} height={90} viewBox="0 0 100 90">
//           <Defs>
//             <Path d="M 0 90 V 0 H 100 M50,0 21,90 98,35 2,35 79,90z" id="star" />
//           </Defs>

//           <ClipPath id="emptyStar">
//             <Path d="M 0 90 V 0 H 100" id="workaround" />
//             <Use href="#star" clipRule="nonzero" />
//           </ClipPath>
//           <Rect clipPath="url(#emptyStar)" width={50} height={90} fill="blue" />
//           <ClipPath id="filledStar">
//             <Use href="#star" clipRule="evenodd" />
//           </ClipPath>
//           <Rect clipPath="url(#filledStar)" width={50} height={90} x={50} fill="red" />
//         </Svg>
//       </View>
//     </Stack>
//   );
// };

const shimmerSections: TestSection[] = [
  // {
  //   name: 'specialDemo clipping',
  //   component: specialDemo,
  // },
  {
    name: 'Shimmer',
    testID: SHIMMER_TESTPAGE,
    component: shimmer,
  },
  // {
  //   name: 'PATSTESTS',
  //   testID: SHIMMER_TESTPAGE,
  //   component: PATSTESTS,
  // },
  {
    name: 'Linear Gradient',
    component: linearGradient,
  },
];

export const ShimmerTest: React.FunctionComponent<{}> = () => {
  const status: PlatformStatus = {
    win32Status: 'Backlog',
    uwpStatus: 'Backlog',
    iosStatus: 'Beta',
    macosStatus: 'Backlog',
    androidStatus: 'Backlog',
  };

  const description =
    'Shimmer is a temporary animation placeholder for when a service call takes time to return data but the rest of the UI should continue rendering.';

  return <Test name="Shimmer Test" description={description} sections={shimmerSections} status={status} />;
};
