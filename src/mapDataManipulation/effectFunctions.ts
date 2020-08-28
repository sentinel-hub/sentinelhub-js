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

export function runCustomEffectFunctions(
  rgbMappingArrays: RgbMappingArrays,
  effects: Effects,
): RgbMappingArrays {
  if (!isEffectSet(effects.customEffect)) {
    return rgbMappingArrays;
  }

  let newRgbMappingArrays = { ...rgbMappingArrays };

  for (let i = 0; i < rgbMappingArrays.red.length; i++) {
    const red = rgbMappingArrays.red[i];
    const green = rgbMappingArrays.green[i];
    const blue = rgbMappingArrays.blue[i];

    const { r, g, b } = effects.customEffect({ r: red, g: green, b: blue });

    newRgbMappingArrays.red[i] = r;
    newRgbMappingArrays.green[i] = g;
    newRgbMappingArrays.blue[i] = b;
  }

  return newRgbMappingArrays;
}
