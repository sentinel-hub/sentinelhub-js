import { Effects, RgbaArrays } from './const';
import { isEffectSet, transformValueToRange } from './mapDataManipulationUtils';

export function runGainEffectFunction(rgbaArrays: RgbaArrays, effects: Effects): RgbaArrays {
  // change the values according to the algorithm (gain)
  const minValue = 0.0;
  const maxValue = 1.0;
  const gain = isEffectSet(effects.gain) ? effects.gain : 1.0;
  const factor = gain / (maxValue - minValue);
  let offset = 0.0;
  offset = offset - factor * minValue;

  if (gain === 1.0) {
    return rgbaArrays;
  }

  const transformValueWithGain = (x: number): number => Math.max(0.0, x * factor + offset);
  rgbaArrays.red = rgbaArrays.red.map(x => transformValueWithGain(x));
  rgbaArrays.green = rgbaArrays.green.map(x => transformValueWithGain(x));
  rgbaArrays.blue = rgbaArrays.blue.map(x => transformValueWithGain(x));
  return rgbaArrays;
}

export function runGammaEffectFunction(rgbaArrays: RgbaArrays, effects: Effects): RgbaArrays {
  // change the values according to the algorithm (gamma)
  const gamma = isEffectSet(effects.gamma) ? effects.gamma : 1.0;

  if (gamma === 1.0) {
    return rgbaArrays;
  }

  const transformValueWithGamma = (x: number): number => Math.pow(x, gamma);
  rgbaArrays.red = rgbaArrays.red.map(x => transformValueWithGamma(x));
  rgbaArrays.green = rgbaArrays.green.map(x => transformValueWithGamma(x));
  rgbaArrays.blue = rgbaArrays.blue.map(x => transformValueWithGamma(x));
  return rgbaArrays;
}

export function runColorEffectFunction(rgbArrays: RgbaArrays, effects: Effects): RgbaArrays {
  if (isEffectSet(effects.redRange)) {
    rgbArrays.red = rgbArrays.red.map(x =>
      transformValueToRange(x, effects.redRange.from, effects.redRange.to, 0, 1),
    );
  }

  if (isEffectSet(effects.greenRange)) {
    rgbArrays.green = rgbArrays.green.map(x =>
      transformValueToRange(x, effects.greenRange.from, effects.greenRange.to, 0, 1),
    );
  }

  if (isEffectSet(effects.blueRange)) {
    rgbArrays.blue = rgbArrays.blue.map(x =>
      transformValueToRange(x, effects.blueRange.from, effects.blueRange.to, 0, 1),
    );
  }

  return rgbArrays;
}

export function runCustomEffectFunction(rgbArrays: RgbaArrays, effects: Effects): RgbaArrays {
  if (!isEffectSet(effects.customEffect)) {
    return rgbArrays;
  }

  for (let i = 0; i < rgbArrays.red.length; i++) {
    const red = rgbArrays.red[i];
    const green = rgbArrays.green[i];
    const blue = rgbArrays.blue[i];
    const alpha = rgbArrays.alpha[i];

    const { r, g, b, a } = effects.customEffect({ r: red, g: green, b: blue, a: alpha });

    rgbArrays.red[i] = r !== undefined ? r : red;
    rgbArrays.green[i] = g !== undefined ? g : green;
    rgbArrays.blue[i] = b !== undefined ? b : blue;
    rgbArrays.alpha[i] = a !== undefined ? a : alpha;
  }

  return rgbArrays;
}
