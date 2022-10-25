// import * as React from 'react';
// import { Text, View } from 'react-native';
// import { Ripple } from '../Ripple';
// import { mergeStyles, useFluentTheme } from '@fluentui-react-native/framework';
// import * as renderer from 'react-test-renderer';
// import { checkRenderConsistency, checkReRender } from '@fluentui-react-native/test-tools';
// import { Pressable } from '@fluentui-react-native/pressable';

// const backgroundColor = { backgroundColor: 'red' };
// interface RippleTestProps {
//   displayText: string;
//   depth: string;
// }

// const TestRipple: React.FunctionComponent<RippleTestProps> = (props: RippleTestProps) => {
//   const theme = useFluentTheme();
//   return (
//     <Ripple rippleToken={theme.shadows[props.depth]}>
//       <View style={backgroundColor}>
//         <Text>{props.displayText}</Text>
//       </View>
//     </Ripple>
//   );
// };

// const TestPressableWithRipple: React.FunctionComponent = () => {
//   const theme = useFluentTheme();
//   return (
//     <Ripple rippleToken={theme.shadows['ripple16']}>
//       <Pressable style={backgroundColor} />
//     </Ripple>
//   );
// };

// interface RippleOnChildViewWithProps {
//   childViewStyleProps: object;
// }

// const TestRippleOnChildViewWithProps: React.FunctionComponent<RippleOnChildViewWithProps> = (props: RippleOnChildViewWithProps) => {
//   const theme = useFluentTheme();
//   return (
//     <Ripple rippleToken={theme.shadows['ripple16']}>
//       <View style={mergeStyles(props.childViewStyleProps, backgroundColor)}>
//         <Text>{JSON.stringify(props.childViewStyleProps)}</Text>
//       </View>
//     </Ripple>
//   );
// };

// describe('Ripple component tests', () => {
//   beforeAll(() => {
//     jest.mock('react-native/Libraries/Utilities/Platform', () => ({
//       OS: 'macos',
//       select: () => null,
//     }));
//   });

//   it('Ripple (depth=2)', () => {
//     const tree = renderer.create(<TestRipple displayText="Ripple (depth=2)" depth="ripple2" />).toJSON();
//     expect(tree).toMatchSnapshot();
//   });

//   it('Ripple (depth=4)', () => {
//     const tree = renderer.create(<TestRipple displayText="Ripple (depth=4)" depth="ripple4" />).toJSON();
//     expect(tree).toMatchSnapshot();
//   });

//   it('Ripple (depth=8)', () => {
//     const tree = renderer.create(<TestRipple displayText="Ripple (depth=8)" depth="ripple8" />).toJSON();
//     expect(tree).toMatchSnapshot();
//   });

//   it('Ripple (depth=16)', () => {
//     const tree = renderer.create(<TestRipple displayText="Ripple (depth=16)" depth="ripple16" />).toJSON();
//     expect(tree).toMatchSnapshot();
//   });

//   it('Ripple (depth=28)', () => {
//     const tree = renderer.create(<TestRipple displayText="Ripple (depth=28)" depth="ripple28" />).toJSON();
//     expect(tree).toMatchSnapshot();
//   });

//   it('Ripple (depth=64)', () => {
//     const tree = renderer.create(<TestRipple displayText="Ripple (depth=64)" depth="ripple64" />).toJSON();
//     expect(tree).toMatchSnapshot();
//   });

//   it('Brand ripple (depth=2)', () => {
//     const tree = renderer.create(<TestRipple displayText="Brand ripple (depth=2)" depth="ripple2brand" />).toJSON();
//     expect(tree).toMatchSnapshot();
//   });

//   it('Brand ripple (depth=4)', () => {
//     const tree = renderer.create(<TestRipple displayText="Brand ripple (depth=4)" depth="ripple4brand" />).toJSON();
//     expect(tree).toMatchSnapshot();
//   });

//   it('Brand ripple (depth=8)', () => {
//     const tree = renderer.create(<TestRipple displayText="Brand ripple (depth=8)" depth="ripple8brand" />).toJSON();
//     expect(tree).toMatchSnapshot();
//   });

//   it('Brand ripple (depth=16)', () => {
//     const tree = renderer.create(<TestRipple displayText="Brand ripple (depth=16)" depth="ripple16brand" />).toJSON();
//     expect(tree).toMatchSnapshot();
//   });

//   it('Brand ripple (depth=28)', () => {
//     const tree = renderer.create(<TestRipple displayText="Brand ripple (depth=28)" depth="ripple28brand" />).toJSON();
//     expect(tree).toMatchSnapshot();
//   });

//   it('Brand ripple (depth=64)', () => {
//     const tree = renderer.create(<TestRipple displayText="Brand ripple (depth=64)" depth="ripple64brand" />).toJSON();
//     expect(tree).toMatchSnapshot();
//   });

//   it('Pressable that has a ripple', () => {
//     const tree = renderer.create(<TestPressableWithRipple />).toJSON();
//     expect(tree).toMatchSnapshot();
//   });

//   it('Ripple on a child with margin and padding', () => {
//     const tree = renderer.create(<TestRippleOnChildViewWithProps childViewStyleProps={{ margin: 2, padding: 2 }} />).toJSON();
//     expect(tree).toMatchSnapshot();
//   });

//   it('Ripple on a child with border radius', () => {
//     const tree = renderer.create(<TestRippleOnChildViewWithProps childViewStyleProps={{ borderRadius: 2 }} />).toJSON();
//     expect(tree).toMatchSnapshot();
//   });

//   it('Ripple on a child with border width', () => {
//     const tree = renderer.create(<TestRippleOnChildViewWithProps childViewStyleProps={{ borderWidth: 2 }} />).toJSON();
//     expect(tree).toMatchSnapshot();
//   });

//   it('Ripple simple rendering does not invalidate styling', () => {
//     checkRenderConsistency(() => <TestRipple displayText="Ripple render test" depth="ripple2" />, 2);
//   });

//   it('Ripple re-renders correctly', () => {
//     checkReRender(() => <TestRipple displayText="Ripple render twice test" depth="ripple2" />, 2);
//   });

//   afterAll(() => {
//     jest.unmock('react-native/Libraries/Utilities/Platform');
//   });
// });
