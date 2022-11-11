import { NativeEventEmitter, Platform } from 'react-native';
import NativeFontMetrics from './NativeFontMetrics';
import { IFontMetrics, ScaleFactors } from './NativeFontMetrics.types';

const eventEmitter = new NativeEventEmitter(NativeFontMetrics as any);

class FontMetricsImpl implements IFontMetrics {
  _scaleFactors: ScaleFactors;

  constructor() {
    this._scaleFactors = NativeFontMetrics.currentScaleFactors();
    eventEmitter.addListener('onFontMetricsChanged', ({ newScaleFactors }) => {
      this._scaleFactors = newScaleFactors;
    });
  }

  get scaleFactors(): ScaleFactors {
    return this._scaleFactors;
  }
}

const fontMetricsImpl = Platform.OS === 'ios' ? new FontMetricsImpl() : { scaleFactors: {} };
export const fontMetrics = fontMetricsImpl as IFontMetrics;
