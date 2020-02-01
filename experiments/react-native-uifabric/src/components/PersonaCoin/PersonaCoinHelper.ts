import { PersonaSize, PersonaCoinColor } from './PersonaCoin.types';

export function getPhysicalSize(size: PersonaSize): number {
    switch (size) {
      case PersonaSize.size8: return 8;
      case PersonaSize.size24: return 24;
      case PersonaSize.size32: return 32;
      case PersonaSize.size40: return 40;
      case PersonaSize.size48: return 48;
      case PersonaSize.size56: return 56;
      case PersonaSize.size72: return 72;
      case PersonaSize.size100: return 100;
    }
  }
  
  export function getFontSize(size: PersonaSize): number {
    switch (size) {
      case PersonaSize.size8: return 8;
      case PersonaSize.size24: return 10;
      case PersonaSize.size32: return 12;
      case PersonaSize.size40: return 14;
      case PersonaSize.size48: return 16;
      case PersonaSize.size56: return 18;
      case PersonaSize.size72: return 20;
      case PersonaSize.size100: return 36;
    }
  }

  export function convertCoinColor(coinColor?: PersonaCoinColor): string | undefined {
    return (coinColor === undefined) ? undefined : PersonaCoinColor[coinColor];     
  }
  