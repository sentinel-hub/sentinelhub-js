import { Effects, RgbMappingArrays } from './const';
import {
  isEffectSet,
  changeRgbMappingArraysWithFunction,
  transformValueToRange,
} from './mapDataManipulationUtils';

export function runGainEffectFunction(
  rgbMappingArrays: RgbMappingArrays,
  effects: Effects,
): RgbMappingArrays {
  // change the values according to the algorithm (gain)
  const minValue = 0.0;
  const maxValue = 1.0;
  const gain = isEffectSet(effects.gain) ? effects.gain : 1.0;
  const factor = gain / (maxValue - minValue);
  let offset = 0.0;
  offset = offset - factor * minValue;

  if (gain === 1.0) {
    return rgbMappingArrays;
  }

  const transformValueWithGain = (x: number): number => Math.max(0.0, x * factor + offset);
  rgbMappingArrays = changeRgbMappingArraysWithFunction(rgbMappingArrays, transformValueWithGain);
  return rgbMappingArrays;
}

export function runGammaEffectFunction(
  rgbMappingArrays: RgbMappingArrays,
  effects: Effects,
): RgbMappingArrays {
  // change the values according to the algorithm (gamma)
  const gamma = isEffectSet(effects.gamma) ? effects.gamma : 1.0;

  if (gamma === 1.0) {
    return rgbMappingArrays;
  }

  const transformValueWithGamma = (x: number): number => Math.pow(x, gamma);
  rgbMappingArrays = changeRgbMappingArraysWithFunction(rgbMappingArrays, transformValueWithGamma);
  return rgbMappingArrays;
}

export function runColorEffectFunction(
  rgbMappingArrays: RgbMappingArrays,
  effects: Effects,
): RgbMappingArrays {
  if (isEffectSet(effects.redRange)) {
    rgbMappingArrays.red = rgbMappingArrays.red.map(x =>
      transformValueToRange(x, effects.redRange.from, effects.redRange.to, 0, 1),
    );
  }

  if (isEffectSet(effects.greenRange)) {
    rgbMappingArrays.green = rgbMappingArrays.green.map(x =>
      transformValueToRange(x, effects.greenRange.from, effects.greenRange.to, 0, 1),
    );
  }

  if (isEffectSet(effects.blueRange)) {
    rgbMappingArrays.blue = rgbMappingArrays.blue.map(x =>
      transformValueToRange(x, effects.blueRange.from, effects.blueRange.to, 0, 1),
    );
  }

  return rgbMappingArrays;
}

export function runCustomEffectFunction(
  rgbMappingArrays: RgbMappingArrays,
  effects: Effects,
): RgbMappingArrays {
  if (!isEffectSet(effects.customEffect)) {
    return rgbMappingArrays;
  }

  const customEffect = effects.customEffect;

  if (isEffectSet(customEffect.redFunction)) {
    rgbMappingArrays.red = rgbMappingArrays.red.map(x => customEffect.redFunction(x));
  }

  if (isEffectSet(customEffect.greenFunction)) {
    rgbMappingArrays.green = rgbMappingArrays.green.map(x => customEffect.greenFunction(x));
  }

  if (isEffectSet(customEffect.blueFunction)) {
    rgbMappingArrays.blue = rgbMappingArrays.blue.map(x => customEffect.blueFunction(x));
  }

  return rgbMappingArrays;
}
