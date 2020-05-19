import { PredefinedEffects, RgbMappingArrays } from 'src/mapDataManipulation/const';
import { changeRgbMappingArraysWithFunction } from 'src/mapDataManipulation/mapDataManipulationUtils';

export function runGainEffectFunction(
  rgbMappingArrays: RgbMappingArrays,
  predefinedEffects: PredefinedEffects,
): RgbMappingArrays {
  // change the values according to the algorithm (gain)
  const minValue = 0.0;
  const maxValue = 1.0;
  const gain = predefinedEffects.gain ? predefinedEffects.gain : 1.0;
  const factor = gain / (maxValue - minValue);
  let offset = 0.0;
  offset = offset - factor * minValue;

  const transformValueWithGain = (x: number): number => Math.max(0.0, x * factor + offset);
  rgbMappingArrays = changeRgbMappingArraysWithFunction(rgbMappingArrays, transformValueWithGain);
  return rgbMappingArrays;
}

export function runGammaEffectFunction(
  rgbMappingArrays: RgbMappingArrays,
  predefinedEffects: PredefinedEffects,
): RgbMappingArrays {
  // change the values according to the algorithm (gamma)
  const gamma = predefinedEffects.gamma ? predefinedEffects.gamma : 1.0;

  if (gamma != 1.0) {
    const transformValueWithGamma = (x: number): number => Math.pow(x, gamma);
    rgbMappingArrays = changeRgbMappingArraysWithFunction(rgbMappingArrays, transformValueWithGamma);
  }
  return rgbMappingArrays;
}
