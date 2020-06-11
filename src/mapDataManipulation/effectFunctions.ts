import { Effects, RgbMappingArrays } from 'src/mapDataManipulation/const';
import {
  isEffectSet,
  changeRgbMappingArraysWithFunction,
} from 'src/mapDataManipulation/mapDataManipulationUtils';

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
