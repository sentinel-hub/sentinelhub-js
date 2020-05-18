import { mapDataManipulation } from 'src/mapDataManipulation/mapDataManipulation';

// The algorithm works with numbers between 0 and 1, so we must:
// - change the interval of the values from [0, 255] to [0, 1]
// - change the values according to the algorithm (first manipulation of gain and then gamma)
// - change the interval of the values from [0, 1] back to [0, 255]

type PredefinedEffectFunctions = {
  gain?: number;
  gamma?: number;
};

type RgbMappingArrays = {
  red: number[];
  green: number[];
  blue: number[];
};

// from one range to other
// f(x) = c + ((d - c) / (b - a)) * (x - a)
// a = oldMin, b = oldMax; c = newMin, d = newMax
// [0,255] to [0,1]: a = 0, b = 255; c = 0, d = 1
// [0,1] to [0,255]: a = 0, b = 1; c = 0, d = 255

function changeInterval(x: number, oldMin: number, oldMax: number, newMin: number, newMax: number) {
  return newMin + ((newMax - newMin) / (oldMax - oldMin)) * (x - oldMin);
}

function changeRgbMappingArraysInterval(
  rgbMappingArrays: RgbMappingArrays,
  oldMin: number,
  oldMax: number,
  newMin: number,
  newMax: number,
) {
  rgbMappingArrays.red = rgbMappingArrays.red.map(x => changeInterval(x, oldMin, oldMax, newMin, newMax));
  rgbMappingArrays.green = rgbMappingArrays.green.map(x => changeInterval(x, oldMin, oldMax, newMin, newMax));
  rgbMappingArrays.blue = rgbMappingArrays.blue.map(x => changeInterval(x, oldMin, oldMax, newMin, newMax));
  return rgbMappingArrays;
}

function gainEffectFunction(
  rgbMappingArrays: RgbMappingArrays,
  predefinedEffectFunctions: PredefinedEffectFunctions,
) {
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

function gammaEffectFunction(
  rgbMappingArrays: RgbMappingArrays,
  predefinedEffectFunctions: PredefinedEffectFunctions,
) {
  const gamma = predefinedEffectFunctions.gamma ? predefinedEffectFunctions.gamma : 1.0;
  // change the values according to the algorithm (gamma)
  if (gamma != 1.0) {
    rgbMappingArrays.red = rgbMappingArrays.red.map(x => Math.pow(x, gamma));
    rgbMappingArrays.green = rgbMappingArrays.green.map(x => Math.pow(x, gamma));
    rgbMappingArrays.blue = rgbMappingArrays.blue.map(x => Math.pow(x, gamma));
  }

  return rgbMappingArrays;
}

export async function runPredefinedEffectFunctions(
  originalBlob: Blob,
  predefinedEffectFunctions: PredefinedEffectFunctions,
): Promise<Blob> {
  // const minValue = 0.0;
  // const maxValue = 1.0;
  // const gain = predefinedEffectFunctions.gain ? predefinedEffectFunctions.gain : 1.0;
  // const factor = gain / (maxValue - minValue);
  // let offset = 0.0;
  // offset = offset - factor * minValue;
  // const gamma = predefinedEffectFunctions.gamma ? predefinedEffectFunctions.gamma : 1.0;

  let rgbMappingArrays = {
    red: [...Array(256).keys()],
    green: [...Array(256).keys()],
    blue: [...Array(256).keys()],
  };

  // change the interval of the values from [0, 255] to [0, 1]
  // newRedValues = newRedValues.map(x => (1 / 255) * x);
  // newGreenValues = newGreenValues.map(x => (1 / 255) * x);
  // newBlueValues = newBlueValues.map(x => (1 / 255) * x);
  rgbMappingArrays = changeRgbMappingArraysInterval(rgbMappingArrays, 0, 255, 0, 1);

  // change the values according to the algorithm (gain)
  // newRedValues = newRedValues.map(x => Math.max(0.0, x * factor + offset));
  // newGreenValues = newGreenValues.map(x => Math.max(0.0, x * factor + offset));
  // newBlueValues = newBlueValues.map(x => Math.max(0.0, x * factor + offset));
  rgbMappingArrays = gainEffectFunction(rgbMappingArrays, predefinedEffectFunctions);

  // change the values according to the algorithm (gamma)
  // if (gamma != 1.0) {
  //   newRedValues = newRedValues.map(x => Math.pow(x, gamma));
  //   newGreenValues = newGreenValues.map(x => Math.pow(x, gamma));
  //   newBlueValues = newBlueValues.map(x => Math.pow(x, gamma));
  // }
  rgbMappingArrays = gammaEffectFunction(rgbMappingArrays, predefinedEffectFunctions);

  // change the interval of the values from [0, 1] back to [0, 255]
  // newRedValues = newRedValues.map(x => Math.round((255 / 1) * x));
  // newGreenValues = newGreenValues.map(x => Math.round((255 / 1) * x));
  // newBlueValues = newBlueValues.map(x => Math.round((255 / 1) * x));
  rgbMappingArrays = changeRgbMappingArraysInterval(rgbMappingArrays, 0, 1, 0, 255);

  const manipulatePixel = function(r: number, g: number, b: number, a: number): object {
    return { r: rgbMappingArrays.red[r], g: rgbMappingArrays.green[g], b: rgbMappingArrays.blue[b], a };
  };
  return await mapDataManipulation(originalBlob, manipulatePixel);
}
