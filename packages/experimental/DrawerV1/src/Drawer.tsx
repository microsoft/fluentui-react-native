import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Modal, PanResponder, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';

const { height, width } = Dimensions.get('window');

const Drawer = ({ children, isVisible, onClose, position }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
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
    outputRange: [height, height * 0.5],
  });

  const animatedOpacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.5],
  });

  const animatedElevation = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 5],
  });

  const animatedStyle = {
    transform: position === 'left' || position === 'right' ? [{ translateX: animatedTranslateX }] : [{ translateY: animatedTranslateY }],

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
  },
  left: {
    left: 0,
    height: '100%',
    width: '50%',
  },
  right: {
    right: 0,
    height: '100%',
    width: '50%',
  },

  bottom: {
    bottom: 0,
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    width: '100%',
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
