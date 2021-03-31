import React, {useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Animated,
} from "react-native";
import { LinearGradient, Svg, Defs, Stop, Rect, Circle, ClipPath} from '@microsoft/react-native-svg-desktop';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);
export function Shimmer() {
  const leftValue = useState(new Animated.Value(0))[0]
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
      Animated.timing(leftValue, {
     toValue: 30,
     duration: 9000,
     delay:0,
     useNativeDriver:false
   })]),
  ).start()
  })
    return (
      <View style={styles.container}>
          <View>
            <Svg height="500" width="850" >
              <Defs>
                <AnimatedLinearGradient id="gradient" x1={leftValue} y1="0" x2="-1" y2="-1" >
                  <Stop offset="10%" stopColor="#E1E1E1" stopOpacity="1" />
                  <Stop offset="20%" stopColor="white" stopOpacity="1" />
                  <Stop offset="30%" stopColor="#E1E1E1" stopOpacity="1" />
                </AnimatedLinearGradient>
                <ClipPath id="shimmerView">
                <Circle cx="80" cy="80" r="55"/>
                <Rect x="150" y="30" width="450" height="25" rx="3" ry="3" />
                <Rect x="150" y="68" width="300" height="25" rx="3" ry="3"/>
                <Rect x="150" y="105" width="250" height="25" rx="3" ry="3"/>
                </ClipPath>
              </Defs>
              <Rect
                x="0"
                y="0"
                width="700"
                height="500"
                fill="url(#gradient)"
                clipPath="url(#shimmerView)"
              />
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