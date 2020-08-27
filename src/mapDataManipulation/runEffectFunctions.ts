import { mapDataManipulation } from './mapDataManipulation';
import { Effects } from './const';
import {
  isAnyEffectSet,
  prepareRgbMappingArrays,
  changeRgbMappingArraysRange,
  prepareManipulatePixel,
} from './mapDataManipulationUtils';
import {
  runGainEffectFunction,
  runGammaEffectFunction,
  runColorEffectFunction,
  runCustomEffectFunctions,
} from './effectFunctions';

// The algorithm works with numbers between 0 and 1, so we must:
// - change the range of the values from [0, 255] to [0, 1]
// - change the values according to the algorithms (gain; gamma; r,g,b effects)
// - change the range of the values from [0, 1] back to [0, 255]

export async function runEffectFunctions(originalBlob: Blob, effects: Effects): Promise<Blob> {
  if (!isAnyEffectSet(effects)) {
    return originalBlob;
  }

  let rgbMappingArrays = prepareRgbMappingArrays();

  // change the range of the values from [0, 255] to [0, 1]
  rgbMappingArrays = changeRgbMappingArraysRange(rgbMappingArrays, 0, 255, 0, 1);

  // change the values according to the algorithm (gain)
  rgbMappingArrays = runGainEffectFunction(rgbMappingArrays, effects);

  // change the values according to the algorithm (gamma)
  rgbMappingArrays = runGammaEffectFunction(rgbMappingArrays, effects);

  // change the values according to the algorithm (r,g,b effects)
  rgbMappingArrays = runColorEffectFunction(rgbMappingArrays, effects);

  // run custom effect function (with custom range of values)
  rgbMappingArrays = runCustomEffectFunctions(rgbMappingArrays, effects);

  // change the range of the values from [0, 1] back to [0, 255]
  rgbMappingArrays = changeRgbMappingArraysRange(rgbMappingArrays, 0, 1, 0, 255);

  // prepare manipulatePixel function for mapDataManipulation
  const manipulatePixel = prepareManipulatePixel(rgbMappingArrays);

  return await mapDataManipulation(originalBlob, manipulatePixel);
}
