import { NativeEventEmitter } from 'react-native';
import NativeFontMetrics from './NativeFontMetrics';
import { FontMetrics, ScaleFactors } from './NativeFontMetrics.types';

class FontMetricsImpl implements FontMetrics {
  _scaleFactors: ScaleFactors;

  constructor() {
    if (NativeFontMetrics) {
      this._scaleFactors = NativeFontMetrics.currentScaleFactors();
      const eventEmitter = new NativeEventEmitter(NativeFontMetrics as any);
      eventEmitter.addListener('onFontMetricsChanged', ({ newScaleFactors }) => {
        this._scaleFactors = newScaleFactors;
      });
    } else {
      this._scaleFactors = {};
    }
  }

  get scaleFactors(): ScaleFactors {
    return this._scaleFactors;
  }
}

export const fontMetrics = new FontMetricsImpl() as FontMetrics;
