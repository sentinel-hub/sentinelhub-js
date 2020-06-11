import { Effects, RgbMappingArrays } from 'src/mapDataManipulation/const';
import {
  isEffectSet,
  changeRgbMappingArraysWithFunction,
  changeRgbMappingArrayInterval,
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

export function runSimpleColorEffectFunction(
  rgbMappingArrays: RgbMappingArrays,
  effects: Effects,
): RgbMappingArrays {
  if (!isEffectSet(effects.redRange) && !isEffectSet(effects.greenRange) && !isEffectSet(effects.blueRange)) {
    return rgbMappingArrays;
  }

  if (isEffectSet(effects.redRange)) {
    rgbMappingArrays.red = changeRgbMappingArrayInterval(
      rgbMappingArrays.red,
      effects.redRange[0],
      effects.redRange[1],
      0,
      1,
      true,
    );
  }

  if (isEffectSet(effects.greenRange)) {
    rgbMappingArrays.green = changeRgbMappingArrayInterval(
      rgbMappingArrays.green,
      effects.greenRange[0],
      effects.greenRange[1],
      0,
      1,
      true,
    );
  }

  if (isEffectSet(effects.blueRange)) {
    rgbMappingArrays.blue = changeRgbMappingArrayInterval(
      rgbMappingArrays.blue,
      effects.blueRange[0],
      effects.blueRange[1],
      0,
      1,
      true,
    );
  }

  return rgbMappingArrays;
}
