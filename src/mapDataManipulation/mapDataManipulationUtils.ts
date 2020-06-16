import { RgbMappingArrays, Effects, ColorRange } from 'src/mapDataManipulation/const';

export function prepareRgbMappingArrays(): RgbMappingArrays {
  return {
    red: [...Array(256).keys()],
    green: [...Array(256).keys()],
    blue: [...Array(256).keys()],
  };
}

export function changeRgbMappingArraysWithFunction(
  rgbMappingArrays: RgbMappingArrays,
  transformationFunction: Function,
): RgbMappingArrays {
  rgbMappingArrays.red = rgbMappingArrays.red.map(x => transformationFunction(x));
  rgbMappingArrays.green = rgbMappingArrays.green.map(x => transformationFunction(x));
  rgbMappingArrays.blue = rgbMappingArrays.blue.map(x => transformationFunction(x));
  return rgbMappingArrays;
}

// from one range to another
// f(x) = c + ((d - c) / (b - a)) * (x - a)
// a = oldMin, b = oldMax; c = newMin, d = newMax
// [0,255] to [0,1]: a = 0, b = 255; c = 0, d = 1
// [0,1] to [0,255]: a = 0, b = 1; c = 0, d = 255

export function changeRgbMappingArrayRange(
  rgbMappingArray: number[],
  oldMin: number,
  oldMax: number,
  newMin: number,
  newMax: number,
): number[] {
  const transformValueToRange = (x: number): number => {
    let newX = newMin + ((newMax - newMin) / (oldMax - oldMin)) * (x - oldMin);
    newX = Math.max(newX, newMin);
    newX = Math.min(newX, newMax);

    return newX;
  };

  return rgbMappingArray.map(x => transformValueToRange(x));
}

export function changeRgbMappingArraysRange(
  rgbMappingArrays: RgbMappingArrays,
  oldMin: number,
  oldMax: number,
  newMin: number,
  newMax: number,
): RgbMappingArrays {
  const transformValueToRange = (x: number): number => {
    let newX = newMin + ((newMax - newMin) / (oldMax - oldMin)) * (x - oldMin);
    newX = Math.max(newX, newMin);
    newX = Math.min(newX, newMax);

    return newX;
  };

  rgbMappingArrays = changeRgbMappingArraysWithFunction(rgbMappingArrays, transformValueToRange);
  return rgbMappingArrays;
}

export function prepareManipulatePixel(rgbMappingArrays: RgbMappingArrays): Function {
  return function(r: number, g: number, b: number, a: number): object {
    return { r: rgbMappingArrays.red[r], g: rgbMappingArrays.green[g], b: rgbMappingArrays.blue[b], a };
  };
}

export function isEffectSet(effect: number | ColorRange): boolean {
  return effect !== undefined && effect !== null;
}

export function isAnyEffectSet(effects: Effects): boolean {
  return Object.values(effects).some(e => isEffectSet(e));
}
