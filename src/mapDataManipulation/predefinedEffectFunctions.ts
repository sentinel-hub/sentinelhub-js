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

  const transformValueWithGain = (x: number): number => Math.max(0.0, x * factor + offset);
  rgbMappingArrays.red = rgbMappingArrays.red.map(x => transformValueWithGain(x));
  rgbMappingArrays.green = rgbMappingArrays.green.map(x => transformValueWithGain(x));
  rgbMappingArrays.blue = rgbMappingArrays.blue.map(x => transformValueWithGain(x));

  return rgbMappingArrays;
}

export function gammaEffectFunction(
  rgbMappingArrays: RgbMappingArrays,
  predefinedEffects: PredefinedEffects,
): RgbMappingArrays {
  // change the values according to the algorithm (gamma)
  const gamma = predefinedEffects.gamma ? predefinedEffects.gamma : 1.0;

  if (gamma != 1.0) {
    const transformValueWithGamma = (x: number): number => Math.pow(x, gamma);
    rgbMappingArrays.red = rgbMappingArrays.red.map(x => transformValueWithGamma(x));
    rgbMappingArrays.green = rgbMappingArrays.green.map(x => transformValueWithGamma(x));
    rgbMappingArrays.blue = rgbMappingArrays.blue.map(x => transformValueWithGamma(x));
  }

  return rgbMappingArrays;
}
