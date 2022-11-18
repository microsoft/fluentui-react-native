import { NativeEventEmitter } from 'react-native';
import NativeFontMetrics from './NativeFontMetrics';
import { IFontMetrics, ScaleFactors } from './NativeFontMetrics.types';

class FontMetricsImpl implements IFontMetrics {
  _scaleFactors: ScaleFactors;

  constructor() {
    this._scaleFactors = NativeFontMetrics.currentScaleFactors();
    const eventEmitter = new NativeEventEmitter(NativeFontMetrics as any);
    eventEmitter.addListener('onFontMetricsChanged', ({ newScaleFactors }) => {
      this._scaleFactors = newScaleFactors;
    });
  }

  get scaleFactors(): ScaleFactors {
    return this._scaleFactors;
  }
}

export const fontMetrics = new FontMetricsImpl() as IFontMetrics;
