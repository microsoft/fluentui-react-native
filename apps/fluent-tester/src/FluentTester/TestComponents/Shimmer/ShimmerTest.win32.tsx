import * as React from 'react';
import { SHIMMER_TESTPAGE } from './consts';
import { Test, TestSection, PlatformStatus } from '../Test';
import { Shimmer } from '@fluentui-react-native/experimental-shimmer';
import { Stack } from '@fluentui-react-native/stack';
import { shimmerBorderRadiusTests, shimmerRects, shimmerRectsAndCircle } from './ShimmerTestElementSets';
import { stackStyle } from '../Common/styles';
import { View } from 'react-native';

const RectShimmers: React.FunctionComponent<{}> = () => {
  return (
    <Stack style={stackStyle}>
      <View>
        <Shimmer elements={shimmerRects()} duration={2000} delay={1000} style={{ width: 800, height: 800 }} />
      </View>
    </Stack>
  );
};

const RectCircleShimmers: React.FunctionComponent<{}> = () => {
  return (
    <Stack style={stackStyle}>
      <View>
        <Shimmer elements={shimmerRectsAndCircle()} duration={3000} style={{ width: 800, height: 800 }} />
      </View>
    </Stack>
  );
};

const CustomizedShimmer: React.FunctionComponent<{}> = () => {
  const PinkShimmer = Shimmer.customize({
    gradientTintColor: 'pink',
  });

  return (
    <Stack style={stackStyle}>
      <View>
        <PinkShimmer elements={shimmerRectsAndCircle()} duration={1500} delay={500} style={{ width: 600, height: 600 }} />
      </View>
    </Stack>
  );
};

const ShimmerBorderRadii: React.FunctionComponent<{}> = () => {
  return (
    <Stack style={stackStyle}>
      <View>
        <Shimmer elements={shimmerBorderRadiusTests()} duration={3000} style={{ width: 1000, height: 1000 }} />
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
//               <Path d="M50,0 21,90 98,35 2,35 79,90z" id="star" clipRule="nonzero" />
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
          <Use clipPath="url(#star)" clipRule="evenodd" />
        </ClipPath>
        <Rect clipPath="url(#emptyStar)" width="50" height="90" fill="blue" />

        <ClipPath id="filledStar">
          <Use clipPath="url(#star)" clipRule="nonzero" />
        </ClipPath>
        <Rect clipPath="url(#filledStar)" width="50" height="90" x="50" fill="red" />
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

// const simplestPossible: React.FunctionComponent<{}> = () => {
//   return (
//     <Stack style={stackStyle}>
//       <View style={{ width: 400, height: 400, backgroundColor: 'green' }}>
//         <Svg width={100} height={100} viewBox="0 0 100 100">
//           <ClipPath id="blueClip">
//             <Circle cx="40" cy="40" r="20" clipRule="nonzero" />
//             <Circle cx="60" cy="60" r="20" clipRule="nonzero" />
//           </ClipPath>
//           <ClipPath id="redClip">
//             <Circle cx="40" cy="40" r="20" clipRule="nonzero" />
//             <Circle cx="60" cy="60" r="20" clipRule="nonzero" />
//           </ClipPath>
//           <Rect clipPath="#redClip" width={50} height={80} x={30} y={10} fill="red" />
//           <Rect clipPath="#blueClip" width={50} height={100} fill="blue" />
//         </Svg>
//       </View>
//     </Stack>
//   );
// };

/**
 *
const RectShimmers: React.FunctionComponent<{}> = () => {
  const RectCircleShimmers: React.FunctionComponent<{}> = () => {
const CustomizedShimmer: React.FunctionComponent<{}> = () => {
const ShimmerBorderRadii: React.FunctionComponent<{}> = () => {
 */

const shimmerSections: TestSection[] = [
  // {
  //   name: 'Simplest. Possible.',
  //   testID: SHIMMER_TESTPAGE,
  //   component: simplestPossible,
  // },
  // {
  //   name: 'specialDemo clipping',
  //   component: specialDemo,
  // },
  // {
  //   name: 'liblet_svg example',
  //   testID: SHIMMER_TESTPAGE,
  //   component: libletSvgExample,
  // },
  {
    name: 'Shimmer Rects',
    testID: SHIMMER_TESTPAGE,
    component: RectShimmers,
  },
  {
    name: 'Shimmer Rects and Circle',
    testID: SHIMMER_TESTPAGE,
    component: RectCircleShimmers,
  },
  {
    name: 'Customized Shimmer',
    testID: SHIMMER_TESTPAGE,
    component: CustomizedShimmer,
  },
  {
    name: 'Border Radius Tests',
    testID: SHIMMER_TESTPAGE,
    component: ShimmerBorderRadii,
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
