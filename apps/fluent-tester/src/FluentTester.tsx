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
    fontSize: 12,
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
  const [content, setContent] = React.useState([]);

  const showSV = () => {
    setRenderSV(!renderSV);
  };

  const addElement = () => {
    setContent(content.concat(<Text>New single line text component</Text>));
  };

  const biDirectional = { biDirectional: true };

  return (
    <View>
      <Button onClick={showSV}>Show ScrollView</Button>
      <Button onClick={addElement}>Add Element</Button>
      <View style={{ maxHeight: 300, maxWidth: 200 }}>
        {renderSV && (
          <ScrollView {...biDirectional} style={{ backgroundColor: 'lightblue' }}>
            <Text style={styles.text}>Line 1</Text>
            <Text style={styles.text}>Line 1</Text>
            <Text style={styles.text}>Line 1</Text>
            <Text style={styles.text}>
              Line 1jefnhueilr bfluerb igilb ugb ieurabgyuierb gkjsrbg uosgbhsurgb erub uierb erubvguer bvguierbvguee gerbgfjbsdvb sdlkv
              bdsrul ivbersdbveiuiv l vbiervlbseiuvbsertvusevuisdebdsrul ivbersdbveiuiv l vbiervlbseiuvbsertvusevuisdebdsrul ivbersdbveiuiv
              l vbiervlbseiuvbsertvusevuisde
            </Text>
            <Text style={styles.text}>Line 1</Text>
            <Text style={styles.text}>Line 1</Text>
            <Text style={styles.text}>Line 1</Text>
            <Text style={styles.text}>Line 1</Text>
            <Text style={styles.text}>Line 1</Text>
            <Text style={styles.text}>Line 1</Text>
            <Text style={styles.text}>Line 1</Text>
            <Text style={styles.text}>Line 1</Text>
            <Text style={styles.text}>Line 1</Text>
            <Text style={styles.text}>Line 1</Text>
            <Text style={styles.text}>Line 1</Text>
            <Text style={styles.text}>Line 1</Text>
            <Text style={styles.text}>Line 1</Text>
            <Text style={styles.text}>Line 1</Text>
            <Text style={styles.text}>Line 1</Text>
            <Text style={styles.text}>Line 1</Text>
            <Text style={styles.text}>Line 1</Text>
            <Text style={styles.text}>Line 1</Text>
            <Text style={styles.text}>Line 1</Text>
            <Text style={styles.text}>Line 1</Text>
            <Text style={styles.text}>Line 1</Text>
            <Text style={styles.text}>Line 1</Text>
            <Text style={styles.text}>Line 1</Text>
            <Text style={styles.text}>Line 1</Text>
            <Text style={styles.text}>Line 1</Text>
            <Text style={styles.text}>Line 1</Text>
            <Text style={styles.text}>Line 1</Text>
            <Text style={styles.text}>Line 1</Text>
            <Text style={styles.text}>Line 1</Text>
            <Text style={styles.text}>Line 1</Text>
            <Text style={styles.text}>Line 1</Text>
            <Text style={styles.text}>Line 1</Text>
            <Text style={styles.text}>Line 1</Text>
            <Text style={styles.text}>Line 1</Text>
            <Text style={styles.text}>Line 1</Text>
            <Text style={styles.text}>Line 1</Text>
            {content}
          </ScrollView>
        )}
      </View>
    </View>
  );
};
