import { PersonaSize, PersonaCoinColor, PersonaPresence } from './PersonaCoin.types';
import { ImageURISource } from 'react-native';

interface Dictionary<T> {
  [key: string]: T;
}

const presenceIconCache: Dictionary<ImageURISource> = {
  offline: require('./icons/offline.png'),
  online: require('./icons/online.png'),
  away: require('./icons/away.png'),
  dnd: require('./icons/dnd.png'),
  blocked: require('./icons/blocked.png'),
  busy: require('./icons/busy.png')
};

export function getPhysicalSize(size: PersonaSize): number {
  switch (size) {
    case PersonaSize.size8:
      return 8;
    case PersonaSize.size24:
      return 24;
    case PersonaSize.size32:
      return 32;
    case PersonaSize.size40:
      return 40;
    case PersonaSize.size48:
      return 48;
    case PersonaSize.size56:
      return 56;
    case PersonaSize.size72:
      return 72;
    case PersonaSize.size100:
      return 100;
    case PersonaSize.size120:
      return 120;
  }
}

export function getIconSize(size: PersonaSize): number {
  switch (size) {
    case PersonaSize.size8:
    case PersonaSize.size24:
    case PersonaSize.size32:
      return 8;
    case PersonaSize.size40:
    case PersonaSize.size48:
      return 12;
    case PersonaSize.size56:
      return 16;
    case PersonaSize.size72:
      return 20;
    case PersonaSize.size100:
      return 28;
    case PersonaSize.size120:
      return 32;
  }
}

export function getFontSize(size: PersonaSize): number {
  switch (size) {
    case PersonaSize.size8:
      return 8;
    case PersonaSize.size24:
      return 10;
    case PersonaSize.size32:
      return 12;
    case PersonaSize.size40:
      return 14;
    case PersonaSize.size48:
      return 16;
    case PersonaSize.size56:
      return 18;
    case PersonaSize.size72:
      return 20;
    case PersonaSize.size100:
      return 36;
    case PersonaSize.size120:
      return 40;
  }
}

export function getPresenceIconSource(presence: PersonaPresence): ImageURISource {
  return presenceIconCache[PersonaPresence[presence]];
}

function personaCoinColorToHexCode(personaCoinColor: PersonaCoinColor): string {
  switch (personaCoinColor) {
    case PersonaCoinColor.lightBlue:
      return '#4F6BED';
    case PersonaCoinColor.blue:
      return '#0078D4';
    case PersonaCoinColor.darkBlue:
      return '#004E8C';
    case PersonaCoinColor.teal:
      return '#038387';
    case PersonaCoinColor.green:
      return '#498205';
    case PersonaCoinColor.darkGreen:
      return '#0B6A0B';
    case PersonaCoinColor.lightPink:
      return '#C239B3';
    case PersonaCoinColor.pink:
      return '#E3008C';
    case PersonaCoinColor.magenta:
      return '#881798';
    case PersonaCoinColor.purple:
      return '#5C2E91';
    case PersonaCoinColor.orange:
      return '#CA5010';
    case PersonaCoinColor.lightRed:
      return '#D13438';
    case PersonaCoinColor.darkRed:
      return '#A4262C';
    case PersonaCoinColor.violet:
      return '#8764B8';
    case PersonaCoinColor.gold:
      return '#986F0B';
    case PersonaCoinColor.burgundy:
      return '#750B1C';
    case PersonaCoinColor.warmGray:
      return '#7A7574';
    case PersonaCoinColor.cyan:
      return '#005B70';
    case PersonaCoinColor.rust:
      return '#8E562E';
    case PersonaCoinColor.coolGray:
      return '#69797E';
  }
}

export function convertCoinColor(coinColor?: PersonaCoinColor): string | undefined {
  return coinColor === undefined ? undefined : personaCoinColorToHexCode(coinColor);
}
