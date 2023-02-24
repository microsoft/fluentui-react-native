import * as React from 'react';
import { /* Text, */ View } from 'react-native';

import { faMountainCity } from '@fortawesome/free-solid-svg-icons/faMountainCity';
import { faMugHot } from '@fortawesome/free-solid-svg-icons/faMugHot';
import { faMugSaucer } from '@fortawesome/free-solid-svg-icons/faMugSaucer';
import { faSquareCheck } from '@fortawesome/free-solid-svg-icons/faSquareCheck';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  AccessTime20Filled,
  AccessTime20Regular,
  AccessTime24Filled,
  AccessTime24Regular,
  Accessibility16Filled,
  Accessibility16Regular,
  Accessibility20Filled,
  Accessibility20Regular,
  Accessibility24Filled,
  Accessibility24Regular,
  Accessibility28Filled,
  Accessibility28Regular,
  Accessibility32Filled,
  Accessibility32Regular,
  Accessibility48Filled,
  Accessibility48Regular,
  AccessibilityCheckmark20Filled,
  AccessibilityCheckmark20Regular,
  AccessibilityCheckmark24Filled,
  AccessibilityCheckmark24Regular,
  AccessibilityCheckmark28Filled,
  AccessibilityCheckmark28Regular,
  AccessibilityCheckmark32Filled,
  AccessibilityCheckmark32Regular,
  AccessibilityCheckmark48Filled,
  AccessibilityCheckmark48Regular,
  Add12Filled,
  Add12Regular,
  Add16Filled,
  Add16Regular,
  Add20Filled,
  Add20Regular,
  Add24Filled,
  Add24Regular,
  Add28Filled,
  Add28Regular,
  AddCircle12Filled,
  AddCircle12Regular,
  AddCircle16Filled,
  AddCircle16Regular,
  AddCircle20Filled,
  AddCircle20Regular,
  AddCircle24Filled,
  AddCircle24Regular,
  AddCircle28Filled,
  AddCircle28Regular,
  AddCircle32Filled,
  AddCircle32Regular,
  AddSquare20Filled,
  AddSquare20Regular,
  AddSquare24Filled,
  AddSquare24Regular,
  AddSquareMultiple16Filled,
  AddSquareMultiple16Regular,
  AddSquareMultiple20Filled,
  AddSquareMultiple20Regular,
  AddSubtractCircle16Filled,
  AddSubtractCircle16Regular,
  AddSubtractCircle20Filled,
  AddSubtractCircle20Regular,
  AddSubtractCircle24Filled,
  AddSubtractCircle24Regular,
  AddSubtractCircle28Filled,
  AddSubtractCircle28Regular,
  AddSubtractCircle48Filled,
  AddSubtractCircle48Regular,
  Airplane20Filled,
  Airplane20Regular,
  Airplane24Filled,
  Airplane24Regular,
  AirplaneTakeOff16Filled,
  AirplaneTakeOff16Regular,
  AirplaneTakeOff20Filled,
  AirplaneTakeOff20Regular,
  AirplaneTakeOff24Filled,
  AirplaneTakeOff24Regular,
  Album20Filled,
  Album20Regular,
  Album24Filled,
  Album24Regular,
  AlbumAdd20Filled,
  AlbumAdd20Regular,
  AlbumAdd24Filled,
  AlbumAdd24Regular,
  Alert12Filled,
  Alert12Regular,
  Alert16Filled,
  Alert16Regular,
  Alert20Filled,
  Alert20Regular,
  Alert24Filled,
  Alert24Regular,
  Alert28Filled,
  Alert28Regular,
  Alert32Filled,
  Alert32Regular,
  Alert48Filled,
  Alert48Regular,
  AlertBadge16Filled,
  AlertBadge16Regular,
  AlertBadge20Filled,
  AlertBadge20Regular,
  AlertBadge24Filled,
  AlertBadge24Regular,
  AlertOff16Filled,
  AlertOff16Regular,
  AlertOff20Filled,
  AlertOff20Regular,
  AlertOff24Filled,
  AlertOff24Regular,
  AlertOff28Filled,
  AlertOff28Regular,
  AlertOn20Filled,
  AlertOn20Regular,
  AlertOn24Filled,
  AlertOn24Regular,
  AlertSnooze12Filled,
  AlertSnooze12Regular,
  AlertSnooze16Filled,
  AlertSnooze16Regular,
  AlertSnooze20Filled,
  AlertSnooze20Regular,
  AlertSnooze24Filled,
  AlertSnooze24Regular,
  AlertUrgent16Filled,
  AlertUrgent16Regular,
  AlertUrgent20Filled,
  AlertUrgent20Regular,
  AlertUrgent24Filled,
  AlertUrgent24Regular,
  AlignBottom16Filled,
  AlignBottom16Regular,
  AlignBottom20Filled,
  AlignBottom20Regular,
  AlignBottom24Filled,
  AlignBottom24Regular,
  AlignBottom28Filled,
  AlignBottom28Regular,
  AlignBottom32Filled,
  AlignBottom32Regular,
  AlignBottom48Filled,
  AlignBottom48Regular,
  AlignCenterHorizontal16Filled,
  AlignCenterHorizontal16Regular,
  AlignCenterHorizontal20Filled,
  AlignCenterHorizontal20Regular,
  AlignCenterHorizontal24Filled,
  AlignCenterHorizontal24Regular,
  AlignCenterHorizontal28Filled,
  AlignCenterHorizontal28Regular,
  AlignCenterHorizontal32Filled,
  AlignCenterHorizontal32Regular,
  AlignCenterHorizontal48Filled,
  AlignCenterHorizontal48Regular,
  AlignCenterVertical16Filled,
  AlignCenterVertical16Regular,
  AlignCenterVertical20Filled,
  AlignCenterVertical20Regular,
  AlignCenterVertical24Filled,
  AlignCenterVertical24Regular,
  AlignCenterVertical28Filled,
  AlignCenterVertical28Regular,
  AlignCenterVertical32Filled,
  AlignCenterVertical32Regular,
  AlignCenterVertical48Filled,
  AlignCenterVertical48Regular,
  AlignDistributeBottom16Filled,
  AlignDistributeBottom16Regular,
  AlignDistributeLeft16Filled,
  AlignDistributeLeft16Regular,
  AlignDistributeRight16Filled,
  AlignDistributeRight16Regular,
  AlignDistributeTop16Filled,
  AlignDistributeTop16Regular,
  AlignEndHorizontal20Filled,
  AlignEndHorizontal20Regular,
  AlignEndVertical20Filled,
  AlignEndVertical20Regular,
  AlignLeft16Filled,
  AlignLeft16Regular,
  AlignLeft20Filled,
  AlignLeft20Regular,
  AlignLeft24Filled,
  AlignLeft24Regular,
  AlignLeft28Filled,
  AlignLeft28Regular,
  AlignLeft32Filled,
  AlignLeft32Regular,
  AlignLeft48Filled,
  AlignLeft48Regular,
  AlignRight16Filled,
  AlignRight16Regular,
  AlignRight20Filled,
  AlignRight20Regular,
  AlignRight24Filled,
  AlignRight24Regular,
  AlignRight28Filled,
  AlignRight28Regular,
  AlignRight32Filled,
  AlignRight32Regular,
  AlignRight48Filled,
  AlignRight48Regular,
  AlignSpaceAroundHorizontal20Filled,
  AlignSpaceAroundHorizontal20Regular,
  AlignSpaceAroundVertical20Filled,
  AlignSpaceAroundVertical20Regular,
  AlignSpaceBetweenHorizontal20Filled,
  AlignSpaceBetweenHorizontal20Regular,
  AlignSpaceBetweenVertical20Filled,
  AlignSpaceBetweenVertical20Regular,
  AlignSpaceEvenlyHorizontal20Filled,
  AlignSpaceEvenlyHorizontal20Regular,
  AlignSpaceEvenlyVertical20Filled,
  AlignSpaceEvenlyVertical20Regular,
  AlignSpaceFitVertical20Filled,
  AlignSpaceFitVertical20Regular,
  AlignStartHorizontal20Filled,
  AlignStartHorizontal20Regular,
  AlignStartVertical20Filled,
  AlignStartVertical20Regular,
  AlignStretchHorizontal16Filled,
  AlignStretchHorizontal16Regular,
  AlignStretchHorizontal20Filled,
  AlignStretchHorizontal20Regular,
  AlignStretchVertical16Filled,
  AlignStretchVertical16Regular,
  AlignStretchVertical20Filled,
  AlignStretchVertical20Regular,
  AlignTop16Filled,
  AlignTop16Regular,
  AlignTop20Filled,
  AlignTop20Regular,
  AlignTop24Filled,
  AlignTop24Regular,
  AlignTop28Filled,
  AlignTop28Regular,
  AlignTop32Filled,
  AlignTop32Regular,
  AlignTop48Filled,
  AlignTop48Regular,
  AnimalCat16Filled,
  AnimalCat16Regular,
  AnimalCat20Filled,
  AnimalCat20Regular,
  AnimalCat24Filled,
  AnimalCat24Regular,
  AnimalCat28Filled,
  AnimalCat28Regular,
  AnimalDog16Filled,
  AnimalDog16Regular,
  AnimalDog20Filled,
  AnimalDog20Regular,
  AnimalDog24Filled,
  AnimalDog24Regular,
  AnimalRabbit16Filled,
  AnimalRabbit16Regular,
  AnimalRabbit20Filled,
  AnimalRabbit20Regular,
  AnimalRabbit24Filled,
  AnimalRabbit24Regular,
  AnimalRabbit28Filled,
  AnimalRabbit28Regular,
  AnimalRabbit32Filled,
  AnimalRabbit32Regular,
  AnimalRabbitOff20Filled,
  AnimalRabbitOff20Regular,
  AnimalRabbitOff32Filled,
  AnimalRabbitOff32Regular,
  AnimalTurtle16Filled,
  AnimalTurtle16Regular,
  AnimalTurtle20Filled,
  AnimalTurtle20Regular,
  AnimalTurtle24Filled,
  AnimalTurtle24Regular,
  AnimalTurtle28Filled,
  AnimalTurtle28Regular,
  AppFolder16Filled,
  AppFolder16Regular,
  AppFolder20Filled,
  AppFolder20Regular,
  AppFolder24Filled,
  AppFolder24Regular,
  AppFolder28Filled,
  AppFolder28Regular,
  AppFolder32Filled,
  AppFolder32Regular,
  AppFolder48Filled,
  AppFolder48Regular,
  AppGeneric20Filled,
  AppGeneric20Regular,
  AppGeneric24Filled,
  AppGeneric24Regular,
  AppGeneric32Filled,
  AppGeneric32Regular,
  AppRecent20Filled,
  AppRecent20Regular,
  AppRecent24Filled,
  AppRecent24Regular,
  AppStore24Filled,
  AppStore24Regular,
  AppTitle20Filled,
  AppTitle20Regular,
  AppTitle24Filled,
  AppTitle24Regular,
  ApprovalsApp16Filled,
  ApprovalsApp16Regular,
  ApprovalsApp20Filled,
  ApprovalsApp20Regular,
  ApprovalsApp24Filled,
  ApprovalsApp24Regular,
  ApprovalsApp28Filled,
  ApprovalsApp28Regular,
  ApprovalsApp32Filled,
  ApprovalsApp32Regular,
  Apps16Filled,
  Apps16Regular,
  Apps20Filled,
  Apps20Regular,
  Apps24Filled,
  Apps24Regular,
  Apps28Filled,
  Apps28Regular,
  Apps32Filled,
  Apps32Regular,
  AppsAddIn16Filled,
  AppsAddIn16Regular,
  AppsAddIn20Filled,
  AppsAddIn20Regular,
  AppsAddIn24Filled,
  AppsAddIn24Regular,
  AppsAddIn28Filled,
  AppsAddIn28Regular,
  AppsList20Filled,
  AppsList20Regular,
  AppsList24Filled,
  AppsList24Regular,
  AppsListDetail20Filled,
  AppsListDetail20Regular,
  AppsListDetail24Filled,
  AppsListDetail24Regular,
  Archive16Filled,
  Archive16Regular,
  Archive20Filled,
  Archive20Regular,
  Archive24Filled,
  Archive24Regular,
  Archive28Filled,
  Archive28Regular,
  Archive32Filled,
  Archive32Regular,
  Archive48Filled,
  Archive48Regular,
  ArchiveArrowBack16Filled,
  ArchiveArrowBack16Regular,
  ArchiveArrowBack20Filled,
  ArchiveArrowBack20Regular,
  ArchiveArrowBack24Filled,
  ArchiveArrowBack24Regular,
  ArchiveArrowBack28Filled,
  ArchiveArrowBack28Regular,
  ArchiveArrowBack32Filled,
  ArchiveArrowBack32Regular,
  ArchiveArrowBack48Filled,
  ArchiveArrowBack48Regular,
  ArchiveMultiple16Filled,
  ArchiveMultiple16Regular,
  ArchiveMultiple20Filled,
  ArchiveMultiple20Regular,
  ArchiveMultiple24Filled,
  ArchiveMultiple24Regular,
  ArchiveSettings16Filled,
  ArchiveSettings16Regular,
  ArchiveSettings20Filled,
  ArchiveSettings20Regular,
  ArchiveSettings24Filled,
  ArchiveSettings24Regular,
  ArchiveSettings28Filled,
  ArchiveSettings28Regular,
  ArrowAutofitContent20Filled,
  ArrowAutofitContent20Regular,
  ArrowAutofitContent24Filled,
  ArrowAutofitContent24Regular,
  ArrowAutofitDown20Filled,
  ArrowAutofitDown20Regular,
  ArrowAutofitDown24Filled,
  ArrowAutofitDown24Regular,
  ArrowAutofitHeight20Filled,
  ArrowAutofitHeight20Regular,
  ArrowAutofitHeight24Filled,
  ArrowAutofitHeight24Regular,
  ArrowAutofitHeightDotted20Filled,
  ArrowAutofitHeightDotted20Regular,
  ArrowAutofitHeightDotted24Filled,
  ArrowAutofitHeightDotted24Regular,
  ArrowAutofitUp20Filled,
  ArrowAutofitUp20Regular,
  ArrowAutofitUp24Filled,
  ArrowAutofitUp24Regular,
  ArrowAutofitWidth20Filled,
  ArrowAutofitWidth20Regular,
  ArrowAutofitWidth24Filled,
  ArrowAutofitWidth24Regular,
  ArrowAutofitWidthDotted20Filled,
  ArrowAutofitWidthDotted20Regular,
  ArrowAutofitWidthDotted24Filled,
  ArrowAutofitWidthDotted24Regular,
  ArrowBetweenDown20Filled,
  ArrowBetweenDown20Regular,
  ArrowBetweenDown24Filled,
  ArrowBetweenDown24Regular,
  ArrowBetweenUp20Filled,
  ArrowBetweenUp20Regular,
  ArrowBidirectionalUpDown12Filled,
  ArrowBidirectionalUpDown12Regular,
  ArrowBidirectionalUpDown16Filled,
  ArrowBidirectionalUpDown16Regular,
  ArrowBidirectionalUpDown20Filled,
  ArrowBidirectionalUpDown20Regular,
  ArrowBidirectionalUpDown24Filled,
  ArrowBidirectionalUpDown24Regular,
  ArrowBounce16Filled,
  ArrowBounce16Regular,
  ArrowBounce20Filled,
  ArrowBounce20Regular,
  ArrowBounce24Filled,
  ArrowBounce24Regular,
  ArrowCircleDown12Filled,
  ArrowCircleDown12Regular,
  ArrowCircleDown16Filled,
  ArrowCircleDown16Regular,
  ArrowCircleDown20Filled,
  ArrowCircleDown20Regular,
  ArrowCircleDown24Filled,
  ArrowCircleDown24Regular,
  ArrowCircleDown28Filled,
  ArrowCircleDown28Regular,
  ArrowCircleDown32Filled,
  ArrowCircleDown32Regular,
  ArrowCircleDown48Filled,
  ArrowCircleDown48Regular,
  ArrowCircleDownDouble20Filled,
  ArrowCircleDownDouble20Regular,
  ArrowCircleDownDouble24Filled,
  ArrowCircleDownDouble24Regular,
  ArrowCircleDownRight16Filled,
  ArrowCircleDownRight16Regular,
  ArrowCircleDownRight20Filled,
  ArrowCircleDownRight20Regular,
  ArrowCircleDownRight24Filled,
  ArrowCircleDownRight24Regular,
  ArrowCircleDownSplit20Filled,
  ArrowCircleDownSplit20Regular,
  ArrowCircleDownSplit24Filled,
  ArrowCircleDownSplit24Regular,
  ArrowCircleDownUp20Filled,
  ArrowCircleDownUp20Regular,
  ArrowCircleLeft12Filled,
  ArrowCircleLeft12Regular,
  ArrowCircleLeft16Filled,
  ArrowCircleLeft16Regular,
  ArrowCircleLeft20Filled,
  ArrowCircleLeft20Regular,
  ArrowCircleLeft24Filled,
  ArrowCircleLeft24Regular,
  ArrowCircleLeft28Filled,
  ArrowCircleLeft28Regular,
  ArrowCircleLeft32Filled,
  ArrowCircleLeft32Regular,
  ArrowCircleLeft48Filled,
  ArrowCircleLeft48Regular,
  ArrowCircleRight12Filled,
  ArrowCircleRight12Regular,
  ArrowCircleRight16Filled,
  ArrowCircleRight16Regular,
  ArrowCircleRight20Filled,
  ArrowCircleRight20Regular,
  ArrowCircleRight24Filled,
  ArrowCircleRight24Regular,
  ArrowCircleRight28Filled,
  ArrowCircleRight28Regular,
  ArrowCircleRight32Filled,
  ArrowCircleRight32Regular,
  ArrowCircleRight48Filled,
  ArrowCircleRight48Regular,
  ArrowCircleUp12Filled,
  ArrowCircleUp12Regular,
  ArrowCircleUp16Filled,
  ArrowCircleUp16Regular,
  ArrowCircleUp20Filled,
  ArrowCircleUp20Regular,
  ArrowCircleUp24Filled,
  ArrowCircleUp24Regular,
  ArrowCircleUp28Filled,
  ArrowCircleUp28Regular,
  ArrowCircleUp32Filled,
  ArrowCircleUp32Regular,
  ArrowCircleUp48Filled,
  ArrowCircleUp48Regular,
  ArrowCircleUpLeft20Filled,
  ArrowCircleUpLeft20Regular,
} from '@warren-ms/react-native-icons';

