import * as React from 'react';
import { View, StyleSheet, TouchableWithoutFeedback } from 'react-native';

import { Text } from '@fluentui/react-native';
import { ButtonV1 as Button } from '@fluentui-react-native/button';
import { Slider } from '@miblanchard/react-native-slider';
import Video from 'react-native-video';

export const VideoPlayer: React.FunctionComponent = () => {
  const [currentTime, setCurrentTime] = React.useState(0);
  const [currentTimeString, setCurrentTimeString] = React.useState('00:00');
  const [duration, setDuration] = React.useState(1);
  const [loaded, setLoaded] = React.useState(false);
  const [paused, setPaused] = React.useState(true);
  const [progress, setProgress] = React.useState(0);
  const [muted, setMuted] = React.useState(true);
  const [volume, setVolume] = React.useState(50);
  const [infoStatus, setInfoStatus] = React.useState('');
  const [showControls, setShowControls] = React.useState(true);
  const videoRef = React.useRef(null);

  const GetCurrentTimeString = () => {
    const time = new Date(0);
    time.setSeconds(currentTime);
    return time.toISOString().substr(11, 8);
  };

  const UpdateCurrentTime = (time) => {
    setCurrentTime(time);
    setCurrentTimeString(GetCurrentTimeString());
  };

  const handleOnLoad = (event) => {
    setLoaded(true);
    setDuration(event.duration);
  };

  const handlePlayOnClick = () => {
    setPaused(!paused);
  };

  const handleOnProgress = (event) => {
    if (!loaded) return;

    const progress = Math.max(0, Math.min((event.currentTime / duration) * 100, 100));
    setProgress(progress);
    UpdateCurrentTime(event.currentTime);
    setInfoStatus('progress' + JSON.stringify(event));
  };

  const handleOnSeek = (event) => {
    if (!loaded) return;

    const progress = Math.max(0, Math.min((event.currentTime / duration) * 100, 100));
    setProgress(progress);
    UpdateCurrentTime(event.currentTime);
    setInfoStatus('seek' + JSON.stringify(event));
  };

  const handleOnValueChanged = (value) => {
    videoRef.current.seek((value[0] / 100) * duration);
  };

  const muteSymbol = muted ? '🔇' : '🔈';

  const handleOnMute = () => {
    setMuted(!muted);
  };

  const handleOnVolumeChange = (value) => {
    setVolume(value);
  };

  const sliderStyle = StyleSheet.create({
    container: {
      flex: 10,
      marginLeft: 5,
      marginRight: 5,
      alignItems: 'stretch',
      justifyContent: 'center',
      alignSelf: 'baseline',
    },
  });

  return (
    <View style={{ flexDirection: 'column' }}>
      <Text>{infoStatus}</Text>
      <View style={{ flexDirection: 'column', flexGrow: 0, flexShrink: 0, flex: 0, margin: 20 }}>
        <TouchableWithoutFeedback onPress={() => setShowControls(!showControls)}>
          <View
            style={{
              flexDirection: 'column',
              justifyContent: 'flex-end',
              width: 500,
              height: 256,
              flex: 1,
              marginLeft: 10,
              marginRight: 10,
              alignItems: 'stretch',
            }}
          >
            <Video
              style={{
                width: 512,
                height: 256,
                position: 'absolute',
              }}
              paused={paused}
              muted={muted}
              repeat={true}
              source={{ uri: 'http://tokki:8011/BigBuckBunny-360.m4v' }}
              onProgress={handleOnProgress}
              onSeek={handleOnSeek}
              onLoad={handleOnLoad}
              progressUpdateInterval={200}
              ref={videoRef}
              volume={volume / 100.0}
            />

            <View
              style={{
                position: 'relative',
                justifyContent: 'flex-end',
                alignItems: 'stretch',
                flex: 1,
                padding: 10,
              }}
            >
              {/* Controls */}
              {showControls && (
                <View
                  style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
                >
                  {/* Transport controls */}
                  <View style={{ flexDirection: 'row', position: 'relative', flex: 2, alignItems: 'center' }}>
                    {/* Play/Pause */}
                    <Button
                      style={{ flex: 1, alignSelf: 'stretch' }}
                      appearance="subtle"
                      size="small"
                      shape="circular"
                      onClick={handlePlayOnClick}
                    >
                      ⏯
                    </Button>
                    {/* Scrubber */}
                    <Slider
                      containerStyle={sliderStyle.container}
                      minimumValue={0}
                      maximumValue={100}
                      value={progress}
                      onValueChange={handleOnValueChanged}
                    />
                    {/* Time */}
                    <Text style={{ alignSelf: 'center', textAlign: 'center', color: 'white' }}> {currentTimeString} </Text>
                  </View>

                  {/* Volume */}
                  <View style={{ flexDirection: 'row', position: 'relative', flex: 1, alignItems: 'center', justifyContent: 'flex-start' }}>
                    <Button
                      style={{ flex: 1, alignSelf: 'stretch' }}
                      appearance="subtle"
                      size="small"
                      shape="circular"
                      onClick={handleOnMute}
                    >
                      {muteSymbol}
                    </Button>
                    <Slider
                      containerStyle={sliderStyle.container}
                      minimumValue={0}
                      maximumValue={100}
                      value={volume}
                      onValueChange={handleOnVolumeChange}
                    />
                  </View>
                </View>
              )}
            </View>
          </View>
        </TouchableWithoutFeedback>
        {/* <Text>End</Text> */}
      </View>
    </View>
  );
};

export default VideoPlayer;
