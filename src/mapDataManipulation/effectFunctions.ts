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
  // const maxValue = 0.4;

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

export function runHighlightEffect(rgbMappingArrays: RgbMappingArrays, effects: Effects): RgbMappingArrays {
  const minValue = 0.1;
  const maxValue = 0.4;
  const clipPoint = 2.0;

  console.log('rgbMappingArrays', { e: effects.gain, r: rgbMappingArrays.red });

  const highlightPoint = 0 < maxValue && maxValue < 1 ? 0.92 : Number.NaN;
  const highlightFactor = (1.0 - highlightPoint) / (clipPoint - highlightPoint);
  const highlightOffset = highlightPoint * (1.0 - highlightFactor);

  console.log('runHighlightEffect', { e: effects.gain, highlightPoint, highlightFactor, highlightOffset });

  // highlightPoint can be NaN (see the constructor) in which case original value will be used
  const transformValueWithHighlightEffect = (x: number): number =>
    x > highlightPoint ? x * highlightFactor + highlightOffset : x;

  rgbMappingArrays = changeRgbMappingArraysWithFunction(rgbMappingArrays, transformValueWithHighlightEffect);
  console.log('runHighlightEffect', { e: effects.gain, r: rgbMappingArrays.red });

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
