import React, {useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Animated,
} from "react-native";
import { LinearGradient, Svg, Defs,Stop, Rect, Circle} from '@microsoft/react-native-svg-desktop';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);
export function Shimmer() {
  const leftValue = useState(new Animated.Value(0))[0]
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
      Animated.timing(leftValue, {
     toValue: 30,
     duration: 4000,
     useNativeDriver:false
   })]),
  ).start()
  })
    return (
      <View style={styles.container}>
          <View>
            <Svg height="150" width="350" fill="url(#gradient)">
              <Defs>
                <AnimatedLinearGradient id="gradient" x1={leftValue} y1="-1" x2="-1" y2="-1" >
                  <Stop offset="10%" stopColor="#c1c4be" stopOpacity="1" />
                  <Stop offset="20%" stopColor="#f9faf7" stopOpacity="1" />
                  <Stop offset="30%" stopColor="#c1c4be" stopOpacity="1" />
                </AnimatedLinearGradient>
              </Defs>
              <Circle cx="50" cy="50" r="35 "/>
              <Rect x="100" y="15" width="250" height="15" rx="3" ry="3" />
              <Rect x="100" y="40" width="200" height="15" rx="3" ry="3"/>
              <Rect x="100" y="65" width="150" height="15" rx="3" ry="3"/>
            </Svg>

          </View>

      </View>
    );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default Shimmer;