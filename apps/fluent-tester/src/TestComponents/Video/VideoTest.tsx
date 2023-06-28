import * as React from 'react';
import { View } from 'react-native';

import { VideoPlayer } from '@fluentui-react-native/experimental-videoplayer';

import { VIDEO_TESTPAGE } from '../../../../E2E/src/Video/consts';
import { Test } from '../Test';
import type { TestSection, PlatformStatus } from '../Test';

const VideoTest1: React.FunctionComponent = () => {
  return (
    <View style={{ flexDirection: 'column' }}>
      <VideoPlayer />
    </View>
  );
};

const videoSections: TestSection[] = [
  {
    name: 'Rect',
    testID: VIDEO_TESTPAGE,
    component: VideoTest1,
  },
];

export const VideoTest: React.FunctionComponent = () => {
  const status: PlatformStatus = {
    win32Status: 'Beta',
    uwpStatus: 'Backlog',
    iosStatus: 'Backlog',
    macosStatus: 'Backlog',
    androidStatus: 'Backlog',
  };

  const description = 'Playground for video control development and testing';

  return <Test name="Video Tests" description={description} sections={videoSections} status={status} />;
};
