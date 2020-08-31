import { Effects } from './const';
import { isEffectSet, transformValueToRange } from './mapDataManipulationUtils';

export function runGainEffectFunction(rgbaArray: number[], effects: Effects): number[] {
  // change the values according to the algorithm (gain)
  const minValue = 0.0;
  const maxValue = 1.0;
  const gain = isEffectSet(effects.gain) ? effects.gain : 1.0;
  const factor = gain / (maxValue - minValue);
  let offset = 0.0;
  offset = offset - factor * minValue;

  if (gain === 1.0) {
    return rgbaArray;
  }

  for (let i = 0; i < rgbaArray.length; i += 4) {
    rgbaArray[i] = Math.max(0.0, rgbaArray[i] * factor + offset);
    rgbaArray[i + 1] = Math.max(0.0, rgbaArray[i + 1] * factor + offset);
    rgbaArray[i + 2] = Math.max(0.0, rgbaArray[i + 2] * factor + offset);
    rgbaArray[i + 3] = rgbaArray[i + 3]; // alpha stays the same
  }

  return rgbaArray;
}

export function runGammaEffectFunction(rgbaArray: number[], effects: Effects): number[] {
  // change the values according to the algorithm (gamma)
  const gamma = isEffectSet(effects.gamma) ? effects.gamma : 1.0;

  if (gamma === 1.0) {
    return rgbaArray;
  }

  for (let i = 0; i < rgbaArray.length; i += 4) {
    rgbaArray[i] = Math.pow(rgbaArray[i], gamma);
    rgbaArray[i + 1] = Math.pow(rgbaArray[i + 1], gamma);
    rgbaArray[i + 2] = Math.pow(rgbaArray[i + 2], gamma);
    rgbaArray[i + 3] = rgbaArray[i + 3]; // alpha stays the same
  }

  return rgbaArray;
}

export function runColorEffectFunction(rgbaArray: number[], effects: Effects): number[] {
  for (let i = 0; i < rgbaArray.length; i += 4) {
    const red = rgbaArray[i];
    const green = rgbaArray[i + 1];
    const blue = rgbaArray[i + 2];

    if (isEffectSet(effects.redRange)) {
      rgbaArray[i] = transformValueToRange(red, effects.redRange.from, effects.redRange.to, 0, 1);
    }

    if (isEffectSet(effects.greenRange)) {
      rgbaArray[i + 1] = transformValueToRange(green, effects.greenRange.from, effects.greenRange.to, 0, 1);
    }

    if (isEffectSet(effects.blueRange)) {
      rgbaArray[i + 2] = transformValueToRange(blue, effects.blueRange.from, effects.blueRange.to, 0, 1);
    }

    rgbaArray[i + 3] = rgbaArray[i + 3]; // alpha stays the same
  }

  return rgbaArray;
}

export function runCustomEffectFunction(rgbaArray: number[], effects: Effects): number[] {
  if (!isEffectSet(effects.customEffect)) {
    return rgbaArray;
  }

  for (let i = 0; i < rgbaArray.length; i += 4) {
    const red = rgbaArray[i];
    const green = rgbaArray[i + 1];
    const blue = rgbaArray[i + 2];
    const alpha = rgbaArray[i + 3];

    const { r, g, b, a } = effects.customEffect({ r: red, g: green, b: blue, a: alpha });

    rgbaArray[i] = r !== undefined ? r : red;
    rgbaArray[i + 1] = g !== undefined ? g : green;
    rgbaArray[i + 2] = b !== undefined ? b : blue;
    rgbaArray[i + 3] = a !== undefined ? a : alpha;
  }

  return rgbaArray;
}
