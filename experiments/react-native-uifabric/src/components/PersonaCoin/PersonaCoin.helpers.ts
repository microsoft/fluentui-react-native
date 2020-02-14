import { PersonaSize, PersonaCoinColor, PersonaPresence } from './PersonaCoin.types';
import { ImageURISource } from 'react-native';

interface Dictionary<T> {
  [key: string]: T;
}

const presenceIconCache: Dictionary<ImageURISource> = {
  offline: { uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAMAAADXqc3KAAAANlBMVEUAAACoxM+oxM+oxM+oxM+oxM+oxM+oxM+oxM////+oxM/W5OmzzNX5+/z3+vvu9Pbt8/Xj7PAAKKEtAAAACXRSTlMA6bWcZQpiXgXWfJCWAAAAeElEQVQoz52RSQ7EIAwEx0AWymT7/2dHYpgoPvQldeySsGl/XjOVZGCpTDFfjIEtj3jN0Pzc99Mb5PUWGbwOHPI/n+GqNxfMY67h9YFjvw0KrQYapYuER+GkLowjigPrArYoNpBCPiWHy3XlB1UlqkRZuziUPO1bvszLC8V87ko/AAAAAElFTkSuQmCC'},
  online: { uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAMAAADXqc3KAAAAWlBMVEUAAABusAVusAVusAVusAVusAVusAVusAVusAVusAVusAVusAVusAVusAVusAVusAVusAVusAVusAX////N4bi61517tivn8d3e7NL3+vTE3Kux0o6nzH6GvEWFZ26xAAAAEnRSTlMA8eNrEQj6syHTeXrKshzZ19JHa6QpAAAApUlEQVQoz4WS6w7CIAyFBwwGbE5th87b+7+mCDXcIp4/NN9J2tJ2+KdRTFyx0yTGAkvLgMRmmbg2kMnoL185FOIr5Vmg0hKzWWhkQz+sNdinN1Eg9wyP8MYh5xvewjt5gxcct9iYN1SIXvsj46C8EWvfEZ0jTsYxRJcrYuLAqTg5xKm4AHL2xEH8/GBvJIM819xIWkc9dt1ZFEnO+WrbY1CcjqGnN0xiGcyuKFtcAAAAAElFTkSuQmCC'},
  away: { uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAMAAADXqc3KAAAAP1BMVEUAAAD6yRT6yRT6yRT6yRT6yRT6yRT6yRT6yRT6yRT6yRT6yRT////6zCP95pH95Yv++OL84Hn822T72FT71EUen9LHAAAAC3RSTlMA6rVlCuWgmGJeBd4LCPMAAAB8SURBVCjPnZFLDoAgDERtQUUH/97/rCYNJUITTXjLeYu2064Z75gAYufLfOqR6KdXPI94Mc5ZDCgYNA8piHGBENJcqgV5EQ61gBPBVrAIsoJEwArUYi0EIbFlQ+VwHGpY11XOGDdZVw/MXPstB2olFeGnRFv796Psa1t5ANwFDZEW8B8sAAAAAElFTkSuQmCC' },
  dnd: { uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAMAAADXqc3KAAAAQlBMVEUAAADpABvpABvpABvpABvpABvpABvpABvpABvpABvpABvpABvpABvpABvpABvpABvpABvpABv////wfYT86errJjiR9OLxAAAAEXRSTlMA4/CzeQj602seEhEk89jKakfnNfsAAACKSURBVCjPhZFbDoQgDEWBQkHBR2d0/1udEppR0cbzeU9SSq95I69gcZphzZc4eEeC8+HIh0gn4vDPLV2wYsJCHUub5umGr/no7sKNLBI9kFjAkwAWbaX9K+xtMRZIle0jbFRBFpMmZmWU8ri+rv5B/SQmxD6PUknpz16MUJSi9GqZnMAiWkjZvPADxcoYalVfnOMAAAAASUVORK5CYII='},
  blocked: {uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAMAAADXqc3KAAAAe1BMVEUAAADpABvpABvpABvpABvpABvpABvpABvpABvpABvpABvpABvpABvpABvpABvpABvpABv////pABv83uHqCiTsJz7rGjP7zNHvRVj/+vv+8vP6x83sIzv2mqXsKD/7zNL5v8b3oqz2maTuP1P82Nz819vtKUDrGjLrGTK2dyGvAAAAEXRSTlMA8dSzeQj64mseEhHkJMpq5T3coEAAAADSSURBVCjPhdHZFoIgFAVQGQRLGzhQiaLNw/9/YZRk4IvncZ+17uJys7mUGyYFoWxTJpxzghDC878vKFBftLX6UgN0MXqF/qRCTg5VaPI1ro36Re+MWQ/TOPrEXw7840uCNvb9oQVZ+qJAnbpSNQpfMHQTVx2YLyT0xJWG9IWAnbiyEL4gaCKPCopb7P9RDOeJqzNYeG7i3+eGBVMPC2Yczpn9cfTmAT58IoV5Rn4FDSdZbY1rxzk9qpXHofkcqtO2uXfhUHOn9SkLJoWQrCizmbwBa5IbuX8ugpIAAAAASUVORK5CYII='},
  busy: {uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAMAAADXqc3KAAAANlBMVEUAAADpABvpABvpABvpABvpABvpABvpABvpABvpABvpABvpABvpABvpABvpABvpABvpABvpABvsgIdoAAAAEXRSTlMA8eLUEQj6s2sheXrlyrJqHBqb3nMAAAB/SURBVCjPhZFRDsQgCEQFEdS223L/yy7JummtGN/nvASUCSvoFGSIclIXpwragC3deYn6IJZ/fqF24NXmHPri+E2rOlCDQTAKIBNZHbKJjyfEBHoCTbAn2ATMRPRHzZfPn+t/cH4SIw3rY2p17H2+l0VRRtr8ag3KgswomcKCL1NmGBp9lqsZAAAAAElFTkSuQmCC'}
};

export type PersonaSizeConfig = {
  physicalCoinSize: number;
  iconSize: number;
  initialsFontSize: number;
};

export function getSizeConfig(size: PersonaSize): PersonaSizeConfig {
  switch (size) {
    case PersonaSize.size8:
      return { physicalCoinSize: 8, iconSize: 0, initialsFontSize: 4 };
    case PersonaSize.size24:
      return { physicalCoinSize: 24, iconSize: 8, initialsFontSize: 10 };
    case PersonaSize.size32:
      return { physicalCoinSize: 32, iconSize: 8, initialsFontSize: 12 };
    case PersonaSize.size40:
      return { physicalCoinSize: 40, iconSize: 12, initialsFontSize: 14 };
    case PersonaSize.size48:
      return { physicalCoinSize: 48, iconSize: 12, initialsFontSize: 16 };
    case PersonaSize.size56:
      return { physicalCoinSize: 56, iconSize: 16, initialsFontSize: 18 };
    case PersonaSize.size72:
      return { physicalCoinSize: 72, iconSize: 20, initialsFontSize: 20 };
    case PersonaSize.size100:
      return { physicalCoinSize: 100, iconSize: 28, initialsFontSize: 36 };
    case PersonaSize.size120:
      return { physicalCoinSize: 120, iconSize: 32, initialsFontSize: 40 };
  }
}

export function getPresenceIconSource(presence: PersonaPresence): ImageURISource {
  return presenceIconCache[presence];
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