import { RNSVGIcons_TESTPAGE } from '../../../../E2E/src/Svg/consts';
import type { TestSection, PlatformStatus } from '../Test';
import { Test } from '../Test';

const FontAwesomeTest: React.FunctionComponent = () => {
  return (
    <React.Fragment>
      <View style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
        <View style={{ flexDirection: 'row' }}>
          <FontAwesomeIcon icon={faMugSaucer} color={'blue'} size={64} />
          <FontAwesomeIcon icon={faSquareCheck} color={'blue'} size={64} />
          <FontAwesomeIcon icon={faMugHot} color={'orange'} size={64} />
          <FontAwesomeIcon icon={faMountainCity} color={'orange'} size={64} />
        </View>
      </View>
    </React.Fragment>
  );
};
const FluentIconsTest: React.FunctionComponent = () => {
  return (
    <React.Fragment>
      <View style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
        <View style={{ flexDirection: 'row' }}>
          <AccessTime20Filled />
          <AccessTime20Regular />
          <AccessTime24Filled />
          <AccessTime24Regular />
          <Accessibility16Filled />
          <Accessibility16Regular />
          <Accessibility20Filled />
          <Accessibility20Regular />
          <Accessibility24Filled />
          <Accessibility24Regular />
          <Accessibility28Filled />
          <Accessibility28Regular />
          <Accessibility32Filled />
          <Accessibility32Regular />
          <Accessibility48Filled />
          <Accessibility48Regular />
          <AccessibilityCheckmark20Filled />
          <AccessibilityCheckmark20Regular />
          <AccessibilityCheckmark24Filled />
          <AccessibilityCheckmark24Regular />
        </View>
        <View style={{ flexDirection: 'row' }}>
          <AccessibilityCheckmark28Filled />
          <AccessibilityCheckmark28Regular />
          <AccessibilityCheckmark32Filled />
          <AccessibilityCheckmark32Regular />
          <AccessibilityCheckmark48Filled />
          <AccessibilityCheckmark48Regular />
          <Add12Filled />
          <Add12Regular />
          <Add16Filled />
          <Add16Regular />
          <Add20Filled />
          <Add20Regular />
          <Add24Filled />
          <Add24Regular />
          <Add28Filled />
          <Add28Regular />
          <AddCircle12Filled />
          <AddCircle12Regular />
          <AddCircle16Filled />
          <AddCircle16Regular />
        </View>
        <View style={{ flexDirection: 'row' }}>
          <AddCircle20Filled />
          <AddCircle20Regular />
          <AddCircle24Filled />
          <AddCircle24Regular />
          <AddCircle28Filled />
          <AddCircle28Regular />
          <AddCircle32Filled />
          <AddCircle32Regular />
          <AddSquare20Filled />
          <AddSquare20Regular />
          <AddSquare24Filled />
          <AddSquare24Regular />
          <AddSquareMultiple16Filled />
          <AddSquareMultiple16Regular />
          <AddSquareMultiple20Filled />
          <AddSquareMultiple20Regular />
          <AddSubtractCircle16Filled />
          <AddSubtractCircle16Regular />
          <AddSubtractCircle20Filled />
          <AddSubtractCircle20Regular />
        </View>
        <View style={{ flexDirection: 'row' }}>
          <AddSubtractCircle24Filled />
          <AddSubtractCircle24Regular />
          <AddSubtractCircle28Filled />
          <AddSubtractCircle28Regular />
          <AddSubtractCircle48Filled />
          <AddSubtractCircle48Regular />
          <Airplane20Filled />
          <Airplane20Regular />
          <Airplane24Filled />
          <Airplane24Regular />
          <AirplaneTakeOff16Filled />
          <AirplaneTakeOff16Regular />
          <AirplaneTakeOff20Filled />
          <AirplaneTakeOff20Regular />
          <AirplaneTakeOff24Filled />
          <AirplaneTakeOff24Regular />
          <Album20Filled />
          <Album20Regular />
          <Album24Filled />
          <Album24Regular />
        </View>
        <View style={{ flexDirection: 'row' }}>
          <AlbumAdd20Filled />
          <AlbumAdd20Regular />
          <AlbumAdd24Filled />
          <AlbumAdd24Regular />
          <Alert12Filled />
          <Alert12Regular />
          <Alert16Filled />
          <Alert16Regular />
          <Alert20Filled />
          <Alert20Regular />
          <Alert24Filled />
          <Alert24Regular />
          <Alert28Filled />
          <Alert28Regular />
          <Alert32Filled />
          <Alert32Regular />
          <Alert48Filled />
          <Alert48Regular />
          <AlertBadge16Filled />
          <AlertBadge16Regular />
        </View>
        <View style={{ flexDirection: 'row' }}>
          <AlertBadge20Filled />
          <AlertBadge20Regular />
          <AlertBadge24Filled />
          <AlertBadge24Regular />
          <AlertOff16Filled />
          <AlertOff16Regular />
          <AlertOff20Filled />
          <AlertOff20Regular />
          <AlertOff24Filled />
          <AlertOff24Regular />
          <AlertOff28Filled />
          <AlertOff28Regular />
          <AlertOn20Filled />
          <AlertOn20Regular />
          <AlertOn24Filled />
          <AlertOn24Regular />
          <AlertSnooze12Filled />
          <AlertSnooze12Regular />
          <AlertSnooze16Filled />
          <AlertSnooze16Regular />
        </View>
        <View style={{ flexDirection: 'row' }}>
          <AlertSnooze20Filled />
          <AlertSnooze20Regular />
          <AlertSnooze24Filled />
          <AlertSnooze24Regular />
          <AlertUrgent16Filled />
          <AlertUrgent16Regular />
          <AlertUrgent20Filled />
          <AlertUrgent20Regular />
          <AlertUrgent24Filled />
          <AlertUrgent24Regular />
          <AlignBottom16Filled />
          <AlignBottom16Regular />
          <AlignBottom20Filled />
          <AlignBottom20Regular />
          <AlignBottom24Filled />
          <AlignBottom24Regular />
          <AlignBottom28Filled />
          <AlignBottom28Regular />
          <AlignBottom32Filled />
          <AlignBottom32Regular />
        </View>
        <View style={{ flexDirection: 'row' }}>
          <AlignBottom48Filled />
          <AlignBottom48Regular />
          <AlignCenterHorizontal16Filled />
          <AlignCenterHorizontal16Regular />
          <AlignCenterHorizontal20Filled />
          <AlignCenterHorizontal20Regular />
          <AlignCenterHorizontal24Filled />
          <AlignCenterHorizontal24Regular />
          <AlignCenterHorizontal28Filled />
          <AlignCenterHorizontal28Regular />
          <AlignCenterHorizontal32Filled />
          <AlignCenterHorizontal32Regular />
          <AlignCenterHorizontal48Filled />
          <AlignCenterHorizontal48Regular />
          <AlignCenterVertical16Filled />
          <AlignCenterVertical16Regular />
          <AlignCenterVertical20Filled />
          <AlignCenterVertical20Regular />
          <AlignCenterVertical24Filled />
          <AlignCenterVertical24Regular />
        </View>
        <View style={{ flexDirection: 'row' }}>
          <AlignCenterVertical28Filled />
          <AlignCenterVertical28Regular />
          <AlignCenterVertical32Filled />
          <AlignCenterVertical32Regular />
          <AlignCenterVertical48Filled />
          <AlignCenterVertical48Regular />
          <AlignDistributeBottom16Filled />
          <AlignDistributeBottom16Regular />
          <AlignDistributeLeft16Filled />
          <AlignDistributeLeft16Regular />
          <AlignDistributeRight16Filled />
          <AlignDistributeRight16Regular />
          <AlignDistributeTop16Filled />
          <AlignDistributeTop16Regular />
          <AlignEndHorizontal20Filled />
          <AlignEndHorizontal20Regular />
          <AlignEndVertical20Filled />
          <AlignEndVertical20Regular />
          <AlignLeft16Filled />
          <AlignLeft16Regular />
        </View>
        <View style={{ flexDirection: 'row' }}>
          <AlignLeft20Filled />
          <AlignLeft20Regular />
          <AlignLeft24Filled />
          <AlignLeft24Regular />
          <AlignLeft28Filled />
          <AlignLeft28Regular />
          <AlignLeft32Filled />
          <AlignLeft32Regular />
          <AlignLeft48Filled />
          <AlignLeft48Regular />
          <AlignRight16Filled />
          <AlignRight16Regular />
          <AlignRight20Filled />
          <AlignRight20Regular />
          <AlignRight24Filled />
          <AlignRight24Regular />
          <AlignRight28Filled />
          <AlignRight28Regular />
          <AlignRight32Filled />
          <AlignRight32Regular />
        </View>
        <View style={{ flexDirection: 'row' }}>
          <AlignRight48Filled />
          <AlignRight48Regular />
          <AlignSpaceAroundHorizontal20Filled />
          <AlignSpaceAroundHorizontal20Regular />
          <AlignSpaceAroundVertical20Filled />
          <AlignSpaceAroundVertical20Regular />
          <AlignSpaceBetweenHorizontal20Filled />
          <AlignSpaceBetweenHorizontal20Regular />
          <AlignSpaceBetweenVertical20Filled />
          <AlignSpaceBetweenVertical20Regular />
          <AlignSpaceEvenlyHorizontal20Filled />
          <AlignSpaceEvenlyHorizontal20Regular />
          <AlignSpaceEvenlyVertical20Filled />
          <AlignSpaceEvenlyVertical20Regular />
          <AlignSpaceFitVertical20Filled />
          <AlignSpaceFitVertical20Regular />
          <AlignStartHorizontal20Filled />
          <AlignStartHorizontal20Regular />
          <AlignStartVertical20Filled />
          <AlignStartVertical20Regular />
        </View>
        <View style={{ flexDirection: 'row' }}>
          <AlignStretchHorizontal16Filled />
          <AlignStretchHorizontal16Regular />
          <AlignStretchHorizontal20Filled />
          <AlignStretchHorizontal20Regular />
          <AlignStretchVertical16Filled />
          <AlignStretchVertical16Regular />
          <AlignStretchVertical20Filled />
          <AlignStretchVertical20Regular />
          <AlignTop16Filled />
          <AlignTop16Regular />
          <AlignTop20Filled />
          <AlignTop20Regular />
          <AlignTop24Filled />
          <AlignTop24Regular />
          <AlignTop28Filled />
          <AlignTop28Regular />
          <AlignTop32Filled />
          <AlignTop32Regular />
          <AlignTop48Filled />
          <AlignTop48Regular />
        </View>
        <View style={{ flexDirection: 'row' }}>
          <AnimalCat16Filled />
          <AnimalCat16Regular />
          <AnimalCat20Filled />
          <AnimalCat20Regular />
          <AnimalCat24Filled />
          <AnimalCat24Regular />
          <AnimalCat28Filled />
          <AnimalCat28Regular />
          <AnimalDog16Filled />
          <AnimalDog16Regular />
          <AnimalDog20Filled />
          <AnimalDog20Regular />
          <AnimalDog24Filled />
          <AnimalDog24Regular />
          <AnimalRabbit16Filled />
          <AnimalRabbit16Regular />
          <AnimalRabbit20Filled />
          <AnimalRabbit20Regular />
          <AnimalRabbit24Filled />
          <AnimalRabbit24Regular />
        </View>
        <View style={{ flexDirection: 'row' }}>
          <AnimalRabbit28Filled />
          <AnimalRabbit28Regular />
          <AnimalRabbit32Filled />
          <AnimalRabbit32Regular />
          <AnimalRabbitOff20Filled />
          <AnimalRabbitOff20Regular />
          <AnimalRabbitOff32Filled />
          <AnimalRabbitOff32Regular />
          <AnimalTurtle16Filled />
          <AnimalTurtle16Regular />
          <AnimalTurtle20Filled />
          <AnimalTurtle20Regular />
          <AnimalTurtle24Filled />
          <AnimalTurtle24Regular />
          <AnimalTurtle28Filled />
          <AnimalTurtle28Regular />
          <AppFolder16Filled />
          <AppFolder16Regular />
          <AppFolder20Filled />
          <AppFolder20Regular />
        </View>
        <View style={{ flexDirection: 'row' }}>
          <AppFolder24Filled />
          <AppFolder24Regular />
          <AppFolder28Filled />
          <AppFolder28Regular />
          <AppFolder32Filled />
          <AppFolder32Regular />
          <AppFolder48Filled />
          <AppFolder48Regular />
          <AppGeneric20Filled />
          <AppGeneric20Regular />
          <AppGeneric24Filled />
          <AppGeneric24Regular />
          <AppGeneric32Filled />
          <AppGeneric32Regular />
          <AppRecent20Filled />
          <AppRecent20Regular />
          <AppRecent24Filled />
          <AppRecent24Regular />
          <AppStore24Filled />
          <AppStore24Regular />
        </View>
        <View style={{ flexDirection: 'row' }}>
          <AppTitle20Filled />
          <AppTitle20Regular />
          <AppTitle24Filled />
          <AppTitle24Regular />
          <ApprovalsApp16Filled />
          <ApprovalsApp16Regular />
          <ApprovalsApp20Filled />
          <ApprovalsApp20Regular />
          <ApprovalsApp24Filled />
          <ApprovalsApp24Regular />
          <ApprovalsApp28Filled />
          <ApprovalsApp28Regular />
          <ApprovalsApp32Filled />
          <ApprovalsApp32Regular />
          <Apps16Filled />
          <Apps16Regular />
          <Apps20Filled />
          <Apps20Regular />
          <Apps24Filled />
          <Apps24Regular />
        </View>
        <View style={{ flexDirection: 'row' }}>
          <Apps28Filled />
          <Apps28Regular />
          <Apps32Filled />
          <Apps32Regular />
          <AppsAddIn16Filled />
          <AppsAddIn16Regular />
          <AppsAddIn20Filled />
          <AppsAddIn20Regular />
          <AppsAddIn24Filled />
          <AppsAddIn24Regular />
          <AppsAddIn28Filled />
          <AppsAddIn28Regular />
          <AppsList20Filled />
          <AppsList20Regular />
          <AppsList24Filled />
          <AppsList24Regular />
          <AppsListDetail20Filled />
          <AppsListDetail20Regular />
          <AppsListDetail24Filled />
          <AppsListDetail24Regular />
        </View>
        <View style={{ flexDirection: 'row' }}>
          <Archive16Filled />
          <Archive16Regular />
          <Archive20Filled />
          <Archive20Regular />
          <Archive24Filled />
          <Archive24Regular />
          <Archive28Filled />
          <Archive28Regular />
          <Archive32Filled />
          <Archive32Regular />
          <Archive48Filled />
          <Archive48Regular />
          <ArchiveArrowBack16Filled />
          <ArchiveArrowBack16Regular />
          <ArchiveArrowBack20Filled />
          <ArchiveArrowBack20Regular />
          <ArchiveArrowBack24Filled />
          <ArchiveArrowBack24Regular />
          <ArchiveArrowBack28Filled />
          <ArchiveArrowBack28Regular />
        </View>
        <View style={{ flexDirection: 'row' }}>
          <ArchiveArrowBack32Filled />
          <ArchiveArrowBack32Regular />
          <ArchiveArrowBack48Filled />
          <ArchiveArrowBack48Regular />
          <ArchiveMultiple16Filled />
          <ArchiveMultiple16Regular />
          <ArchiveMultiple20Filled />
          <ArchiveMultiple20Regular />
          <ArchiveMultiple24Filled />
          <ArchiveMultiple24Regular />
          <ArchiveSettings16Filled />
          <ArchiveSettings16Regular />
          <ArchiveSettings20Filled />
          <ArchiveSettings20Regular />
          <ArchiveSettings24Filled />
          <ArchiveSettings24Regular />
          <ArchiveSettings28Filled />
          <ArchiveSettings28Regular />
          <ArrowAutofitContent20Filled />
          <ArrowAutofitContent20Regular />
        </View>
        <View style={{ flexDirection: 'row' }}>
          <ArrowAutofitContent24Filled />
          <ArrowAutofitContent24Regular />
          <ArrowAutofitDown20Filled />
          <ArrowAutofitDown20Regular />
          <ArrowAutofitDown24Filled />
          <ArrowAutofitDown24Regular />
          <ArrowAutofitHeight20Filled />
          <ArrowAutofitHeight20Regular />
          <ArrowAutofitHeight24Filled />
          <ArrowAutofitHeight24Regular />
          <ArrowAutofitHeightDotted20Filled />
          <ArrowAutofitHeightDotted20Regular />
          <ArrowAutofitHeightDotted24Filled />
          <ArrowAutofitHeightDotted24Regular />
          <ArrowAutofitUp20Filled />
          <ArrowAutofitUp20Regular />
          <ArrowAutofitUp24Filled />
          <ArrowAutofitUp24Regular />
          <ArrowAutofitWidth20Filled />
          <ArrowAutofitWidth20Regular />
        </View>
        <View style={{ flexDirection: 'row' }}>
          <ArrowAutofitWidth24Filled />
          <ArrowAutofitWidth24Regular />
          <ArrowAutofitWidthDotted20Filled />
          <ArrowAutofitWidthDotted20Regular />
          <ArrowAutofitWidthDotted24Filled />
          <ArrowAutofitWidthDotted24Regular />
          <ArrowBetweenDown20Filled />
          <ArrowBetweenDown20Regular />
          <ArrowBetweenDown24Filled />
          <ArrowBetweenDown24Regular />
          <ArrowBetweenUp20Filled />
          <ArrowBetweenUp20Regular />
          <ArrowBidirectionalUpDown12Filled />
          <ArrowBidirectionalUpDown12Regular />
          <ArrowBidirectionalUpDown16Filled />
          <ArrowBidirectionalUpDown16Regular />
          <ArrowBidirectionalUpDown20Filled />
          <ArrowBidirectionalUpDown20Regular />
          <ArrowBidirectionalUpDown24Filled />
          <ArrowBidirectionalUpDown24Regular />
        </View>
        <View style={{ flexDirection: 'row' }}>
          <ArrowBounce16Filled />
          <ArrowBounce16Regular />
          <ArrowBounce20Filled />
          <ArrowBounce20Regular />
          <ArrowBounce24Filled />
          <ArrowBounce24Regular />
          <ArrowCircleDown12Filled />
          <ArrowCircleDown12Regular />
          <ArrowCircleDown16Filled />
          <ArrowCircleDown16Regular />
          <ArrowCircleDown20Filled />
          <ArrowCircleDown20Regular />
          <ArrowCircleDown24Filled />
          <ArrowCircleDown24Regular />
          <ArrowCircleDown28Filled />
          <ArrowCircleDown28Regular />
          <ArrowCircleDown32Filled />
          <ArrowCircleDown32Regular />
          <ArrowCircleDown48Filled />
          <ArrowCircleDown48Regular />
        </View>
        <View style={{ flexDirection: 'row' }}>
          <ArrowCircleDownDouble20Filled />
          <ArrowCircleDownDouble20Regular />
          <ArrowCircleDownDouble24Filled />
          <ArrowCircleDownDouble24Regular />
          <ArrowCircleDownRight16Filled />
          <ArrowCircleDownRight16Regular />
          <ArrowCircleDownRight20Filled />
          <ArrowCircleDownRight20Regular />
          <ArrowCircleDownRight24Filled />
          <ArrowCircleDownRight24Regular />
          <ArrowCircleDownSplit20Filled />
          <ArrowCircleDownSplit20Regular />
          <ArrowCircleDownSplit24Filled />
          <ArrowCircleDownSplit24Regular />
          <ArrowCircleDownUp20Filled />
          <ArrowCircleDownUp20Regular />
          <ArrowCircleLeft12Filled />
          <ArrowCircleLeft12Regular />
          <ArrowCircleLeft16Filled />
          <ArrowCircleLeft16Regular />
        </View>
        <View style={{ flexDirection: 'row' }}>
          <ArrowCircleLeft20Filled />
          <ArrowCircleLeft20Regular />
          <ArrowCircleLeft24Filled />
          <ArrowCircleLeft24Regular />
          <ArrowCircleLeft28Filled />
          <ArrowCircleLeft28Regular />
          <ArrowCircleLeft32Filled />
          <ArrowCircleLeft32Regular />
          <ArrowCircleLeft48Filled />
          <ArrowCircleLeft48Regular />
          <ArrowCircleRight12Filled />
          <ArrowCircleRight12Regular />
          <ArrowCircleRight16Filled />
          <ArrowCircleRight16Regular />
          <ArrowCircleRight20Filled />
          <ArrowCircleRight20Regular />
          <ArrowCircleRight24Filled />
          <ArrowCircleRight24Regular />
          <ArrowCircleRight28Filled />
          <ArrowCircleRight28Regular />
        </View>
        <View style={{ flexDirection: 'row' }}>
          <ArrowCircleRight32Filled />
          <ArrowCircleRight32Regular />
          <ArrowCircleRight48Filled />
          <ArrowCircleRight48Regular />
          <ArrowCircleUp12Filled />
          <ArrowCircleUp12Regular />
          <ArrowCircleUp16Filled />
          <ArrowCircleUp16Regular />
          <ArrowCircleUp20Filled />
          <ArrowCircleUp20Regular />
          <ArrowCircleUp24Filled />
          <ArrowCircleUp24Regular />
          <ArrowCircleUp28Filled />
          <ArrowCircleUp28Regular />
          <ArrowCircleUp32Filled />
          <ArrowCircleUp32Regular />
          <ArrowCircleUp48Filled />
          <ArrowCircleUp48Regular />
          <ArrowCircleUpLeft20Filled />
          <ArrowCircleUpLeft20Regular />
        </View>
      </View>
    </React.Fragment>
  );
};

const svgSections: TestSection[] = [
  {
    name: 'FontAwesome RNSVG Icons package',
    testID: RNSVGIcons_TESTPAGE,
    component: FontAwesomeTest,
  },
  {
    name: 'Fluent-UI Icons package',
    component: FluentIconsTest,
  },
];

export const RNSVGIconsTest: React.FunctionComponent = () => {
  const status: PlatformStatus = {
    win32Status: 'Production',
    uwpStatus: 'Production',
    iosStatus: 'Production',
    macosStatus: 'Production',
    androidStatus: 'Production',
  };

  const description = 'Playground for testing various popular icon packages we are compatible with.';

  return <Test name="RNSVG Icon packages" description={description} sections={svgSections} status={status} />;
};
