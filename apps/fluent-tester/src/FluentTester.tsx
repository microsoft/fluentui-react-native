import { Text, ContextualMenuItem, ContextualMenu } from '@fluentui/react-native';
//import { ButtonV1 as Button } from '@fluentui/react-native';
import * as React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
//import { Stack } from '@fluentui-react-native/stack';
//import { stackStyle /*, commonTestStyles*/ } from './TestComponents/Common/styles';
import { ButtonV1 as Button } from '@fluentui-react-native/button';
import { commonTestStyles as commonStyles } from './TestComponents/Common/styles';
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

export interface FluentTesterProps {
  enableSinglePaneView?: boolean;
}

export const FluentTester: React.FunctionComponent<FluentTesterProps> = () => {
  const [content, setContent] = React.useState([]);
  // const [renderSV, setRenderSV] = React.useState(false);

  // const addSingleLineComponent = () => {
  //   setContent(content.concat(<Text>New single line text component</Text>));
  // };

  const addMultLineComponent = () => {
    setContent(content.concat(<Text>New single line</Text>));
  };

  // const removeComponent = () => {
  //   const newArr = content.splice(0, content.length - 1);
  //   setContent(newArr);
  // };

  // const resetScrollViewer = () => {
  //   setContent([]);
  // };

  // const setRenderSv = (val) => {
  //   setRenderSV(val);
  // };

  const [showCallout, setShowCallout] = React.useState(false);

  const toggleShowCallout = React.useCallback(() => {
    setShowCallout(!showCallout);
  }, [showCallout, setShowCallout]);

  const stdBtnRef = React.useRef(null);
  const [contextualContent, setContextualContent] = React.useState([]);

  const [key, setKey] = React.useState(' ');
  const addContextualComponent = () => {
    setContextualContent(contextualContent.concat(<ContextualMenuItem text="MenuItem 1" itemKey={key} />));
    setKey(key + '1');
  };

  const [footerHeight, setFooterHeight] = React.useState(40);
  const [availableSpace, setAvailableSpace] = React.useState(0);
  const [svSize, setSvSize] = React.useState(0);

  const ChangeSvHeight = () => {
    setFooterHeight(footerHeight + 20);
  };

  const RemoveSvHeight = () => {
    setFooterHeight(footerHeight - 20);
  };

  // const setAvailableSpace = () => {
  //   const cardMaxHeight = 400;
  //   const headerHeight = 40;
  //   setAvailableSpace(cardMaxHeight - headerHeight - footerHeight);
  // };

  React.useEffect(() => {
    console.log('In Effect');
    const cardMaxHeight = 400;
    const headerHeight = 40;
    setAvailableSpace(cardMaxHeight - headerHeight - footerHeight);

    const contentSize = (content.length + 5) * 16;

    if (contentSize > availableSpace) {
      setSvSize(availableSpace);
    } else {
      setSvSize(contentSize + 2);
    }
  }, [footerHeight, availableSpace, content.length]);

  return (
    <View>
      <Button onClick={ChangeSvHeight}>Add Height</Button>
      <Button onClick={RemoveSvHeight}>Remove Height</Button>
      <Button onClick={addMultLineComponent}>Add Multi Component</Button>
      <View
        style={{ maxHeight: 400, maxWidth: 272, flexDirection: 'column', alignItems: 'flex-start', borderColor: 'red', borderWidth: 1 }}
      >
        <Text style={{ height: 40, backgroundColor: 'lightblue' }}>Header Test</Text>
        <ScrollView style={{ backgroundColor: 'lightgreen', height: svSize /*minHeight: 40, maxHeight: availableSpace*/ }}>
          <Text>New single line</Text>
          <Text>New single line</Text>
          <Text>New single line</Text>
          <Text>New single line</Text>
          <Text>New single line</Text>
          {content}
        </ScrollView>
        <Text style={{ height: footerHeight, backgroundColor: 'lightpink' }}>Footer Text </Text>
      </View>
      <View style={commonStyles.root}>
        <View style={commonStyles.settings}>
          {/* <View style={commonStyles.switch}>
            <Text>Render ScrollViewer</Text>
            <Switch value={renderSV} onValueChange={setRenderSv} />
          </View>
          <Button onClick={addSingleLineComponent} style={{ margin: 3 }}>
            Add Single Component
          </Button>
          <Button onClick={addMultLineComponent} style={{ margin: 3 }}>
            Add Multi Component
          </Button>
          <Button onClick={removeComponent} style={{ margin: 3 }}>
            Remove Component
          </Button>
          <Button onClick={resetScrollViewer} style={{ margin: 3 }}>
            Reset ScrollViewer
          </Button> */}
          <Button onClick={addContextualComponent} style={{ margin: 3 }}>
            Add Contextual Component
          </Button>
          <Button onClick={toggleShowCallout} componentRef={stdBtnRef}>
            Press for Contextual Menu
          </Button>
        </View>
      </View>
      {/* {renderSV && (
        <View style={{ maxHeight: 200, maxWidth: 300, backgroundColor: 'pink' }}>
          <ScrollView style={{ minHeight: 50, backgroundColor: 'lightblue' }}>
            <Text style={styles.text}>Line 1</Text>
            <Text style={styles.text}>Line 1</Text>
            <Text style={styles.text}>Line 1</Text>
            <Text style={styles.text}>
              Line 1jefnhueilr bfluerb igilb ugb ieurabgyuierb gkjsrbg uosgbhsurgb erub uierb erubvguer bvguierbvguee gerbgfjbsdvb sdlkv
              bdsrul ivbersdbveiuiv l vbiervlbseiuvbsertvusevuisde
            </Text>
            {content}
          </ScrollView>
        </View>
      )} */}
      {showCallout && (
        <ContextualMenu target={stdBtnRef}>
          <View
            style={{ maxHeight: 400, maxWidth: 272, flexDirection: 'column', alignItems: 'flex-start', borderColor: 'red', borderWidth: 1 }}
          >
            <Text style={{ height: 40, backgroundColor: 'lightblue' }}>Header Test</Text>
            <ScrollView style={{ backgroundColor: 'lightgreen', minHeight: 40, maxHeight: availableSpace }}>
              <Text style={styles.text}>
                Line 1wjfbriweu fbuier gbfilebgfeblerigfbuyeirbgf ioyuewgbuf we4rulfbuerioyuiew brgef erkgb uewyrer uergfihufrbegukb eryg
                feisrfluwebrgfkyerjubfgeiyulergbf eargyuif bwerg ioyuwernjnefrrnf eruif geuirg bfebgf ielyufb aierfb iauerbf iuyrl bflb i
              </Text>
              <Text style={styles.text}>Line 1</Text>
              <Text style={styles.text}>Line 1</Text>
              {content}
            </ScrollView>
            <Text style={{ height: footerHeight, backgroundColor: 'lightpink' }}>Footer Text </Text>
          </View>
        </ContextualMenu>
      )}
    </View>
  );
};
