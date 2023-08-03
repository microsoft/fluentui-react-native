//import { ButtonV1 as Button } from '@fluentui/react-native';
import * as React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';

import { Text } from '@fluentui/react-native';
//import { Stack } from '@fluentui-react-native/stack';
//import { stackStyle /*, commonTestStyles*/ } from './TestComponents/Common/styles';
import { ButtonV1 as Button } from '@fluentui-react-native/button';
//import { svgProps } from './TestComponents/Common/iconExamples';

export const styles = StyleSheet.create({
  text: {
    // fontSize: 6,
  },
});

// const fontBuiltInProps = {
//   fontFamily: 'Arial',
//   codepoint: 0x2663,
//   fontSize: 24,
// };

// C:\Users\safreibe.REDMOND\Desktop\NewFluent\fluentui-react-native\apps\win32\dist\index.win32.bundle

// This loop traverses up the tree and keeps a running count of size of each parent's border. We use this to calculate an offset for the childs
// available space due to borders. After we calculate the offset, we do Height - YOffset = available space

export interface FluentTesterProps {
  enableSinglePaneView?: boolean;
}

export const FluentTester: React.FunctionComponent<FluentTesterProps> = () => {
  const [renderSV, setRenderSV] = React.useState(false);
  const [renderSV2, setRenderSV2] = React.useState(false);
  const [content, setContent] = React.useState([]);
  const [content2, setInnerContent] = React.useState([]);

  const showSV = () => {
    setRenderSV(!renderSV);
  };

  const showSV2 = () => {
    setRenderSV2(!renderSV2);
  };

  const addElement = () => {
    setContent(content.concat(<Text>New single line text component</Text>));
  };

  const addElement2 = () => {
    setInnerContent(content2.concat(<Text>New single line text cferferferferaferafreferaerfrffferefrerfferomponent</Text>));
  };

  const resetSV = () => {
    setContent([]);
  };

  // const addSVElement = () => {
  //   setInnerContent(
  //     content.concat(
  //       <ScrollView style={{ maxHeight: 150, maxWidth: 250 }}>
  //         <Text>SV Component</Text>
  //         <Text>SV Component</Text>
  //         <Text>SV Component</Text>
  //         <Text>SV Component</Text>
  //       </ScrollView>,
  //     ),
  //   );
  // };

  const biDirectional = { biDirectional: true };

  // C:\Users\safreibe.REDMOND\Desktop\NewFluent\fluentui-react-native\apps\win32\dist\index.win32.bundle

  return (
    <View>
      <Button onClick={showSV}>Show ScrollView</Button>
      <Button onClick={showSV2}>Show ScrollView2</Button>
      <Button onClick={addElement}>Add Element</Button>
      <Button onClick={addElement2}>Add Multi-Line Element</Button>
      <Button onClick={resetSV}>Reset SV</Button>
      <View style={{ maxHeight: 300, maxWidth: 300 }}>
        {renderSV && (
          <ScrollView {...biDirectional} style={{ backgroundColor: 'lightblue' }}>
            <Text style={styles.text}>Line 1</Text>
            <Text style={styles.text}>Line 1</Text>
            <Text style={styles.text}>Line 1</Text>
            <ScrollView style={{ maxHeight: 150, backgroundColor: 'red' }}>
              <Text>SV Component</Text>
              <Text>SV Component</Text>
              <Text>SV Component</Text>
              <Text>SV Component</Text>
              <Text>SV Component</Text>
              {content}
            </ScrollView>
            <Text>SV Component</Text>
            {content2}
          </ScrollView>
        )}
      </View>
      {/* <View style={{ maxHeight: 400, maxWidth: 300 }}>
        {renderSV2 && (
          <ScrollView {...biDirectional} style={{ backgroundColor: 'lightblue' }}>
            <Text style={styles.text}>Line 1</Text>
            <Text style={styles.text}>Line 1</Text>
            <Text style={styles.text}>Line 1</Text>
            <Text style={styles.text}>
              Line 1jefnhueilr bflfrferferfearferaferreferefrerffrefrerefefrfrerefauerb igilb ugb ieurabgyuierb gkjsrbg uosgbhsurgb erub
              uierb erubvguerLine 1jefnhueilr bflfrferferfearferaferreferefrerffrefrerefefrfrerefauerb igilb ugb ieurabgyuierb gkjsrbg
              uosgbhsurgb erubLine 1jefnhueilr bflfrferferfearferaferreferefrerffrefrerefefrfrerefauerb igilb ugb ieurabgyuierb gkjsrbg
              uosgbhsurgb erubLine 1jefnhueilr bflfrferferfearferaferreferefrerffrefrerefefrfrerefauerb igilb ugb ieurabgyuierb gkjsrbg
            </Text>
            <Text style={styles.text}>Line 1</Text>
            <Text style={styles.text}>Line 1</Text>
            {content}
          </ScrollView>
        )}
      </View> */}
    </View>
  );
};
