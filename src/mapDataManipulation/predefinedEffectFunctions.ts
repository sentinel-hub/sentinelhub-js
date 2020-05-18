import {
  PredefinedEffectFunctions,
  RgbMappingArrays,
} from 'src/mapDataManipulation/mapDataManipulationUtils';

export function gainEffectFunction(
  rgbMappingArrays: RgbMappingArrays,
  predefinedEffectFunctions: PredefinedEffectFunctions,
): RgbMappingArrays {
  // change the values according to the algorithm (gain)
  const minValue = 0.0;
  const maxValue = 1.0;
  const gain = predefinedEffectFunctions.gain ? predefinedEffectFunctions.gain : 1.0;
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
  predefinedEffectFunctions: PredefinedEffectFunctions,
): RgbMappingArrays {
  // change the values according to the algorithm (gamma)
  const gamma = predefinedEffectFunctions.gamma ? predefinedEffectFunctions.gamma : 1.0;
  if (gamma != 1.0) {
    rgbMappingArrays.red = rgbMappingArrays.red.map(x => Math.pow(x, gamma));
    rgbMappingArrays.green = rgbMappingArrays.green.map(x => Math.pow(x, gamma));
    rgbMappingArrays.blue = rgbMappingArrays.blue.map(x => Math.pow(x, gamma));
  }

  return rgbMappingArrays;
}
