import { PredefinedEffects, RgbMappingArrays } from 'src/mapDataManipulation/const';

export function gainEffectFunction(
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
  rgbMappingArrays.red = rgbMappingArrays.red.map(x => Math.max(0.0, x * factor + offset));
  rgbMappingArrays.green = rgbMappingArrays.green.map(x => Math.max(0.0, x * factor + offset));
  rgbMappingArrays.blue = rgbMappingArrays.blue.map(x => Math.max(0.0, x * factor + offset));

  return rgbMappingArrays;
}

export function gammaEffectFunction(
  rgbMappingArrays: RgbMappingArrays,
  predefinedEffects: PredefinedEffects,
): RgbMappingArrays {
  // change the values according to the algorithm (gamma)
  const gamma = predefinedEffects.gamma ? predefinedEffects.gamma : 1.0;
  if (gamma != 1.0) {
    rgbMappingArrays.red = rgbMappingArrays.red.map(x => Math.pow(x, gamma));
    rgbMappingArrays.green = rgbMappingArrays.green.map(x => Math.pow(x, gamma));
    rgbMappingArrays.blue = rgbMappingArrays.blue.map(x => Math.pow(x, gamma));
  }

  return rgbMappingArrays;
}
