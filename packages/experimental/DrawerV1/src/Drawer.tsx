import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Modal, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';

const { height, width } = Dimensions.get('window');

const Drawer = ({ children, isVisible, onClose, position }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      Animated.spring(animatedValue, {
        toValue: 1,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.spring(animatedValue, {
        toValue: 0,
        useNativeDriver: false,
      }).start();
    }
  }, [animatedValue, isVisible]);

  const handleClose = () => {
    onClose();
  };

  const handleBackdropPress = () => {
    onClose();
  };

  const animatedTranslateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: position === 'left' ? [-width * 0.8, 0] : position === 'right' ? [width * 0.8, 0] : [0, 0],
  });

  const animatedTranslateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: position === 'top' ? [-height * 0.5, 0] : position === 'bottom' ? [height * 0.5, 0] : [0, 0],
  });

  const animatedOpacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.5],
  });

  const animatedElevation = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 5],
  });

  const animatedWidth = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: position === 'bottom' ? ['100%', '100%'] : position === 'left' || position === 'right' ? ['80%', '80%'] : ['100%', '100%'],
  });

  const animatedHeight = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: position === 'bottom' ? ['50%', '100%'] : ['100%', '100%'],
  });

  const animatedStyle = {
    transform: position === 'left' || position === 'right' ? [{ translateX: animatedTranslateX }] : [{ translateY: animatedTranslateY }],
    width: animatedWidth,
    height: animatedHeight,
    elevation: animatedElevation,
  };

  return (
    <>
      {isVisible && (
        <Modal
          visible={isVisible}
          onRequestClose={handleClose}
          supportedOrientations={['portrait', 'portrait-upside-down', 'landscape', 'landscape-left', 'landscape-right']}
          animationType="none"
          transparent
        >
          <TouchableWithoutFeedback onPress={handleBackdropPress}>
            <Animated.View style={[styles.backdrop, { opacity: animatedOpacity }]} />
          </TouchableWithoutFeedback>
          <Animated.View style={[styles.container, styles[position], animatedStyle]}>
            {position === 'bottom' && <View style={styles.dragger} />}
            {children}
            {position === 'top' && <View style={styles.dragger} />}
          </Animated.View>
        </Modal>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    zIndex: 1000,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    borderRadius: 10,
  },
  left: {
    left: 0,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  right: {
    right: 0,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  top: {
    top: 0,
  },
  bottom: {
    bottom: 0,
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 0,
  },
  dragger: {
    width: 40,
    height: 5,
    borderRadius: 10,
    backgroundColor: '#CCC',
    alignSelf: 'center',
    marginVertical: 10,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 999,
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
  },
});

export default Drawer;
