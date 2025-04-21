import * as React from 'react';
import { View } from 'react-native';

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

function withAccessibility<P extends React.SVGAttributes<SVGElement>>(Component: React.ComponentType<React.SVGAttributes<SVGElement>>) {
  const WithAccessibility: React.FC<P & { accessibilityLabel?: string }> = (props) => {
    const { accessibilityLabel, ...restProps } = props;
    return (
      <View accessible={true} accessibilityRole="image" focusable={true} accessibilityLabel={accessibilityLabel}>
        <Component {...restProps} />
      </View>
    );
  };

  return WithAccessibility;
}

const AccessTime20FilledAcc = withAccessibility(AccessTime20Filled);
const AccessTime20RegularAcc = withAccessibility(AccessTime20Regular);
const AccessTime24FilledAcc = withAccessibility(AccessTime24Filled);
const AccessTime24RegularAcc = withAccessibility(AccessTime24Regular);
const Accessibility16FilledAcc = withAccessibility(Accessibility16Filled);
const Accessibility16RegularAcc = withAccessibility(Accessibility16Regular);
const Accessibility20FilledAcc = withAccessibility(Accessibility20Filled);
const Accessibility20RegularAcc = withAccessibility(Accessibility20Regular);
const Accessibility24FilledAcc = withAccessibility(Accessibility24Filled);
const Accessibility24RegularAcc = withAccessibility(Accessibility24Regular);
const Accessibility28FilledAcc = withAccessibility(Accessibility28Filled);
const Accessibility28RegularAcc = withAccessibility(Accessibility28Regular);
const Accessibility32FilledAcc = withAccessibility(Accessibility32Filled);
const Accessibility32RegularAcc = withAccessibility(Accessibility32Regular);
const Accessibility48FilledAcc = withAccessibility(Accessibility48Filled);
const Accessibility48RegularAcc = withAccessibility(Accessibility48Regular);
const AccessibilityCheckmark20FilledAcc = withAccessibility(AccessibilityCheckmark20Filled);
const AccessibilityCheckmark20RegularAcc = withAccessibility(AccessibilityCheckmark20Regular);
const AccessibilityCheckmark24FilledAcc = withAccessibility(AccessibilityCheckmark24Filled);
const AccessibilityCheckmark24RegularAcc = withAccessibility(AccessibilityCheckmark24Regular);
const AccessibilityCheckmark28FilledAcc = withAccessibility(AccessibilityCheckmark28Filled);
const AccessibilityCheckmark28RegularAcc = withAccessibility(AccessibilityCheckmark28Regular);
const AccessibilityCheckmark32FilledAcc = withAccessibility(AccessibilityCheckmark32Filled);
const AccessibilityCheckmark32RegularAcc = withAccessibility(AccessibilityCheckmark32Regular);
const AccessibilityCheckmark48FilledAcc = withAccessibility(AccessibilityCheckmark48Filled);
const AccessibilityCheckmark48RegularAcc = withAccessibility(AccessibilityCheckmark48Regular);
const Add12FilledAcc = withAccessibility(Add12Filled);
const Add12RegularAcc = withAccessibility(Add12Regular);
const Add16FilledAcc = withAccessibility(Add16Filled);
const Add16RegularAcc = withAccessibility(Add16Regular);
const Add20FilledAcc = withAccessibility(Add20Filled);
const Add20RegularAcc = withAccessibility(Add20Regular);
const Add24FilledAcc = withAccessibility(Add24Filled);
const Add24RegularAcc = withAccessibility(Add24Regular);
const Add28FilledAcc = withAccessibility(Add28Filled);
const Add28RegularAcc = withAccessibility(Add28Regular);
const AddCircle12FilledAcc = withAccessibility(AddCircle12Filled);
const AddCircle12RegularAcc = withAccessibility(AddCircle12Regular);
const AddCircle16FilledAcc = withAccessibility(AddCircle16Filled);
const AddCircle16RegularAcc = withAccessibility(AddCircle16Regular);
const AddCircle20FilledAcc = withAccessibility(AddCircle20Filled);
const AddCircle20RegularAcc = withAccessibility(AddCircle20Regular);
const AddCircle24FilledAcc = withAccessibility(AddCircle24Filled);
const AddCircle24RegularAcc = withAccessibility(AddCircle24Regular);
const AddCircle28FilledAcc = withAccessibility(AddCircle28Filled);
const AddCircle28RegularAcc = withAccessibility(AddCircle28Regular);
const AddCircle32FilledAcc = withAccessibility(AddCircle32Filled);
const AddCircle32RegularAcc = withAccessibility(AddCircle32Regular);
const AddSquare20FilledAcc = withAccessibility(AddSquare20Filled);
const AddSquare20RegularAcc = withAccessibility(AddSquare20Regular);
const AddSquare24FilledAcc = withAccessibility(AddSquare24Filled);
const AddSquare24RegularAcc = withAccessibility(AddSquare24Regular);
const AddSquareMultiple16FilledAcc = withAccessibility(AddSquareMultiple16Filled);
const AddSquareMultiple16RegularAcc = withAccessibility(AddSquareMultiple16Regular);
const AddSquareMultiple20FilledAcc = withAccessibility(AddSquareMultiple20Filled);
const AddSquareMultiple20RegularAcc = withAccessibility(AddSquareMultiple20Regular);
const AddSubtractCircle16FilledAcc = withAccessibility(AddSubtractCircle16Filled);
const AddSubtractCircle16RegularAcc = withAccessibility(AddSubtractCircle16Regular);
const AddSubtractCircle20FilledAcc = withAccessibility(AddSubtractCircle20Filled);
const AddSubtractCircle20RegularAcc = withAccessibility(AddSubtractCircle20Regular);
const AddSubtractCircle24FilledAcc = withAccessibility(AddSubtractCircle24Filled);
const AddSubtractCircle24RegularAcc = withAccessibility(AddSubtractCircle24Regular);
const AddSubtractCircle28FilledAcc = withAccessibility(AddSubtractCircle28Filled);
const AddSubtractCircle28RegularAcc = withAccessibility(AddSubtractCircle28Regular);
const AddSubtractCircle48FilledAcc = withAccessibility(AddSubtractCircle48Filled);
const AddSubtractCircle48RegularAcc = withAccessibility(AddSubtractCircle48Regular);
const Airplane20FilledAcc = withAccessibility(Airplane20Filled);
const Airplane20RegularAcc = withAccessibility(Airplane20Regular);
const Airplane24FilledAcc = withAccessibility(Airplane24Filled);
const Airplane24RegularAcc = withAccessibility(Airplane24Regular);
const AirplaneTakeOff16FilledAcc = withAccessibility(AirplaneTakeOff16Filled);
const AirplaneTakeOff16RegularAcc = withAccessibility(AirplaneTakeOff16Regular);
const AirplaneTakeOff20FilledAcc = withAccessibility(AirplaneTakeOff20Filled);
const AirplaneTakeOff20RegularAcc = withAccessibility(AirplaneTakeOff20Regular);
const AirplaneTakeOff24FilledAcc = withAccessibility(AirplaneTakeOff24Filled);
const AirplaneTakeOff24RegularAcc = withAccessibility(AirplaneTakeOff24Regular);
const Album20FilledAcc = withAccessibility(Album20Filled);
const Album20RegularAcc = withAccessibility(Album20Regular);
const Album24FilledAcc = withAccessibility(Album24Filled);
const Album24RegularAcc = withAccessibility(Album24Regular);
const AlbumAdd20FilledAcc = withAccessibility(AlbumAdd20Filled);
const AlbumAdd20RegularAcc = withAccessibility(AlbumAdd20Regular);
const AlbumAdd24FilledAcc = withAccessibility(AlbumAdd24Filled);
const AlbumAdd24RegularAcc = withAccessibility(AlbumAdd24Regular);
const Alert12FilledAcc = withAccessibility(Alert12Filled);
const Alert12RegularAcc = withAccessibility(Alert12Regular);
const Alert16FilledAcc = withAccessibility(Alert16Filled);
const Alert16RegularAcc = withAccessibility(Alert16Regular);
const Alert20FilledAcc = withAccessibility(Alert20Filled);
const Alert20RegularAcc = withAccessibility(Alert20Regular);
const Alert24FilledAcc = withAccessibility(Alert24Filled);
const Alert24RegularAcc = withAccessibility(Alert24Regular);
const Alert28FilledAcc = withAccessibility(Alert28Filled);
const Alert28RegularAcc = withAccessibility(Alert28Regular);
const Alert32FilledAcc = withAccessibility(Alert32Filled);
const Alert32RegularAcc = withAccessibility(Alert32Regular);
const Alert48FilledAcc = withAccessibility(Alert48Filled);
const Alert48RegularAcc = withAccessibility(Alert48Regular);
const AlertBadge16FilledAcc = withAccessibility(AlertBadge16Filled);
const AlertBadge16RegularAcc = withAccessibility(AlertBadge16Regular);
const AlertBadge20FilledAcc = withAccessibility(AlertBadge20Filled);
const AlertBadge20RegularAcc = withAccessibility(AlertBadge20Regular);
const AlertBadge24FilledAcc = withAccessibility(AlertBadge24Filled);
const AlertBadge24RegularAcc = withAccessibility(AlertBadge24Regular);
const AlertOff16FilledAcc = withAccessibility(AlertOff16Filled);
const AlertOff16RegularAcc = withAccessibility(AlertOff16Regular);
const AlertOff20FilledAcc = withAccessibility(AlertOff20Filled);
const AlertOff20RegularAcc = withAccessibility(AlertOff20Regular);
const AlertOff24FilledAcc = withAccessibility(AlertOff24Filled);
const AlertOff24RegularAcc = withAccessibility(AlertOff24Regular);
const AlertOff28FilledAcc = withAccessibility(AlertOff28Filled);
const AlertOff28RegularAcc = withAccessibility(AlertOff28Regular);
const AlertOn20FilledAcc = withAccessibility(AlertOn20Filled);
const AlertOn20RegularAcc = withAccessibility(AlertOn20Regular);
const AlertOn24FilledAcc = withAccessibility(AlertOn24Filled);
const AlertOn24RegularAcc = withAccessibility(AlertOn24Regular);
const AlertSnooze12FilledAcc = withAccessibility(AlertSnooze12Filled);
const AlertSnooze12RegularAcc = withAccessibility(AlertSnooze12Regular);
const AlertSnooze16FilledAcc = withAccessibility(AlertSnooze16Filled);
const AlertSnooze16RegularAcc = withAccessibility(AlertSnooze16Regular);
const AlertSnooze20FilledAcc = withAccessibility(AlertSnooze20Filled);
const AlertSnooze20RegularAcc = withAccessibility(AlertSnooze20Regular);
const AlertSnooze24FilledAcc = withAccessibility(AlertSnooze24Filled);
const AlertSnooze24RegularAcc = withAccessibility(AlertSnooze24Regular);
const AlertUrgent16FilledAcc = withAccessibility(AlertUrgent16Filled);
const AlertUrgent16RegularAcc = withAccessibility(AlertUrgent16Regular);
const AlertUrgent20FilledAcc = withAccessibility(AlertUrgent20Filled);
const AlertUrgent20RegularAcc = withAccessibility(AlertUrgent20Regular);
const AlertUrgent24FilledAcc = withAccessibility(AlertUrgent24Filled);
const AlertUrgent24RegularAcc = withAccessibility(AlertUrgent24Regular);
const AlignBottom16FilledAcc = withAccessibility(AlignBottom16Filled);
const AlignBottom16RegularAcc = withAccessibility(AlignBottom16Regular);
const AlignBottom20FilledAcc = withAccessibility(AlignBottom20Filled);
const AlignBottom20RegularAcc = withAccessibility(AlignBottom20Regular);
const AlignBottom24FilledAcc = withAccessibility(AlignBottom24Filled);
const AlignBottom24RegularAcc = withAccessibility(AlignBottom24Regular);
const AlignBottom28FilledAcc = withAccessibility(AlignBottom28Filled);
const AlignBottom28RegularAcc = withAccessibility(AlignBottom28Regular);
const AlignBottom32FilledAcc = withAccessibility(AlignBottom32Filled);
const AlignBottom32RegularAcc = withAccessibility(AlignBottom32Regular);
const AlignBottom48FilledAcc = withAccessibility(AlignBottom48Filled);
const AlignBottom48RegularAcc = withAccessibility(AlignBottom48Regular);
const AlignCenterHorizontal16FilledAcc = withAccessibility(AlignCenterHorizontal16Filled);
const AlignCenterHorizontal16RegularAcc = withAccessibility(AlignCenterHorizontal16Regular);
const AlignCenterHorizontal20FilledAcc = withAccessibility(AlignCenterHorizontal20Filled);
const AlignCenterHorizontal20RegularAcc = withAccessibility(AlignCenterHorizontal20Regular);
const AlignCenterHorizontal24FilledAcc = withAccessibility(AlignCenterHorizontal24Filled);
const AlignCenterHorizontal24RegularAcc = withAccessibility(AlignCenterHorizontal24Regular);
const AlignCenterHorizontal28FilledAcc = withAccessibility(AlignCenterHorizontal28Filled);
const AlignCenterHorizontal28RegularAcc = withAccessibility(AlignCenterHorizontal28Regular);
const AlignCenterHorizontal32FilledAcc = withAccessibility(AlignCenterHorizontal32Filled);
const AlignCenterHorizontal32RegularAcc = withAccessibility(AlignCenterHorizontal32Regular);
const AlignCenterHorizontal48FilledAcc = withAccessibility(AlignCenterHorizontal48Filled);
const AlignCenterHorizontal48RegularAcc = withAccessibility(AlignCenterHorizontal48Regular);
const AlignCenterVertical16FilledAcc = withAccessibility(AlignCenterVertical16Filled);
const AlignCenterVertical16RegularAcc = withAccessibility(AlignCenterVertical16Regular);
const AlignCenterVertical20FilledAcc = withAccessibility(AlignCenterVertical20Filled);
const AlignCenterVertical20RegularAcc = withAccessibility(AlignCenterVertical20Regular);
const AlignCenterVertical24FilledAcc = withAccessibility(AlignCenterVertical24Filled);
const AlignCenterVertical24RegularAcc = withAccessibility(AlignCenterVertical24Regular);
const AlignCenterVertical28FilledAcc = withAccessibility(AlignCenterVertical28Filled);
const AlignCenterVertical28RegularAcc = withAccessibility(AlignCenterVertical28Regular);
const AlignCenterVertical32FilledAcc = withAccessibility(AlignCenterVertical32Filled);
const AlignCenterVertical32RegularAcc = withAccessibility(AlignCenterVertical32Regular);
const AlignCenterVertical48FilledAcc = withAccessibility(AlignCenterVertical48Filled);
const AlignCenterVertical48RegularAcc = withAccessibility(AlignCenterVertical48Regular);
const AlignDistributeBottom16FilledAcc = withAccessibility(AlignDistributeBottom16Filled);
const AlignDistributeBottom16RegularAcc = withAccessibility(AlignDistributeBottom16Regular);
const AlignDistributeLeft16FilledAcc = withAccessibility(AlignDistributeLeft16Filled);
const AlignDistributeLeft16RegularAcc = withAccessibility(AlignDistributeLeft16Regular);
const AlignDistributeRight16FilledAcc = withAccessibility(AlignDistributeRight16Filled);
const AlignDistributeRight16RegularAcc = withAccessibility(AlignDistributeRight16Regular);
const AlignDistributeTop16FilledAcc = withAccessibility(AlignDistributeTop16Filled);
const AlignDistributeTop16RegularAcc = withAccessibility(AlignDistributeTop16Regular);
const AlignEndHorizontal20FilledAcc = withAccessibility(AlignEndHorizontal20Filled);
const AlignEndHorizontal20RegularAcc = withAccessibility(AlignEndHorizontal20Regular);
const AlignEndVertical20FilledAcc = withAccessibility(AlignEndVertical20Filled);
const AlignEndVertical20RegularAcc = withAccessibility(AlignEndVertical20Regular);
const AlignLeft16FilledAcc = withAccessibility(AlignLeft16Filled);
const AlignLeft16RegularAcc = withAccessibility(AlignLeft16Regular);
const AlignLeft20FilledAcc = withAccessibility(AlignLeft20Filled);
const AlignLeft20RegularAcc = withAccessibility(AlignLeft20Regular);
const AlignLeft24FilledAcc = withAccessibility(AlignLeft24Filled);
const AlignLeft24RegularAcc = withAccessibility(AlignLeft24Regular);
const AlignLeft28FilledAcc = withAccessibility(AlignLeft28Filled);
const AlignLeft28RegularAcc = withAccessibility(AlignLeft28Regular);
const AlignLeft32FilledAcc = withAccessibility(AlignLeft32Filled);
const AlignLeft32RegularAcc = withAccessibility(AlignLeft32Regular);
const AlignLeft48FilledAcc = withAccessibility(AlignLeft48Filled);
const AlignLeft48RegularAcc = withAccessibility(AlignLeft48Regular);
const AlignRight16FilledAcc = withAccessibility(AlignRight16Filled);
const AlignRight16RegularAcc = withAccessibility(AlignRight16Regular);
const AlignRight20FilledAcc = withAccessibility(AlignRight20Filled);
const AlignRight20RegularAcc = withAccessibility(AlignRight20Regular);
const AlignRight24FilledAcc = withAccessibility(AlignRight24Filled);
const AlignRight24RegularAcc = withAccessibility(AlignRight24Regular);
const AlignRight28FilledAcc = withAccessibility(AlignRight28Filled);
const AlignRight28RegularAcc = withAccessibility(AlignRight28Regular);
const AlignRight32FilledAcc = withAccessibility(AlignRight32Filled);
const AlignRight32RegularAcc = withAccessibility(AlignRight32Regular);
const AlignRight48FilledAcc = withAccessibility(AlignRight48Filled);
const AlignRight48RegularAcc = withAccessibility(AlignRight48Regular);
const AlignSpaceAroundHorizontal20FilledAcc = withAccessibility(AlignSpaceAroundHorizontal20Filled);
const AlignSpaceAroundHorizontal20RegularAcc = withAccessibility(AlignSpaceAroundHorizontal20Regular);
const AlignSpaceAroundVertical20FilledAcc = withAccessibility(AlignSpaceAroundVertical20Filled);
const AlignSpaceAroundVertical20RegularAcc = withAccessibility(AlignSpaceAroundVertical20Regular);
const AlignSpaceBetweenHorizontal20FilledAcc = withAccessibility(AlignSpaceBetweenHorizontal20Filled);
const AlignSpaceBetweenHorizontal20RegularAcc = withAccessibility(AlignSpaceBetweenHorizontal20Regular);
const AlignSpaceBetweenVertical20FilledAcc = withAccessibility(AlignSpaceBetweenVertical20Filled);
const AlignSpaceBetweenVertical20RegularAcc = withAccessibility(AlignSpaceBetweenVertical20Regular);
const AlignSpaceEvenlyHorizontal20FilledAcc = withAccessibility(AlignSpaceEvenlyHorizontal20Filled);
const AlignSpaceEvenlyHorizontal20RegularAcc = withAccessibility(AlignSpaceEvenlyHorizontal20Regular);
const AlignSpaceEvenlyVertical20FilledAcc = withAccessibility(AlignSpaceEvenlyVertical20Filled);
const AlignSpaceEvenlyVertical20RegularAcc = withAccessibility(AlignSpaceEvenlyVertical20Regular);
const AlignSpaceFitVertical20FilledAcc = withAccessibility(AlignSpaceFitVertical20Filled);
const AlignSpaceFitVertical20RegularAcc = withAccessibility(AlignSpaceFitVertical20Regular);
const AlignStartHorizontal20FilledAcc = withAccessibility(AlignStartHorizontal20Filled);
const AlignStartHorizontal20RegularAcc = withAccessibility(AlignStartHorizontal20Regular);
const AlignStartVertical20FilledAcc = withAccessibility(AlignStartVertical20Filled);
const AlignStartVertical20RegularAcc = withAccessibility(AlignStartVertical20Regular);
const AlignStretchHorizontal16FilledAcc = withAccessibility(AlignStretchHorizontal16Filled);
const AlignStretchHorizontal16RegularAcc = withAccessibility(AlignStretchHorizontal16Regular);
const AlignStretchHorizontal20FilledAcc = withAccessibility(AlignStretchHorizontal20Filled);
const AlignStretchHorizontal20RegularAcc = withAccessibility(AlignStretchHorizontal20Regular);
const AlignStretchVertical16FilledAcc = withAccessibility(AlignStretchVertical16Filled);
const AlignStretchVertical16RegularAcc = withAccessibility(AlignStretchVertical16Regular);
const AlignStretchVertical20FilledAcc = withAccessibility(AlignStretchVertical20Filled);
const AlignStretchVertical20RegularAcc = withAccessibility(AlignStretchVertical20Regular);
const AlignTop16FilledAcc = withAccessibility(AlignTop16Filled);
const AlignTop16RegularAcc = withAccessibility(AlignTop16Regular);
const AlignTop20FilledAcc = withAccessibility(AlignTop20Filled);
const AlignTop20RegularAcc = withAccessibility(AlignTop20Regular);
const AlignTop24FilledAcc = withAccessibility(AlignTop24Filled);
const AlignTop24RegularAcc = withAccessibility(AlignTop24Regular);
const AlignTop28FilledAcc = withAccessibility(AlignTop28Filled);
const AlignTop28RegularAcc = withAccessibility(AlignTop28Regular);
const AlignTop32FilledAcc = withAccessibility(AlignTop32Filled);
const AlignTop32RegularAcc = withAccessibility(AlignTop32Regular);
const AlignTop48FilledAcc = withAccessibility(AlignTop48Filled);
const AlignTop48RegularAcc = withAccessibility(AlignTop48Regular);
const AnimalCat16FilledAcc = withAccessibility(AnimalCat16Filled);
const AnimalCat16RegularAcc = withAccessibility(AnimalCat16Regular);
const AnimalCat20FilledAcc = withAccessibility(AnimalCat20Filled);
const AnimalCat20RegularAcc = withAccessibility(AnimalCat20Regular);
const AnimalCat24FilledAcc = withAccessibility(AnimalCat24Filled);
const AnimalCat24RegularAcc = withAccessibility(AnimalCat24Regular);
const AnimalCat28FilledAcc = withAccessibility(AnimalCat28Filled);
const AnimalCat28RegularAcc = withAccessibility(AnimalCat28Regular);
const AnimalDog16FilledAcc = withAccessibility(AnimalDog16Filled);
const AnimalDog16RegularAcc = withAccessibility(AnimalDog16Regular);
const AnimalDog20FilledAcc = withAccessibility(AnimalDog20Filled);
const AnimalDog20RegularAcc = withAccessibility(AnimalDog20Regular);
const AnimalDog24FilledAcc = withAccessibility(AnimalDog24Filled);
const AnimalDog24RegularAcc = withAccessibility(AnimalDog24Regular);
const AnimalRabbit16FilledAcc = withAccessibility(AnimalRabbit16Filled);
const AnimalRabbit16RegularAcc = withAccessibility(AnimalRabbit16Regular);
const AnimalRabbit20FilledAcc = withAccessibility(AnimalRabbit20Filled);
const AnimalRabbit20RegularAcc = withAccessibility(AnimalRabbit20Regular);
const AnimalRabbit24FilledAcc = withAccessibility(AnimalRabbit24Filled);
const AnimalRabbit24RegularAcc = withAccessibility(AnimalRabbit24Regular);
const AnimalRabbit28FilledAcc = withAccessibility(AnimalRabbit28Filled);
const AnimalRabbit28RegularAcc = withAccessibility(AnimalRabbit28Regular);
const AnimalRabbit32FilledAcc = withAccessibility(AnimalRabbit32Filled);
const AnimalRabbit32RegularAcc = withAccessibility(AnimalRabbit32Regular);
const AnimalRabbitOff20FilledAcc = withAccessibility(AnimalRabbitOff20Filled);
const AnimalRabbitOff20RegularAcc = withAccessibility(AnimalRabbitOff20Regular);
const AnimalRabbitOff32FilledAcc = withAccessibility(AnimalRabbitOff32Filled);
const AnimalRabbitOff32RegularAcc = withAccessibility(AnimalRabbitOff32Regular);
const AnimalTurtle16FilledAcc = withAccessibility(AnimalTurtle16Filled);
const AnimalTurtle16RegularAcc = withAccessibility(AnimalTurtle16Regular);
const AnimalTurtle20FilledAcc = withAccessibility(AnimalTurtle20Filled);
const AnimalTurtle20RegularAcc = withAccessibility(AnimalTurtle20Regular);
const AnimalTurtle24FilledAcc = withAccessibility(AnimalTurtle24Filled);
const AnimalTurtle24RegularAcc = withAccessibility(AnimalTurtle24Regular);
const AnimalTurtle28FilledAcc = withAccessibility(AnimalTurtle28Filled);
const AnimalTurtle28RegularAcc = withAccessibility(AnimalTurtle28Regular);
const AppFolder16FilledAcc = withAccessibility(AppFolder16Filled);
const AppFolder16RegularAcc = withAccessibility(AppFolder16Regular);
const AppFolder20FilledAcc = withAccessibility(AppFolder20Filled);
const AppFolder20RegularAcc = withAccessibility(AppFolder20Regular);
const AppFolder24FilledAcc = withAccessibility(AppFolder24Filled);
const AppFolder24RegularAcc = withAccessibility(AppFolder24Regular);
const AppFolder28FilledAcc = withAccessibility(AppFolder28Filled);
const AppFolder28RegularAcc = withAccessibility(AppFolder28Regular);
const AppFolder32FilledAcc = withAccessibility(AppFolder32Filled);
const AppFolder32RegularAcc = withAccessibility(AppFolder32Regular);
const AppFolder48FilledAcc = withAccessibility(AppFolder48Filled);
const AppFolder48RegularAcc = withAccessibility(AppFolder48Regular);
const AppGeneric20FilledAcc = withAccessibility(AppGeneric20Filled);
const AppGeneric20RegularAcc = withAccessibility(AppGeneric20Regular);
const AppGeneric24FilledAcc = withAccessibility(AppGeneric24Filled);
const AppGeneric24RegularAcc = withAccessibility(AppGeneric24Regular);
const AppGeneric32FilledAcc = withAccessibility(AppGeneric32Filled);
const AppGeneric32RegularAcc = withAccessibility(AppGeneric32Regular);
const AppRecent20FilledAcc = withAccessibility(AppRecent20Filled);
const AppRecent20RegularAcc = withAccessibility(AppRecent20Regular);
const AppRecent24FilledAcc = withAccessibility(AppRecent24Filled);
const AppRecent24RegularAcc = withAccessibility(AppRecent24Regular);
const AppStore24FilledAcc = withAccessibility(AppStore24Filled);
const AppStore24RegularAcc = withAccessibility(AppStore24Regular);
const AppTitle20FilledAcc = withAccessibility(AppTitle20Filled);
const AppTitle20RegularAcc = withAccessibility(AppTitle20Regular);
const AppTitle24FilledAcc = withAccessibility(AppTitle24Filled);
const AppTitle24RegularAcc = withAccessibility(AppTitle24Regular);
const ApprovalsApp16FilledAcc = withAccessibility(ApprovalsApp16Filled);
const ApprovalsApp16RegularAcc = withAccessibility(ApprovalsApp16Regular);
const ApprovalsApp20FilledAcc = withAccessibility(ApprovalsApp20Filled);
const ApprovalsApp20RegularAcc = withAccessibility(ApprovalsApp20Regular);
const ApprovalsApp24FilledAcc = withAccessibility(ApprovalsApp24Filled);
const ApprovalsApp24RegularAcc = withAccessibility(ApprovalsApp24Regular);
const ApprovalsApp28FilledAcc = withAccessibility(ApprovalsApp28Filled);
const ApprovalsApp28RegularAcc = withAccessibility(ApprovalsApp28Regular);
const ApprovalsApp32FilledAcc = withAccessibility(ApprovalsApp32Filled);
const ApprovalsApp32RegularAcc = withAccessibility(ApprovalsApp32Regular);
const Apps16FilledAcc = withAccessibility(Apps16Filled);
const Apps16RegularAcc = withAccessibility(Apps16Regular);
const Apps20FilledAcc = withAccessibility(Apps20Filled);
const Apps20RegularAcc = withAccessibility(Apps20Regular);
const Apps24FilledAcc = withAccessibility(Apps24Filled);
const Apps24RegularAcc = withAccessibility(Apps24Regular);
const Apps28FilledAcc = withAccessibility(Apps28Filled);
const Apps28RegularAcc = withAccessibility(Apps28Regular);
const Apps32FilledAcc = withAccessibility(Apps32Filled);
const Apps32RegularAcc = withAccessibility(Apps32Regular);
const AppsAddIn16FilledAcc = withAccessibility(AppsAddIn16Filled);
const AppsAddIn16RegularAcc = withAccessibility(AppsAddIn16Regular);
const AppsAddIn20FilledAcc = withAccessibility(AppsAddIn20Filled);
const AppsAddIn20RegularAcc = withAccessibility(AppsAddIn20Regular);
const AppsAddIn24FilledAcc = withAccessibility(AppsAddIn24Filled);
const AppsAddIn24RegularAcc = withAccessibility(AppsAddIn24Regular);
const AppsAddIn28FilledAcc = withAccessibility(AppsAddIn28Filled);
const AppsAddIn28RegularAcc = withAccessibility(AppsAddIn28Regular);
const AppsList20FilledAcc = withAccessibility(AppsList20Filled);
const AppsList20RegularAcc = withAccessibility(AppsList20Regular);
const AppsList24FilledAcc = withAccessibility(AppsList24Filled);
const AppsList24RegularAcc = withAccessibility(AppsList24Regular);
const AppsListDetail20FilledAcc = withAccessibility(AppsListDetail20Filled);
const AppsListDetail20RegularAcc = withAccessibility(AppsListDetail20Regular);
const AppsListDetail24FilledAcc = withAccessibility(AppsListDetail24Filled);
const AppsListDetail24RegularAcc = withAccessibility(AppsListDetail24Regular);
const Archive16FilledAcc = withAccessibility(Archive16Filled);
const Archive16RegularAcc = withAccessibility(Archive16Regular);
const Archive20FilledAcc = withAccessibility(Archive20Filled);
const Archive20RegularAcc = withAccessibility(Archive20Regular);
const Archive24FilledAcc = withAccessibility(Archive24Filled);
const Archive24RegularAcc = withAccessibility(Archive24Regular);
const Archive28FilledAcc = withAccessibility(Archive28Filled);
const Archive28RegularAcc = withAccessibility(Archive28Regular);
const Archive32FilledAcc = withAccessibility(Archive32Filled);
const Archive32RegularAcc = withAccessibility(Archive32Regular);
const Archive48FilledAcc = withAccessibility(Archive48Filled);
const Archive48RegularAcc = withAccessibility(Archive48Regular);
const ArchiveArrowBack16FilledAcc = withAccessibility(ArchiveArrowBack16Filled);
const ArchiveArrowBack16RegularAcc = withAccessibility(ArchiveArrowBack16Regular);
const ArchiveArrowBack20FilledAcc = withAccessibility(ArchiveArrowBack20Filled);
const ArchiveArrowBack20RegularAcc = withAccessibility(ArchiveArrowBack20Regular);
const ArchiveArrowBack24FilledAcc = withAccessibility(ArchiveArrowBack24Filled);
const ArchiveArrowBack24RegularAcc = withAccessibility(ArchiveArrowBack24Regular);
const ArchiveArrowBack28FilledAcc = withAccessibility(ArchiveArrowBack28Filled);
const ArchiveArrowBack28RegularAcc = withAccessibility(ArchiveArrowBack28Regular);
const ArchiveArrowBack32FilledAcc = withAccessibility(ArchiveArrowBack32Filled);
const ArchiveArrowBack32RegularAcc = withAccessibility(ArchiveArrowBack32Regular);
const ArchiveArrowBack48FilledAcc = withAccessibility(ArchiveArrowBack48Filled);
const ArchiveArrowBack48RegularAcc = withAccessibility(ArchiveArrowBack48Regular);
const ArchiveMultiple16FilledAcc = withAccessibility(ArchiveMultiple16Filled);
const ArchiveMultiple16RegularAcc = withAccessibility(ArchiveMultiple16Regular);
const ArchiveMultiple20FilledAcc = withAccessibility(ArchiveMultiple20Filled);
const ArchiveMultiple20RegularAcc = withAccessibility(ArchiveMultiple20Regular);
const ArchiveMultiple24FilledAcc = withAccessibility(ArchiveMultiple24Filled);
const ArchiveMultiple24RegularAcc = withAccessibility(ArchiveMultiple24Regular);
const ArchiveSettings16FilledAcc = withAccessibility(ArchiveSettings16Filled);
const ArchiveSettings16RegularAcc = withAccessibility(ArchiveSettings16Regular);
const ArchiveSettings20FilledAcc = withAccessibility(ArchiveSettings20Filled);
const ArchiveSettings20RegularAcc = withAccessibility(ArchiveSettings20Regular);
const ArchiveSettings24FilledAcc = withAccessibility(ArchiveSettings24Filled);
const ArchiveSettings24RegularAcc = withAccessibility(ArchiveSettings24Regular);
const ArchiveSettings28FilledAcc = withAccessibility(ArchiveSettings28Filled);
const ArchiveSettings28RegularAcc = withAccessibility(ArchiveSettings28Regular);
const ArrowAutofitContent20FilledAcc = withAccessibility(ArrowAutofitContent20Filled);
const ArrowAutofitContent20RegularAcc = withAccessibility(ArrowAutofitContent20Regular);
const ArrowAutofitContent24FilledAcc = withAccessibility(ArrowAutofitContent24Filled);
const ArrowAutofitContent24RegularAcc = withAccessibility(ArrowAutofitContent24Regular);
const ArrowAutofitDown20FilledAcc = withAccessibility(ArrowAutofitDown20Filled);
const ArrowAutofitDown20RegularAcc = withAccessibility(ArrowAutofitDown20Regular);
const ArrowAutofitDown24FilledAcc = withAccessibility(ArrowAutofitDown24Filled);
const ArrowAutofitDown24RegularAcc = withAccessibility(ArrowAutofitDown24Regular);
const ArrowAutofitHeight20FilledAcc = withAccessibility(ArrowAutofitHeight20Filled);
const ArrowAutofitHeight20RegularAcc = withAccessibility(ArrowAutofitHeight20Regular);
const ArrowAutofitHeight24FilledAcc = withAccessibility(ArrowAutofitHeight24Filled);
const ArrowAutofitHeight24RegularAcc = withAccessibility(ArrowAutofitHeight24Regular);
const ArrowAutofitHeightDotted20FilledAcc = withAccessibility(ArrowAutofitHeightDotted20Filled);
const ArrowAutofitHeightDotted20RegularAcc = withAccessibility(ArrowAutofitHeightDotted20Regular);
const ArrowAutofitHeightDotted24FilledAcc = withAccessibility(ArrowAutofitHeightDotted24Filled);
const ArrowAutofitHeightDotted24RegularAcc = withAccessibility(ArrowAutofitHeightDotted24Regular);
const ArrowAutofitUp20FilledAcc = withAccessibility(ArrowAutofitUp20Filled);
const ArrowAutofitUp20RegularAcc = withAccessibility(ArrowAutofitUp20Regular);
const ArrowAutofitUp24FilledAcc = withAccessibility(ArrowAutofitUp24Filled);
const ArrowAutofitUp24RegularAcc = withAccessibility(ArrowAutofitUp24Regular);
const ArrowAutofitWidth20FilledAcc = withAccessibility(ArrowAutofitWidth20Filled);
const ArrowAutofitWidth20RegularAcc = withAccessibility(ArrowAutofitWidth20Regular);
const ArrowAutofitWidth24FilledAcc = withAccessibility(ArrowAutofitWidth24Filled);
const ArrowAutofitWidth24RegularAcc = withAccessibility(ArrowAutofitWidth24Regular);
const ArrowAutofitWidthDotted20FilledAcc = withAccessibility(ArrowAutofitWidthDotted20Filled);
const ArrowAutofitWidthDotted20RegularAcc = withAccessibility(ArrowAutofitWidthDotted20Regular);
const ArrowAutofitWidthDotted24FilledAcc = withAccessibility(ArrowAutofitWidthDotted24Filled);
const ArrowAutofitWidthDotted24RegularAcc = withAccessibility(ArrowAutofitWidthDotted24Regular);
const ArrowBetweenDown20FilledAcc = withAccessibility(ArrowBetweenDown20Filled);
const ArrowBetweenDown20RegularAcc = withAccessibility(ArrowBetweenDown20Regular);
const ArrowBetweenDown24FilledAcc = withAccessibility(ArrowBetweenDown24Filled);
const ArrowBetweenDown24RegularAcc = withAccessibility(ArrowBetweenDown24Regular);
const ArrowBetweenUp20FilledAcc = withAccessibility(ArrowBetweenUp20Filled);
const ArrowBetweenUp20RegularAcc = withAccessibility(ArrowBetweenUp20Regular);
const ArrowBidirectionalUpDown12FilledAcc = withAccessibility(ArrowBidirectionalUpDown12Filled);
const ArrowBidirectionalUpDown12RegularAcc = withAccessibility(ArrowBidirectionalUpDown12Regular);
const ArrowBidirectionalUpDown16FilledAcc = withAccessibility(ArrowBidirectionalUpDown16Filled);
const ArrowBidirectionalUpDown16RegularAcc = withAccessibility(ArrowBidirectionalUpDown16Regular);
const ArrowBidirectionalUpDown20FilledAcc = withAccessibility(ArrowBidirectionalUpDown20Filled);
const ArrowBidirectionalUpDown20RegularAcc = withAccessibility(ArrowBidirectionalUpDown20Regular);
const ArrowBidirectionalUpDown24FilledAcc = withAccessibility(ArrowBidirectionalUpDown24Filled);
const ArrowBidirectionalUpDown24RegularAcc = withAccessibility(ArrowBidirectionalUpDown24Regular);
const ArrowBounce16FilledAcc = withAccessibility(ArrowBounce16Filled);
const ArrowBounce16RegularAcc = withAccessibility(ArrowBounce16Regular);
const ArrowBounce20FilledAcc = withAccessibility(ArrowBounce20Filled);
const ArrowBounce20RegularAcc = withAccessibility(ArrowBounce20Regular);
const ArrowBounce24FilledAcc = withAccessibility(ArrowBounce24Filled);
const ArrowBounce24RegularAcc = withAccessibility(ArrowBounce24Regular);
const ArrowCircleDown12FilledAcc = withAccessibility(ArrowCircleDown12Filled);
const ArrowCircleDown12RegularAcc = withAccessibility(ArrowCircleDown12Regular);
const ArrowCircleDown16FilledAcc = withAccessibility(ArrowCircleDown16Filled);
const ArrowCircleDown16RegularAcc = withAccessibility(ArrowCircleDown16Regular);
const ArrowCircleDown20FilledAcc = withAccessibility(ArrowCircleDown20Filled);
const ArrowCircleDown20RegularAcc = withAccessibility(ArrowCircleDown20Regular);
const ArrowCircleDown24FilledAcc = withAccessibility(ArrowCircleDown24Filled);
const ArrowCircleDown24RegularAcc = withAccessibility(ArrowCircleDown24Regular);
const ArrowCircleDown28FilledAcc = withAccessibility(ArrowCircleDown28Filled);
const ArrowCircleDown28RegularAcc = withAccessibility(ArrowCircleDown28Regular);
const ArrowCircleDown32FilledAcc = withAccessibility(ArrowCircleDown32Filled);
const ArrowCircleDown32RegularAcc = withAccessibility(ArrowCircleDown32Regular);
const ArrowCircleDown48FilledAcc = withAccessibility(ArrowCircleDown48Filled);
const ArrowCircleDown48RegularAcc = withAccessibility(ArrowCircleDown48Regular);
const ArrowCircleDownDouble20FilledAcc = withAccessibility(ArrowCircleDownDouble20Filled);
const ArrowCircleDownDouble20RegularAcc = withAccessibility(ArrowCircleDownDouble20Regular);
const ArrowCircleDownDouble24FilledAcc = withAccessibility(ArrowCircleDownDouble24Filled);
const ArrowCircleDownDouble24RegularAcc = withAccessibility(ArrowCircleDownDouble24Regular);
const ArrowCircleDownRight16FilledAcc = withAccessibility(ArrowCircleDownRight16Filled);
const ArrowCircleDownRight16RegularAcc = withAccessibility(ArrowCircleDownRight16Regular);
const ArrowCircleDownRight20FilledAcc = withAccessibility(ArrowCircleDownRight20Filled);
const ArrowCircleDownRight20RegularAcc = withAccessibility(ArrowCircleDownRight20Regular);
const ArrowCircleDownRight24FilledAcc = withAccessibility(ArrowCircleDownRight24Filled);
const ArrowCircleDownRight24RegularAcc = withAccessibility(ArrowCircleDownRight24Regular);
const ArrowCircleDownSplit20FilledAcc = withAccessibility(ArrowCircleDownSplit20Filled);
const ArrowCircleDownSplit20RegularAcc = withAccessibility(ArrowCircleDownSplit20Regular);
const ArrowCircleDownSplit24FilledAcc = withAccessibility(ArrowCircleDownSplit24Filled);
const ArrowCircleDownSplit24RegularAcc = withAccessibility(ArrowCircleDownSplit24Regular);
const ArrowCircleDownUp20FilledAcc = withAccessibility(ArrowCircleDownUp20Filled);
const ArrowCircleDownUp20RegularAcc = withAccessibility(ArrowCircleDownUp20Regular);
const ArrowCircleLeft12FilledAcc = withAccessibility(ArrowCircleLeft12Filled);
const ArrowCircleLeft12RegularAcc = withAccessibility(ArrowCircleLeft12Regular);
const ArrowCircleLeft16FilledAcc = withAccessibility(ArrowCircleLeft16Filled);
const ArrowCircleLeft16RegularAcc = withAccessibility(ArrowCircleLeft16Regular);
const ArrowCircleLeft20FilledAcc = withAccessibility(ArrowCircleLeft20Filled);
const ArrowCircleLeft20RegularAcc = withAccessibility(ArrowCircleLeft20Regular);
const ArrowCircleLeft24FilledAcc = withAccessibility(ArrowCircleLeft24Filled);
const ArrowCircleLeft24RegularAcc = withAccessibility(ArrowCircleLeft24Regular);
const ArrowCircleLeft28FilledAcc = withAccessibility(ArrowCircleLeft28Filled);
const ArrowCircleLeft28RegularAcc = withAccessibility(ArrowCircleLeft28Regular);
const ArrowCircleLeft32FilledAcc = withAccessibility(ArrowCircleLeft32Filled);
const ArrowCircleLeft32RegularAcc = withAccessibility(ArrowCircleLeft32Regular);
const ArrowCircleLeft48FilledAcc = withAccessibility(ArrowCircleLeft48Filled);
const ArrowCircleLeft48RegularAcc = withAccessibility(ArrowCircleLeft48Regular);
const ArrowCircleRight12FilledAcc = withAccessibility(ArrowCircleRight12Filled);
const ArrowCircleRight12RegularAcc = withAccessibility(ArrowCircleRight12Regular);
const ArrowCircleRight16FilledAcc = withAccessibility(ArrowCircleRight16Filled);
const ArrowCircleRight16RegularAcc = withAccessibility(ArrowCircleRight16Regular);
const ArrowCircleRight20FilledAcc = withAccessibility(ArrowCircleRight20Filled);
const ArrowCircleRight20RegularAcc = withAccessibility(ArrowCircleRight20Regular);
const ArrowCircleRight24FilledAcc = withAccessibility(ArrowCircleRight24Filled);
const ArrowCircleRight24RegularAcc = withAccessibility(ArrowCircleRight24Regular);
const ArrowCircleRight28FilledAcc = withAccessibility(ArrowCircleRight28Filled);
const ArrowCircleRight28RegularAcc = withAccessibility(ArrowCircleRight28Regular);
const ArrowCircleRight32FilledAcc = withAccessibility(ArrowCircleRight32Filled);
const ArrowCircleRight32RegularAcc = withAccessibility(ArrowCircleRight32Regular);
const ArrowCircleRight48FilledAcc = withAccessibility(ArrowCircleRight48Filled);
const ArrowCircleRight48RegularAcc = withAccessibility(ArrowCircleRight48Regular);
const ArrowCircleUp12FilledAcc = withAccessibility(ArrowCircleUp12Filled);
const ArrowCircleUp12RegularAcc = withAccessibility(ArrowCircleUp12Regular);
const ArrowCircleUp16FilledAcc = withAccessibility(ArrowCircleUp16Filled);
const ArrowCircleUp16RegularAcc = withAccessibility(ArrowCircleUp16Regular);
const ArrowCircleUp20FilledAcc = withAccessibility(ArrowCircleUp20Filled);
const ArrowCircleUp20RegularAcc = withAccessibility(ArrowCircleUp20Regular);
const ArrowCircleUp24FilledAcc = withAccessibility(ArrowCircleUp24Filled);
const ArrowCircleUp24RegularAcc = withAccessibility(ArrowCircleUp24Regular);
const ArrowCircleUp28FilledAcc = withAccessibility(ArrowCircleUp28Filled);
const ArrowCircleUp28RegularAcc = withAccessibility(ArrowCircleUp28Regular);
const ArrowCircleUp32FilledAcc = withAccessibility(ArrowCircleUp32Filled);
const ArrowCircleUp32RegularAcc = withAccessibility(ArrowCircleUp32Regular);
const ArrowCircleUp48FilledAcc = withAccessibility(ArrowCircleUp48Filled);
const ArrowCircleUp48RegularAcc = withAccessibility(ArrowCircleUp48Regular);
const ArrowCircleUpLeft20FilledAcc = withAccessibility(ArrowCircleUpLeft20Filled);
const ArrowCircleUpLeft20RegularAcc = withAccessibility(ArrowCircleUpLeft20Regular);

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
          <AccessTime20FilledAcc accessibilityLabel="Access Time 20 Filled" />
          <AccessTime20RegularAcc accessibilityLabel="Access Time 20 Regular" />
          <AccessTime24FilledAcc accessibilityLabel="Access Time 24 Filled" />
          <AccessTime24RegularAcc accessibilityLabel="Access Time 24 Regular" />
          <Accessibility16FilledAcc accessibilityLabel="Accessibility 16 Filled" />
          <Accessibility16RegularAcc accessibilityLabel="Accessibility 16 Regular" />
          <Accessibility20FilledAcc accessibilityLabel="Accessibility 20 Filled" />
          <Accessibility20RegularAcc accessibilityLabel="Accessibility 20 Regular" />
          <Accessibility24FilledAcc accessibilityLabel="Accessibility 24 Filled" />
          <Accessibility24RegularAcc accessibilityLabel="Accessibility 24 Regular" />
          <Accessibility28FilledAcc accessibilityLabel="Accessibility 28 Filled" />
          <Accessibility28RegularAcc accessibilityLabel="Accessibility 28 Regular" />
          <Accessibility32FilledAcc accessibilityLabel="Accessibility 32 Filled" />
          <Accessibility32RegularAcc accessibilityLabel="Accessibility 32 Regular" />
          <Accessibility48FilledAcc accessibilityLabel="Accessibility 48 Filled" />
          <Accessibility48RegularAcc accessibilityLabel="Accessibility 48 Regular" />
          <AccessibilityCheckmark20FilledAcc accessibilityLabel="Accessibility Checkmark 20 Filled" />
          <AccessibilityCheckmark20RegularAcc accessibilityLabel="Accessibility Checkmark 20 Regular" />
          <AccessibilityCheckmark24FilledAcc accessibilityLabel="Accessibility Checkmark 24 Filled" />
          <AccessibilityCheckmark24RegularAcc accessibilityLabel="Accessibility Checkmark 24 Regular" />
        </View>
        <View style={{ flexDirection: 'row' }}>
          <AccessibilityCheckmark28FilledAcc accessibilityLabel="Accessibility Checkmark 28 Filled" />
          <AccessibilityCheckmark28RegularAcc accessibilityLabel="Accessibility Checkmark 28 Regular" />
          <AccessibilityCheckmark32FilledAcc accessibilityLabel="Accessibility Checkmark 32 Filled" />
          <AccessibilityCheckmark32RegularAcc accessibilityLabel="Accessibility Checkmark 32 Regular" />
          <AccessibilityCheckmark48FilledAcc accessibilityLabel="Accessibility Checkmark 48 Filled" />
          <AccessibilityCheckmark48RegularAcc accessibilityLabel="Accessibility Checkmark 48 Regular" />
          <Add12FilledAcc accessibilityLabel="Add 12 Filled" />
          <Add12RegularAcc accessibilityLabel="Add 12 Regular" />
          <Add16FilledAcc accessibilityLabel="Add 16 Filled" />
          <Add16RegularAcc accessibilityLabel="Add 16 Regular" />
          <Add20FilledAcc accessibilityLabel="Add 20 Filled" />
          <Add20RegularAcc accessibilityLabel="Add 20 Regular" />
          <Add24FilledAcc accessibilityLabel="Add 24 Filled" />
          <Add24RegularAcc accessibilityLabel="Add 24 Regular" />
          <Add28FilledAcc accessibilityLabel="Add 28 Filled" />
          <Add28RegularAcc accessibilityLabel="Add 28 Regular" />
          <AddCircle12FilledAcc accessibilityLabel="Add Circle 12 Filled" />
          <AddCircle12RegularAcc accessibilityLabel="Add Circle 12 Regular" />
          <AddCircle16FilledAcc accessibilityLabel="Add Circle 16 Filled" />
          <AddCircle16RegularAcc accessibilityLabel="Add Circle 16 Regular" />
        </View>
        <View style={{ flexDirection: 'row' }}>
          <AddCircle20FilledAcc accessibilityLabel="Add Circle 20 Filled" />
          <AddCircle20RegularAcc accessibilityLabel="Add Circle 20 Regular" />
          <AddCircle24FilledAcc accessibilityLabel="Add Circle 24 Filled" />
          <AddCircle24RegularAcc accessibilityLabel="Add Circle 24 Regular" />
          <AddCircle28FilledAcc accessibilityLabel="Add Circle 28 Filled" />
          <AddCircle28RegularAcc accessibilityLabel="Add Circle 28 Regular" />
          <AddCircle32FilledAcc accessibilityLabel="Add Circle 32 Filled" />
          <AddCircle32RegularAcc accessibilityLabel="Add Circle 32 Regular" />
          <AddSquare20FilledAcc accessibilityLabel="Add Square 20 Filled" />
          <AddSquare20RegularAcc accessibilityLabel="Add Square 20 Regular" />
          <AddSquare24FilledAcc accessibilityLabel="Add Square 24 Filled" />
          <AddSquare24RegularAcc accessibilityLabel="Add Square 24 Regular" />
          <AddSquareMultiple16FilledAcc accessibilityLabel="Add Square Multiple 16 Filled" />
          <AddSquareMultiple16RegularAcc accessibilityLabel="Add Square Multiple 16 Regular" />
          <AddSquareMultiple20FilledAcc accessibilityLabel="Add Square Multiple 20 Filled" />
          <AddSquareMultiple20RegularAcc accessibilityLabel="Add Square Multiple 20 Regular" />
          <AddSubtractCircle16FilledAcc accessibilityLabel="Add Subtract Circle 16 Filled" />
          <AddSubtractCircle16RegularAcc accessibilityLabel="Add Subtract Circle 16 Regular" />
          <AddSubtractCircle20FilledAcc accessibilityLabel="Add Subtract Circle 20 Filled" />
          <AddSubtractCircle20RegularAcc accessibilityLabel="Add Subtract Circle 20 Regular" />
        </View>
        <View style={{ flexDirection: 'row' }}>
          <AddSubtractCircle24FilledAcc accessibilityLabel="Add Subtract Circle 24 Filled" />
          <AddSubtractCircle24RegularAcc accessibilityLabel="Add Subtract Circle 24 Regular" />
          <AddSubtractCircle28FilledAcc accessibilityLabel="Add Subtract Circle 28 Filled" />
          <AddSubtractCircle28RegularAcc accessibilityLabel="Add Subtract Circle 28 Regular" />
          <AddSubtractCircle48FilledAcc accessibilityLabel="Add Subtract Circle 48 Filled" />
          <AddSubtractCircle48RegularAcc accessibilityLabel="Add Subtract Circle 48 Regular" />
          <Airplane20FilledAcc accessibilityLabel="Airplane 20 Filled" />
          <Airplane20RegularAcc accessibilityLabel="Airplane 20 Regular" />
          <Airplane24FilledAcc accessibilityLabel="Airplane 24 Filled" />
          <Airplane24RegularAcc accessibilityLabel="Airplane 24 Regular" />
          <AirplaneTakeOff16FilledAcc accessibilityLabel="Airplane Take Off 16 Filled" />
          <AirplaneTakeOff16RegularAcc accessibilityLabel="Airplane Take Off 16 Regular" />
          <AirplaneTakeOff20FilledAcc accessibilityLabel="Airplane Take Off 20 Filled" />
          <AirplaneTakeOff20RegularAcc accessibilityLabel="Airplane Take Off 20 Regular" />
          <AirplaneTakeOff24FilledAcc accessibilityLabel="Airplane Take Off 24 Filled" />
          <AirplaneTakeOff24RegularAcc accessibilityLabel="Airplane Take Off 24 Regular" />
          <Album20FilledAcc accessibilityLabel="Album 20 Filled" />
          <Album20RegularAcc accessibilityLabel="Album 20 Regular" />
          <Album24FilledAcc accessibilityLabel="Album 24 Filled" />
          <Album24RegularAcc accessibilityLabel="Album 24 Regular" />
        </View>
        <View style={{ flexDirection: 'row' }}>
          <AlbumAdd20FilledAcc accessibilityLabel="Album Add 20 Filled" />
          <AlbumAdd20RegularAcc accessibilityLabel="Album Add 20 Regular" />
          <AlbumAdd24FilledAcc accessibilityLabel="Album Add 24 Filled" />
          <AlbumAdd24RegularAcc accessibilityLabel="Album Add 24 Regular" />
          <Alert12FilledAcc accessibilityLabel="Alert 12 Filled" />
          <Alert12RegularAcc accessibilityLabel="Alert 12 Regular" />
          <Alert16FilledAcc accessibilityLabel="Alert 16 Filled" />
          <Alert16RegularAcc accessibilityLabel="Alert 16 Regular" />
          <Alert20FilledAcc accessibilityLabel="Alert 20 Filled" />
          <Alert20RegularAcc accessibilityLabel="Alert 20 Regular" />
          <Alert24FilledAcc accessibilityLabel="Alert 24 Filled" />
          <Alert24RegularAcc accessibilityLabel="Alert 24 Regular" />
          <Alert28FilledAcc accessibilityLabel="Alert 28 Filled" />
          <Alert28RegularAcc accessibilityLabel="Alert 28 Regular" />
          <Alert32FilledAcc accessibilityLabel="Alert 32 Filled" />
          <Alert32RegularAcc accessibilityLabel="Alert 32 Regular" />
          <Alert48FilledAcc accessibilityLabel="Alert 48 Filled" />
          <Alert48RegularAcc accessibilityLabel="Alert 48 Regular" />
          <AlertBadge16FilledAcc accessibilityLabel="Alert Badge 16 Filled" />
          <AlertBadge16RegularAcc accessibilityLabel="Alert Badge 16 Regular" />
        </View>
        <View style={{ flexDirection: 'row' }}>
          <AlertBadge20FilledAcc accessibilityLabel="Alert Badge 20 Filled" />
          <AlertBadge20RegularAcc accessibilityLabel="Alert Badge 20 Regular" />
          <AlertBadge24FilledAcc accessibilityLabel="Alert Badge 24 Filled" />
          <AlertBadge24RegularAcc accessibilityLabel="Alert Badge 24 Regular" />
          <AlertOff16FilledAcc accessibilityLabel="Alert Off 16 Filled" />
          <AlertOff16RegularAcc accessibilityLabel="Alert Off 16 Regular" />
          <AlertOff20FilledAcc accessibilityLabel="Alert Off 20 Filled" />
          <AlertOff20RegularAcc accessibilityLabel="Alert Off 20 Regular" />
          <AlertOff24FilledAcc accessibilityLabel="Alert Off 24 Filled" />
          <AlertOff24RegularAcc accessibilityLabel="Alert Off 24 Regular" />
          <AlertOff28FilledAcc accessibilityLabel="Alert Off 28 Filled" />
          <AlertOff28RegularAcc accessibilityLabel="Alert Off 28 Regular" />
          <AlertOn20FilledAcc accessibilityLabel="Alert On 20 Filled" />
          <AlertOn20RegularAcc accessibilityLabel="Alert On 20 Regular" />
          <AlertOn24FilledAcc accessibilityLabel="Alert On 24 Filled" />
          <AlertOn24RegularAcc accessibilityLabel="Alert On 24 Regular" />
          <AlertSnooze12FilledAcc accessibilityLabel="Alert Snooze 12 Filled" />
          <AlertSnooze12RegularAcc accessibilityLabel="Alert Snooze 12 Regular" />
          <AlertSnooze16FilledAcc accessibilityLabel="Alert Snooze 16 Filled" />
          <AlertSnooze16RegularAcc accessibilityLabel="Alert Snooze 16 Regular" />
        </View>
        <View style={{ flexDirection: 'row' }}>
          <AlertSnooze20FilledAcc accessibilityLabel="Alert Snooze 20 Filled" />
          <AlertSnooze20RegularAcc accessibilityLabel="Alert Snooze 20 Regular" />
          <AlertSnooze24FilledAcc accessibilityLabel="Alert Snooze 24 Filled" />
          <AlertSnooze24RegularAcc accessibilityLabel="Alert Snooze 24 Regular" />
          <AlertUrgent16FilledAcc accessibilityLabel="Alert Urgent 16 Filled" />
          <AlertUrgent16RegularAcc accessibilityLabel="Alert Urgent 16 Regular" />
          <AlertUrgent20FilledAcc accessibilityLabel="Alert Urgent 20 Filled" />
          <AlertUrgent20RegularAcc accessibilityLabel="Alert Urgent 20 Regular" />
          <AlertUrgent24FilledAcc accessibilityLabel="Alert Urgent 24 Filled" />
          <AlertUrgent24RegularAcc accessibilityLabel="Alert Urgent 24 Regular" />
          <AlignBottom16FilledAcc accessibilityLabel="Align Bottom 16 Filled" />
          <AlignBottom16RegularAcc accessibilityLabel="Align Bottom 16 Regular" />
          <AlignBottom20FilledAcc accessibilityLabel="Align Bottom 20 Filled" />
          <AlignBottom20RegularAcc accessibilityLabel="Align Bottom 20 Regular" />
          <AlignBottom24FilledAcc accessibilityLabel="Align Bottom 24 Filled" />
          <AlignBottom24RegularAcc accessibilityLabel="Align Bottom 24 Regular" />
          <AlignBottom28FilledAcc accessibilityLabel="Align Bottom 28 Filled" />
          <AlignBottom28RegularAcc accessibilityLabel="Align Bottom 28 Regular" />
          <AlignBottom32FilledAcc accessibilityLabel="Align Bottom 32 Filled" />
          <AlignBottom32RegularAcc accessibilityLabel="Align Bottom 32 Regular" />
        </View>
        <View style={{ flexDirection: 'row' }}>
          <AlignBottom48FilledAcc accessibilityLabel="Align Bottom 48 Filled" />
          <AlignBottom48RegularAcc accessibilityLabel="Align Bottom 48 Regular" />
          <AlignCenterHorizontal16FilledAcc accessibilityLabel="Align Center Horizontal 16 Filled" />
          <AlignCenterHorizontal16RegularAcc accessibilityLabel="Align Center Horizontal 16 Regular" />
          <AlignCenterHorizontal20FilledAcc accessibilityLabel="Align Center Horizontal 20 Filled" />
          <AlignCenterHorizontal20RegularAcc accessibilityLabel="Align Center Horizontal 20 Regular" />
          <AlignCenterHorizontal24FilledAcc accessibilityLabel="Align Center Horizontal 24 Filled" />
          <AlignCenterHorizontal24RegularAcc accessibilityLabel="Align Center Horizontal 24 Regular" />
          <AlignCenterHorizontal28FilledAcc accessibilityLabel="Align Center Horizontal 28 Filled" />
          <AlignCenterHorizontal28RegularAcc accessibilityLabel="Align Center Horizontal 28 Regular" />
          <AlignCenterHorizontal32FilledAcc accessibilityLabel="Align Center Horizontal 32 Filled" />
          <AlignCenterHorizontal32RegularAcc accessibilityLabel="Align Center Horizontal 32 Regular" />
          <AlignCenterHorizontal48FilledAcc accessibilityLabel="Align Center Horizontal 48 Filled" />
          <AlignCenterHorizontal48RegularAcc accessibilityLabel="Align Center Horizontal 48 Regular" />
          <AlignCenterVertical16FilledAcc accessibilityLabel="Align Center Vertical 16 Filled" />
          <AlignCenterVertical16RegularAcc accessibilityLabel="Align Center Vertical 16 Regular" />
          <AlignCenterVertical20FilledAcc accessibilityLabel="Align Center Vertical 20 Filled" />
          <AlignCenterVertical20RegularAcc accessibilityLabel="Align Center Vertical 20 Regular" />
          <AlignCenterVertical24FilledAcc accessibilityLabel="Align Center Vertical 24 Filled" />
          <AlignCenterVertical24RegularAcc accessibilityLabel="Align Center Vertical 24 Regular" />
        </View>
        <View style={{ flexDirection: 'row' }}>
          <AlignCenterVertical28FilledAcc accessibilityLabel="Align Center Vertical 28 Filled" />
          <AlignCenterVertical28RegularAcc accessibilityLabel="Align Center Vertical 28 Regular" />
          <AlignCenterVertical32FilledAcc accessibilityLabel="Align Center Vertical 32 Filled" />
          <AlignCenterVertical32RegularAcc accessibilityLabel="Align Center Vertical 32 Regular" />
          <AlignCenterVertical48FilledAcc accessibilityLabel="Align Center Vertical 48 Filled" />
          <AlignCenterVertical48RegularAcc accessibilityLabel="Align Center Vertical 48 Regular" />
          <AlignDistributeBottom16FilledAcc accessibilityLabel="Align Distribute Bottom 16 Filled" />
          <AlignDistributeBottom16RegularAcc accessibilityLabel="Align Distribute Bottom 16 Regular" />
          <AlignDistributeLeft16FilledAcc accessibilityLabel="Align Distribute Left 16 Filled" />
          <AlignDistributeLeft16RegularAcc accessibilityLabel="Align Distribute Left 16 Regular" />
          <AlignDistributeRight16FilledAcc accessibilityLabel="Align Distribute Right 16 Filled" />
          <AlignDistributeRight16RegularAcc accessibilityLabel="Align Distribute Right 16 Regular" />
          <AlignDistributeTop16FilledAcc accessibilityLabel="Align Distribute Top 16 Filled" />
          <AlignDistributeTop16RegularAcc accessibilityLabel="Align Distribute Top 16 Regular" />
          <AlignEndHorizontal20FilledAcc accessibilityLabel="Align End Horizontal 20 Filled" />
          <AlignEndHorizontal20RegularAcc accessibilityLabel="Align End Horizontal 20 Regular" />
          <AlignEndVertical20FilledAcc accessibilityLabel="Align End Vertical 20 Filled" />
          <AlignEndVertical20RegularAcc accessibilityLabel="Align End Vertical 20 Regular" />
          <AlignLeft16FilledAcc accessibilityLabel="Align Left 16 Filled" />
          <AlignLeft16RegularAcc accessibilityLabel="Align Left 16 Regular" />
        </View>
        <View style={{ flexDirection: 'row' }}>
          <AlignLeft20FilledAcc accessibilityLabel="Align Left 20 Filled" />
          <AlignLeft20RegularAcc accessibilityLabel="Align Left 20 Regular" />
          <AlignLeft24FilledAcc accessibilityLabel="Align Left 24 Filled" />
          <AlignLeft24RegularAcc accessibilityLabel="Align Left 24 Regular" />
          <AlignLeft28FilledAcc accessibilityLabel="Align Left 28 Filled" />
          <AlignLeft28RegularAcc accessibilityLabel="Align Left 28 Regular" />
          <AlignLeft32FilledAcc accessibilityLabel="Align Left 32 Filled" />
          <AlignLeft32RegularAcc accessibilityLabel="Align Left 32 Regular" />
          <AlignLeft48FilledAcc accessibilityLabel="Align Left 48 Filled" />
          <AlignLeft48RegularAcc accessibilityLabel="Align Left 48 Regular" />
          <AlignRight16FilledAcc accessibilityLabel="Align Right 16 Filled" />
          <AlignRight16RegularAcc accessibilityLabel="Align Right 16 Regular" />
          <AlignRight20FilledAcc accessibilityLabel="Align Right 20 Filled" />
          <AlignRight20RegularAcc accessibilityLabel="Align Right 20 Regular" />
          <AlignRight24FilledAcc accessibilityLabel="Align Right 24 Filled" />
          <AlignRight24RegularAcc accessibilityLabel="Align Right 24 Regular" />
          <AlignRight28FilledAcc accessibilityLabel="Align Right 28 Filled" />
          <AlignRight28RegularAcc accessibilityLabel="Align Right 28 Regular" />
          <AlignRight32FilledAcc accessibilityLabel="Align Right 32 Filled" />
          <AlignRight32RegularAcc accessibilityLabel="Align Right 32 Regular" />
        </View>
        <View style={{ flexDirection: 'row' }}>
          <AlignRight48FilledAcc accessibilityLabel="Align Right 48 Filled" />
          <AlignRight48RegularAcc accessibilityLabel="Align Right 48 Regular" />
          <AlignSpaceAroundHorizontal20FilledAcc accessibilityLabel="Align Space Around Horizontal 20 Filled" />
          <AlignSpaceAroundHorizontal20RegularAcc accessibilityLabel="Align Space Around Horizontal 20 Regular" />
          <AlignSpaceAroundVertical20FilledAcc accessibilityLabel="Align Space Around Vertical 20 Filled" />
          <AlignSpaceAroundVertical20RegularAcc accessibilityLabel="Align Space Around Vertical 20 Regular" />
          <AlignSpaceBetweenHorizontal20FilledAcc accessibilityLabel="Align Space Between Horizontal 20 Filled" />
          <AlignSpaceBetweenHorizontal20RegularAcc accessibilityLabel="Align Space Between Horizontal 20 Regular" />
          <AlignSpaceBetweenVertical20FilledAcc accessibilityLabel="Align Space Between Vertical 20 Filled" />
          <AlignSpaceBetweenVertical20RegularAcc accessibilityLabel="Align Space Between Vertical 20 Regular" />
          <AlignSpaceEvenlyHorizontal20FilledAcc accessibilityLabel="Align Space Evenly Horizontal 20 Filled" />
          <AlignSpaceEvenlyHorizontal20RegularAcc accessibilityLabel="Align Space Evenly Horizontal 20 Regular" />
          <AlignSpaceEvenlyVertical20FilledAcc accessibilityLabel="Align Space Evenly Vertical 20 Filled" />
          <AlignSpaceEvenlyVertical20RegularAcc accessibilityLabel="Align Space Evenly Vertical 20 Regular" />
          <AlignSpaceFitVertical20FilledAcc accessibilityLabel="Align Space Fit Vertical 20 Filled Acc" />
          <AlignSpaceFitVertical20RegularAcc accessibilityLabel="Align Space Fit Vertical 20 Regular Acc" />
          <AlignStartHorizontal20FilledAcc accessibilityLabel="Align Start Horizontal 20 Filled Acc" />
          <AlignStartHorizontal20RegularAcc accessibilityLabel="Align Start Horizontal 20 Regular Acc" />
          <AlignStartVertical20FilledAcc accessibilityLabel="Align Start Vertical 20 Filled Acc" />
          <AlignStartVertical20RegularAcc accessibilityLabel="Align Start Vertical 20 Regular Acc" />
        </View>
        <View style={{ flexDirection: 'row' }}>
          <AlignStretchHorizontal16FilledAcc accessibilityLabel="Align Stretch Horizontal 16 Filled Acc" />
          <AlignStretchHorizontal16RegularAcc accessibilityLabel="Align Stretch Horizontal 16 Regular Acc" />
          <AlignStretchHorizontal20FilledAcc accessibilityLabel="Align Stretch Horizontal 20 Filled Acc" />
          <AlignStretchHorizontal20RegularAcc accessibilityLabel="Align Stretch Horizontal 20 Regular Acc" />
          <AlignStretchVertical16FilledAcc accessibilityLabel="Align Stretch Vertical 16 Filled Acc" />
          <AlignStretchVertical16RegularAcc accessibilityLabel="Align Stretch Vertical 16 Regular Acc" />
          <AlignStretchVertical20FilledAcc accessibilityLabel="Align Stretch Vertical 20 Filled Acc" />
          <AlignStretchVertical20RegularAcc accessibilityLabel="Align Stretch Vertical 20 Regular Acc" />
          <AlignTop16FilledAcc accessibilityLabel="Align Top 16 Filled Acc" />
          <AlignTop16RegularAcc accessibilityLabel="Align Top 16 Regular Acc" />
          <AlignTop20FilledAcc accessibilityLabel="Align Top 20 Filled Acc" />
          <AlignTop20RegularAcc accessibilityLabel="Align Top 20 Regular Acc" />
          <AlignTop24FilledAcc accessibilityLabel="Align Top 24 Filled Acc" />
          <AlignTop24RegularAcc accessibilityLabel="Align Top 24 Regular Acc" />
          <AlignTop28FilledAcc accessibilityLabel="Align Top 28 Filled Acc" />
          <AlignTop28RegularAcc accessibilityLabel="Align Top 28 Regular Acc" />
          <AlignTop32FilledAcc accessibilityLabel="Align Top 32 Filled Acc" />
          <AlignTop32RegularAcc accessibilityLabel="Align Top 32 Regular Acc" />
          <AlignTop48FilledAcc accessibilityLabel="Align Top 48 Filled Acc" />
          <AlignTop48RegularAcc accessibilityLabel="Align Top 48 Regular Acc" />
        </View>
        <View style={{ flexDirection: 'row' }}>
          <AnimalCat16FilledAcc accessibilityLabel="Animal Cat 16 Filled" />
          <AnimalCat16RegularAcc accessibilityLabel="Animal Cat 16 Regular" />
          <AnimalCat20FilledAcc accessibilityLabel="Animal Cat 20 Filled" />
          <AnimalCat20RegularAcc accessibilityLabel="Animal Cat 20 Regular" />
          <AnimalCat24FilledAcc accessibilityLabel="Animal Cat 24 Filled" />
          <AnimalCat24RegularAcc accessibilityLabel="Animal Cat 24 Regular" />
          <AnimalCat28FilledAcc accessibilityLabel="Animal Cat 28 Filled" />
          <AnimalCat28RegularAcc accessibilityLabel="Animal Cat 28 Regular" />
          <AnimalDog16FilledAcc accessibilityLabel="Animal Dog 16 Filled" />
          <AnimalDog16RegularAcc accessibilityLabel="Animal Dog 16 Regular" />
          <AnimalDog20FilledAcc accessibilityLabel="Animal Dog 20 Filled" />
          <AnimalDog20RegularAcc accessibilityLabel="Animal Dog 20 Regular" />
          <AnimalDog24FilledAcc accessibilityLabel="Animal Dog 24 Filled" />
          <AnimalDog24RegularAcc accessibilityLabel="Animal Dog 24 Regular" />
          <AnimalRabbit16FilledAcc accessibilityLabel="Animal Rabbit 16 Filled" />
          <AnimalRabbit16RegularAcc accessibilityLabel="Animal Rabbit 16 Regular" />
          <AnimalRabbit20FilledAcc accessibilityLabel="Animal Rabbit 20 Filled" />
          <AnimalRabbit20RegularAcc accessibilityLabel="Animal Rabbit 20 Regular" />
          <AnimalRabbit24FilledAcc accessibilityLabel="Animal Rabbit 24 Filled" />
          <AnimalRabbit24RegularAcc accessibilityLabel="Animal Rabbit 24 Regular" />
        </View>
        <View style={{ flexDirection: 'row' }}>
          <AnimalRabbit28FilledAcc accessibilityLabel="Animal Rabbit 28 Filled" />
          <AnimalRabbit28RegularAcc accessibilityLabel="Animal Rabbit 28 Regular" />
          <AnimalRabbit32FilledAcc accessibilityLabel="Animal Rabbit 32 Filled" />
          <AnimalRabbit32RegularAcc accessibilityLabel="Animal Rabbit 32 Regular" />
          <AnimalRabbitOff20FilledAcc accessibilityLabel="Animal Rabbit Off 20 Filled" />
          <AnimalRabbitOff20RegularAcc accessibilityLabel="Animal Rabbit Off 20 Regular" />
          <AnimalRabbitOff32FilledAcc accessibilityLabel="Animal Rabbit Off 32 Filled" />
          <AnimalRabbitOff32RegularAcc accessibilityLabel="Animal Rabbit Off 32 Regular" />
          <AnimalTurtle16FilledAcc accessibilityLabel="Animal Turtle 16 Filled" />
          <AnimalTurtle16RegularAcc accessibilityLabel="Animal Turtle 16 Regular" />
          <AnimalTurtle20FilledAcc accessibilityLabel="Animal Turtle 20 Filled" />
          <AnimalTurtle20RegularAcc accessibilityLabel="Animal Turtle 20 Regular" />
          <AnimalTurtle24FilledAcc accessibilityLabel="Animal Turtle 24 Filled" />
          <AnimalTurtle24RegularAcc accessibilityLabel="Animal Turtle 24 Regular" />
          <AnimalTurtle28FilledAcc accessibilityLabel="Animal Turtle 28 Filled" />
          <AnimalTurtle28RegularAcc accessibilityLabel="Animal Turtle 28 Regular" />
          <AppFolder16FilledAcc accessibilityLabel="App Folder 16 Filled" />
          <AppFolder16RegularAcc accessibilityLabel="App Folder 16 Regular" />
          <AppFolder20FilledAcc accessibilityLabel="App Folder 20 Filled" />
          <AppFolder20RegularAcc accessibilityLabel="App Folder 20 Regular" />
        </View>
        <View style={{ flexDirection: 'row' }}>
          <AppFolder24FilledAcc accessibilityLabel="App Folder 24 Filled" />
          <AppFolder24RegularAcc accessibilityLabel="App Folder 24 Regular" />
          <AppFolder28FilledAcc accessibilityLabel="App Folder 28 Filled" />
          <AppFolder28RegularAcc accessibilityLabel="App Folder 28 Regular" />
          <AppFolder32FilledAcc accessibilityLabel="App Folder 32 Filled" />
          <AppFolder32RegularAcc accessibilityLabel="App Folder 32 Regular" />
          <AppFolder48FilledAcc accessibilityLabel="App Folder 48 Filled" />
          <AppFolder48RegularAcc accessibilityLabel="App Folder 48 Regular" />
          <AppGeneric20FilledAcc accessibilityLabel="App Generic 20 Filled" />
          <AppGeneric20RegularAcc accessibilityLabel="App Generic 20 Regular" />
          <AppGeneric24FilledAcc accessibilityLabel="App Generic 24 Filled" />
          <AppGeneric24RegularAcc accessibilityLabel="App Generic 24 Regular" />
          <AppGeneric32FilledAcc accessibilityLabel="App Generic 32 Filled" />
          <AppGeneric32RegularAcc accessibilityLabel="App Generic 32 Regular" />
          <AppRecent20FilledAcc accessibilityLabel="App Recent 20 Filled" />
          <AppRecent20RegularAcc accessibilityLabel="App Recent 20 Regular" />
          <AppRecent24FilledAcc accessibilityLabel="App Recent 24 Filled" />
          <AppRecent24RegularAcc accessibilityLabel="App Recent 24 Regular" />
          <AppStore24FilledAcc accessibilityLabel="App Store 24 Filled" />
          <AppStore24RegularAcc accessibilityLabel="App Store 24 Regular" />
        </View>
        <View style={{ flexDirection: 'row' }}>
          <AppTitle20FilledAcc accessibilityLabel="App Title 20 Filled" />
          <AppTitle20RegularAcc accessibilityLabel="App Title 20 Regular" />
          <AppTitle24FilledAcc accessibilityLabel="App Title 24 Filled" />
          <AppTitle24RegularAcc accessibilityLabel="App Title 24 Regular" />
          <ApprovalsApp16FilledAcc accessibilityLabel="Approvals App 16 Filled" />
          <ApprovalsApp16RegularAcc accessibilityLabel="Approvals App 16 Regular" />
          <ApprovalsApp20FilledAcc accessibilityLabel="Approvals App 20 Filled" />
          <ApprovalsApp20RegularAcc accessibilityLabel="Approvals App 20 Regular" />
          <ApprovalsApp24FilledAcc accessibilityLabel="Approvals App 24 Filled" />
          <ApprovalsApp24RegularAcc accessibilityLabel="Approvals App 24 Regular" />
          <ApprovalsApp28FilledAcc accessibilityLabel="Approvals App 28 Filled" />
          <ApprovalsApp28RegularAcc accessibilityLabel="Approvals App 28 Regular" />
          <ApprovalsApp32FilledAcc accessibilityLabel="Approvals App 32 Filled" />
          <ApprovalsApp32RegularAcc accessibilityLabel="Approvals App 32 Regular" />
          <Apps16FilledAcc accessibilityLabel="Apps 16 Filled" />
          <Apps16RegularAcc accessibilityLabel="Apps 16 Regular" />
          <Apps20FilledAcc accessibilityLabel="Apps 20 Filled" />
          <Apps20RegularAcc accessibilityLabel="Apps 20 Regular" />
          <Apps24FilledAcc accessibilityLabel="Apps 24 Filled" />
          <Apps24RegularAcc accessibilityLabel="Apps 24 Regular" />
        </View>
        <View style={{ flexDirection: 'row' }}>
          <Apps28FilledAcc accessibilityLabel="Apps 28 Filled" />
          <Apps28RegularAcc accessibilityLabel="Apps 28 Regular" />
          <Apps32FilledAcc accessibilityLabel="Apps 32 Filled" />
          <Apps32RegularAcc accessibilityLabel="Apps 32 Regular" />
          <AppsAddIn16FilledAcc accessibilityLabel="Apps Add In 16 Filled" />
          <AppsAddIn16RegularAcc accessibilityLabel="Apps Add In 16 Regular" />
          <AppsAddIn20FilledAcc accessibilityLabel="Apps Add In 20 Filled" />
          <AppsAddIn20RegularAcc accessibilityLabel="Apps Add In 20 Regular" />
          <AppsAddIn24FilledAcc accessibilityLabel="Apps Add In 24 Filled" />
          <AppsAddIn24RegularAcc accessibilityLabel="Apps Add In 24 Regular" />
          <AppsAddIn28FilledAcc accessibilityLabel="Apps Add In 28 Filled" />
          <AppsAddIn28RegularAcc accessibilityLabel="Apps Add In 28 Regular" />
          <AppsList20FilledAcc accessibilityLabel="Apps List 20 Filled" />
          <AppsList20RegularAcc accessibilityLabel="Apps List 20 Regular" />
          <AppsList24FilledAcc accessibilityLabel="Apps List 24 Filled" />
          <AppsList24RegularAcc accessibilityLabel="Apps List 24 Regular" />
          <AppsListDetail20FilledAcc accessibilityLabel="Apps List Detail 20 Filled" />
          <AppsListDetail20RegularAcc accessibilityLabel="Apps List Detail 20 Regular" />
          <AppsListDetail24FilledAcc accessibilityLabel="Apps List Detail 24 Filled" />
          <AppsListDetail24RegularAcc accessibilityLabel="Apps List Detail 24 Regular" />
        </View>
        <View style={{ flexDirection: 'row' }}>
          <Archive16FilledAcc accessibilityLabel="Archive 16 Filled" />
          <Archive16RegularAcc accessibilityLabel="Archive 16 Regular" />
          <Archive20FilledAcc accessibilityLabel="Archive 20 Filled" />
          <Archive20RegularAcc accessibilityLabel="Archive 20 Regular" />
          <Archive24FilledAcc accessibilityLabel="Archive 24 Filled" />
          <Archive24RegularAcc accessibilityLabel="Archive 24 Regular" />
          <Archive28FilledAcc accessibilityLabel="Archive 28 Filled" />
          <Archive28RegularAcc accessibilityLabel="Archive 28 Regular" />
          <Archive32FilledAcc accessibilityLabel="Archive 32 Filled" />
          <Archive32RegularAcc accessibilityLabel="Archive 32 Regular" />
          <Archive48FilledAcc accessibilityLabel="Archive 48 Filled" />
          <Archive48RegularAcc accessibilityLabel="Archive 48 Regular" />
          <ArchiveArrowBack16FilledAcc accessibilityLabel="Archive Arrow Back 16 Filled" />
          <ArchiveArrowBack16RegularAcc accessibilityLabel="Archive Arrow Back 16 Regular" />
          <ArchiveArrowBack20FilledAcc accessibilityLabel="Archive Arrow Back 20 Filled" />
          <ArchiveArrowBack20RegularAcc accessibilityLabel="Archive Arrow Back 20 Regular" />
          <ArchiveArrowBack24FilledAcc accessibilityLabel="Archive Arrow Back 24 Filled" />
          <ArchiveArrowBack24RegularAcc accessibilityLabel="Archive Arrow Back 24 Regular" />
          <ArchiveArrowBack28FilledAcc accessibilityLabel="Archive Arrow Back 28 Filled" />
          <ArchiveArrowBack28RegularAcc accessibilityLabel="Archive Arrow Back 28 Regular" />
        </View>
        <View style={{ flexDirection: 'row' }}>
          <ArchiveArrowBack32FilledAcc accessibilityLabel="Archive Arrow Back 32 Filled" />
          <ArchiveArrowBack32RegularAcc accessibilityLabel="Archive Arrow Back 32 Regular" />
          <ArchiveArrowBack48FilledAcc accessibilityLabel="Archive Arrow Back 48 Filled" />
          <ArchiveArrowBack48RegularAcc accessibilityLabel="Archive Arrow Back 48 Regular" />
          <ArchiveMultiple16FilledAcc accessibilityLabel="Archive Multiple 16 Filled" />
          <ArchiveMultiple16RegularAcc accessibilityLabel="Archive Multiple 16 Regular" />
          <ArchiveMultiple20FilledAcc accessibilityLabel="Archive Multiple 20 Filled" />
          <ArchiveMultiple20RegularAcc accessibilityLabel="Archive Multiple 20 Regular" />
          <ArchiveMultiple24FilledAcc accessibilityLabel="Archive Multiple 24 Filled" />
          <ArchiveMultiple24RegularAcc accessibilityLabel="Archive Multiple 24 Regular" />
          <ArchiveSettings16FilledAcc accessibilityLabel="Archive Settings 16 Filled" />
          <ArchiveSettings16RegularAcc accessibilityLabel="Archive Settings 16 Regular" />
          <ArchiveSettings20FilledAcc accessibilityLabel="Archive Settings 20 Filled" />
          <ArchiveSettings20RegularAcc accessibilityLabel="Archive Settings 20 Regular" />
          <ArchiveSettings24FilledAcc accessibilityLabel="Archive Settings 24 Filled" />
          <ArchiveSettings24RegularAcc accessibilityLabel="Archive Settings 24 Regular" />
          <ArchiveSettings28FilledAcc accessibilityLabel="Archive Settings 28 Filled" />
          <ArchiveSettings28RegularAcc accessibilityLabel="Archive Settings 28 Regular" />
          <ArrowAutofitContent20FilledAcc accessibilityLabel="Arrow Autofit Content 20 Filled" />
          <ArrowAutofitContent20RegularAcc accessibilityLabel="Arrow Autofit Content 20 Regular" />
        </View>
        <View style={{ flexDirection: 'row' }}>
          <ArrowAutofitContent24FilledAcc accessibilityLabel="Arrow Autofit Content 24 Filled" />
          <ArrowAutofitContent24RegularAcc accessibilityLabel="Arrow Autofit Content 24 Regular" />
          <ArrowAutofitDown20FilledAcc accessibilityLabel="Arrow Autofit Down 20 Filled" />
          <ArrowAutofitDown20RegularAcc accessibilityLabel="Arrow Autofit Down 20 Regular" />
          <ArrowAutofitDown24FilledAcc accessibilityLabel="Arrow Autofit Down 24 Filled" />
          <ArrowAutofitDown24RegularAcc accessibilityLabel="Arrow Autofit Down 24 Regular" />
          <ArrowAutofitHeight20FilledAcc accessibilityLabel="Arrow Autofit Height 20 Filled" />
          <ArrowAutofitHeight20RegularAcc accessibilityLabel="Arrow Autofit Height 20 Regular" />
          <ArrowAutofitHeight24FilledAcc accessibilityLabel="Arrow Autofit Height 24 Filled" />
          <ArrowAutofitHeight24RegularAcc accessibilityLabel="Arrow Autofit Height 24 Regular" />
          <ArrowAutofitHeightDotted20FilledAcc accessibilityLabel="Arrow Autofit Height Dotted 20 Filled" />
          <ArrowAutofitHeightDotted20RegularAcc accessibilityLabel="Arrow Autofit Height Dotted 20 Regular" />
          <ArrowAutofitHeightDotted24FilledAcc accessibilityLabel="Arrow Autofit Height Dotted 24 Filled" />
          <ArrowAutofitHeightDotted24RegularAcc accessibilityLabel="Arrow Autofit Height Dotted 24 Regular" />
          <ArrowAutofitUp20FilledAcc accessibilityLabel="Arrow Autofit Up 20 Filled" />
          <ArrowAutofitUp20RegularAcc accessibilityLabel="Arrow Autofit Up 20 Regular" />
          <ArrowAutofitUp24FilledAcc accessibilityLabel="Arrow Autofit Up 24 Filled" />
          <ArrowAutofitUp24RegularAcc accessibilityLabel="Arrow Autofit Up 24 Regular" />
          <ArrowAutofitWidth20FilledAcc accessibilityLabel="Arrow Autofit Width 20 Filled" />
          <ArrowAutofitWidth20RegularAcc accessibilityLabel="Arrow Autofit Width 20 Regular" />
        </View>
        <View style={{ flexDirection: 'row' }}>
          <ArrowAutofitWidth24FilledAcc accessibilityLabel="Arrow Autofit Width 24 Filled" />
          <ArrowAutofitWidth24RegularAcc accessibilityLabel="Arrow Autofit Width 24 Regular" />
          <ArrowAutofitWidthDotted20FilledAcc accessibilityLabel="Arrow Autofit Width Dotted 20 Filled" />
          <ArrowAutofitWidthDotted20RegularAcc accessibilityLabel="Arrow Autofit Width Dotted 20 Regular" />
          <ArrowAutofitWidthDotted24FilledAcc accessibilityLabel="Arrow Autofit Width Dotted 24 Filled" />
          <ArrowAutofitWidthDotted24RegularAcc accessibilityLabel="Arrow Autofit Width Dotted 24 Regular" />
          <ArrowBetweenDown20FilledAcc accessibilityLabel="Arrow Between Down 20 Filled" />
          <ArrowBetweenDown20RegularAcc accessibilityLabel="Arrow Between Down 20 Regular" />
          <ArrowBetweenDown24FilledAcc accessibilityLabel="Arrow Between Down 24 Filled" />
          <ArrowBetweenDown24RegularAcc accessibilityLabel="Arrow Between Down 24 Regular" />
          <ArrowBetweenUp20FilledAcc accessibilityLabel="Arrow Between Up 20 Filled" />
          <ArrowBetweenUp20RegularAcc accessibilityLabel="Arrow Between Up 20 Regular" />
          <ArrowBidirectionalUpDown12FilledAcc accessibilityLabel="Arrow Bidirectional Up Down 12 Filled" />
          <ArrowBidirectionalUpDown12RegularAcc accessibilityLabel="Arrow Bidirectional Up Down 12 Regular" />
          <ArrowBidirectionalUpDown16FilledAcc accessibilityLabel="Arrow Bidirectional Up Down 16 Filled" />
          <ArrowBidirectionalUpDown16RegularAcc accessibilityLabel="Arrow Bidirectional Up Down 16 Regular" />
          <ArrowBidirectionalUpDown20FilledAcc accessibilityLabel="Arrow Bidirectional Up Down 20 Filled" />
          <ArrowBidirectionalUpDown20RegularAcc accessibilityLabel="Arrow Bidirectional Up Down 20 Regular" />
          <ArrowBidirectionalUpDown24FilledAcc accessibilityLabel="Arrow Bidirectional Up Down 24 Filled" />
          <ArrowBidirectionalUpDown24RegularAcc accessibilityLabel="Arrow Bidirectional Up Down 24 Regular" />
        </View>
        <View style={{ flexDirection: 'row' }}>
          <ArrowBounce16FilledAcc accessibilityLabel="Arrow Bounce 16 Filled" />
          <ArrowBounce16RegularAcc accessibilityLabel="Arrow Bounce 16 Regular" />
          <ArrowBounce20FilledAcc accessibilityLabel="Arrow Bounce 20 Filled" />
          <ArrowBounce20RegularAcc accessibilityLabel="Arrow Bounce 20 Regular" />
          <ArrowBounce24FilledAcc accessibilityLabel="Arrow Bounce 24 Filled" />
          <ArrowBounce24RegularAcc accessibilityLabel="Arrow Bounce 24 Regular" />
          <ArrowCircleDown12FilledAcc accessibilityLabel="Arrow Circle Down 12 Filled" />
          <ArrowCircleDown12RegularAcc accessibilityLabel="Arrow Circle Down 12 Regular" />
          <ArrowCircleDown16FilledAcc accessibilityLabel="Arrow Circle Down 16 Filled" />
          <ArrowCircleDown16RegularAcc accessibilityLabel="Arrow Circle Down 16 Regular" />
          <ArrowCircleDown20FilledAcc accessibilityLabel="Arrow Circle Down 20 Filled" />
          <ArrowCircleDown20RegularAcc accessibilityLabel="Arrow Circle Down 20 Regular" />
          <ArrowCircleDown24FilledAcc accessibilityLabel="Arrow Circle Down 24 Filled" />
          <ArrowCircleDown24RegularAcc accessibilityLabel="Arrow Circle Down 24 Regular" />
          <ArrowCircleDown28FilledAcc accessibilityLabel="Arrow Circle Down 28 Filled" />
          <ArrowCircleDown28RegularAcc accessibilityLabel="Arrow Circle Down 28 Regular" />
          <ArrowCircleDown32FilledAcc accessibilityLabel="Arrow Circle Down 32 Filled" />
          <ArrowCircleDown32RegularAcc accessibilityLabel="Arrow Circle Down 32 Regular" />
          <ArrowCircleDown48FilledAcc accessibilityLabel="Arrow Circle Down 48 Filled" />
          <ArrowCircleDown48RegularAcc accessibilityLabel="Arrow Circle Down 48 Regular" />
        </View>
        <View style={{ flexDirection: 'row' }}>
          <ArrowCircleDownDouble20FilledAcc accessibilityLabel="Arrow Circle Down Double 20 Filled" />
          <ArrowCircleDownDouble20RegularAcc accessibilityLabel="Arrow Circle Down Double 20 Regular" />
          <ArrowCircleDownDouble24FilledAcc accessibilityLabel="Arrow Circle Down Double 24 Filled" />
          <ArrowCircleDownDouble24RegularAcc accessibilityLabel="Arrow Circle Down Double 24 Regular" />
          <ArrowCircleDownRight16FilledAcc accessibilityLabel="Arrow Circle Down Right 16 Filled" />
          <ArrowCircleDownRight16RegularAcc accessibilityLabel="Arrow Circle Down Right 16 Regular" />
          <ArrowCircleDownRight20FilledAcc accessibilityLabel="Arrow Circle Down Right 20 Filled" />
          <ArrowCircleDownRight20RegularAcc accessibilityLabel="Arrow Circle Down Right 20 Regular" />
          <ArrowCircleDownRight24FilledAcc accessibilityLabel="Arrow Circle Down Right 24 Filled" />
          <ArrowCircleDownRight24RegularAcc accessibilityLabel="Arrow Circle Down Right 24 Regular" />
          <ArrowCircleDownSplit20FilledAcc accessibilityLabel="Arrow Circle Down Split 20 Filled" />
          <ArrowCircleDownSplit20RegularAcc accessibilityLabel="Arrow Circle Down Split 20 Regular" />
          <ArrowCircleDownSplit24FilledAcc accessibilityLabel="Arrow Circle Down Split 24 Filled" />
          <ArrowCircleDownSplit24RegularAcc accessibilityLabel="Arrow Circle Down Split 24 Regular" />
          <ArrowCircleDownUp20FilledAcc accessibilityLabel="Arrow Circle Down Up 20 Filled" />
          <ArrowCircleDownUp20RegularAcc accessibilityLabel="Arrow Circle Down Up 20 Regular" />
          <ArrowCircleLeft12FilledAcc accessibilityLabel="Arrow Circle Left 12 Filled" />
          <ArrowCircleLeft12RegularAcc accessibilityLabel="Arrow Circle Left 12 Regular" />
          <ArrowCircleLeft16FilledAcc accessibilityLabel="Arrow Circle Left 16 Filled" />
          <ArrowCircleLeft16RegularAcc accessibilityLabel="Arrow Circle Left 16 Regular" />
        </View>
        <View style={{ flexDirection: 'row' }}>
          <ArrowCircleLeft20FilledAcc accessibilityLabel="Arrow Circle Left 20 Filled" />
          <ArrowCircleLeft20RegularAcc accessibilityLabel="Arrow Circle Left 20 Regular" />
          <ArrowCircleLeft24FilledAcc accessibilityLabel="Arrow Circle Left 24 Filled" />
          <ArrowCircleLeft24RegularAcc accessibilityLabel="Arrow Circle Left 24 Regular" />
          <ArrowCircleLeft28FilledAcc accessibilityLabel="Arrow Circle Left 28 Filled" />
          <ArrowCircleLeft28RegularAcc accessibilityLabel="Arrow Circle Left 28 Regular" />
          <ArrowCircleLeft32FilledAcc accessibilityLabel="Arrow Circle Left 32 Filled" />
          <ArrowCircleLeft32RegularAcc accessibilityLabel="Arrow Circle Left 32 Regular" />
          <ArrowCircleLeft48FilledAcc accessibilityLabel="Arrow Circle Left 48 Filled" />
          <ArrowCircleLeft48RegularAcc accessibilityLabel="Arrow Circle Left 48 Regular" />
          <ArrowCircleRight12FilledAcc accessibilityLabel="Arrow Circle Right 12 Filled" />
          <ArrowCircleRight12RegularAcc accessibilityLabel="Arrow Circle Right 12 Regular" />
          <ArrowCircleRight16FilledAcc accessibilityLabel="Arrow Circle Right 16 Filled" />
          <ArrowCircleRight16RegularAcc accessibilityLabel="Arrow Circle Right 16 Regular" />
          <ArrowCircleRight20FilledAcc accessibilityLabel="Arrow Circle Right 20 Filled" />
          <ArrowCircleRight20RegularAcc accessibilityLabel="Arrow Circle Right 20 Regular" />
          <ArrowCircleRight24FilledAcc accessibilityLabel="Arrow Circle Right 24 Filled" />
          <ArrowCircleRight24RegularAcc accessibilityLabel="Arrow Circle Right 24 Regular" />
          <ArrowCircleRight28FilledAcc accessibilityLabel="Arrow Circle Right 28 Filled" />
          <ArrowCircleRight28RegularAcc accessibilityLabel="Arrow Circle Right 28 Regular" />
          <ArrowCircleRight32FilledAcc accessibilityLabel="Arrow Circle Right 32 Filled" />
          <ArrowCircleRight32RegularAcc accessibilityLabel="Arrow Circle Right 32 Regular" />
          <ArrowCircleRight48FilledAcc accessibilityLabel="Arrow Circle Right 48 Filled" />
          <ArrowCircleRight48RegularAcc accessibilityLabel="Arrow Circle Right 48 Regular" />
        </View>
        <View style={{ flexDirection: 'row' }}>
          <ArrowCircleUp12FilledAcc accessibilityLabel="Arrow Circle Up 12 Filled" />
          <ArrowCircleUp12RegularAcc accessibilityLabel="Arrow Circle Up 12 Regular" />
          <ArrowCircleUp16FilledAcc accessibilityLabel="Arrow Circle Up 16 Filled" />
          <ArrowCircleUp16RegularAcc accessibilityLabel="Arrow Circle Up 16 Regular" />
          <ArrowCircleUp20FilledAcc accessibilityLabel="Arrow Circle Up 20 Filled" />
          <ArrowCircleUp20RegularAcc accessibilityLabel="Arrow Circle Up 20 Regular" />
          <ArrowCircleUp24FilledAcc accessibilityLabel="Arrow Circle Up 24 Filled" />
          <ArrowCircleUp24RegularAcc accessibilityLabel="Arrow Circle Up 24 Regular" />
          <ArrowCircleUp28FilledAcc accessibilityLabel="Arrow Circle Up 28 Filled" />
          <ArrowCircleUp28RegularAcc accessibilityLabel="Arrow Circle Up 28 Regular" />
          <ArrowCircleUp32FilledAcc accessibilityLabel="Arrow Circle Up 32 Filled" />
          <ArrowCircleUp32RegularAcc accessibilityLabel="Arrow Circle Up 32 Regular" />
          <ArrowCircleUp48FilledAcc accessibilityLabel="Arrow Circle Up 48 Filled" />
          <ArrowCircleUp48RegularAcc accessibilityLabel="Arrow Circle Up 48 Regular" />
          <ArrowCircleUpLeft20FilledAcc accessibilityLabel="Arrow Circle Up Left 20 Filled" />
          <ArrowCircleUpLeft20RegularAcc accessibilityLabel="Arrow Circle Up Left 20 Regular" />
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
