import { mapDataManipulation } from 'src/mapDataManipulation/mapDataManipulation';
import { Effects } from 'src/mapDataManipulation/const';
import {
  isAnyEffectSet,
  prepareRgbMappingArrays,
  changeRgbMappingArraysInterval,
  prepareManipulatePixel,
} from 'src/mapDataManipulation/mapDataManipulationUtils';
import {
  runGainEffectFunction,
  runGammaEffectFunction,
  runSimpleColorEffectFunction,
} from 'src/mapDataManipulation/effectFunctions';

// The algorithm works with numbers between 0 and 1, so we must:
// - change the interval of the values from [0, 255] to [0, 1]
// - change the values according to the algorithms (gain, gamma, r,g,b)
// - change the interval of the values from [0, 1] back to [0, 255]

export async function runEffectFunctions(originalBlob: Blob, effects: Effects): Promise<Blob> {
  if (!isAnyEffectSet(effects)) {
    return originalBlob;
  }

  let rgbMappingArrays = prepareRgbMappingArrays();

  // change the interval of the values from [0, 255] to [0, 1]
  rgbMappingArrays = changeRgbMappingArraysInterval(rgbMappingArrays, 0, 255, 0, 1);

  // change the values according to the algorithm (gain)
  rgbMappingArrays = runGainEffectFunction(rgbMappingArrays, effects);

  // change the values according to the algorithm (gamma)
  rgbMappingArrays = runGammaEffectFunction(rgbMappingArrays, effects);

  // change the values according to the algorithm (color manipulation)
  rgbMappingArrays = runSimpleColorEffectFunction(rgbMappingArrays, effects);

  // change the interval of the values from [0, 1] back to [0, 255]
  rgbMappingArrays = changeRgbMappingArraysInterval(rgbMappingArrays, 0, 1, 0, 255);

  // prepare manipulatePixel function for mapDataManipulation
  const manipulatePixel = prepareManipulatePixel(rgbMappingArrays);

  return await mapDataManipulation(originalBlob, manipulatePixel);
}
