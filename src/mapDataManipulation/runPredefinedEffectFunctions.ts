import { mapDataManipulation } from 'src/mapDataManipulation/mapDataManipulation';
import {
  PredefinedEffectFunctions,
  prepareRgbMappingArrays,
  changeRgbMappingArraysInterval,
  prepareManipulatePixel,
} from 'src/mapDataManipulation/mapDataManipulationUtils';
import { gainEffectFunction, gammaEffectFunction } from 'src/mapDataManipulation/predefinedEffectFunctions';

// The algorithm works with numbers between 0 and 1, so we must:
// - change the interval of the values from [0, 255] to [0, 1]
// - change the values according to the algorithm (first manipulation of gain and then gamma)
// - change the interval of the values from [0, 1] back to [0, 255]

export async function runPredefinedEffectFunctions(
  originalBlob: Blob,
  predefinedEffectFunctions: PredefinedEffectFunctions,
): Promise<Blob> {
  let rgbMappingArrays = prepareRgbMappingArrays();

  // change the interval of the values from [0, 255] to [0, 1]
  rgbMappingArrays = changeRgbMappingArraysInterval(rgbMappingArrays, 0, 255, 0, 1);

  // change the values according to the algorithm (gain)
  rgbMappingArrays = gainEffectFunction(rgbMappingArrays, predefinedEffectFunctions);

  // change the values according to the algorithm (gamma)
  rgbMappingArrays = gammaEffectFunction(rgbMappingArrays, predefinedEffectFunctions);

  // change the interval of the values from [0, 1] back to [0, 255], strictly limit values to the interval
  const limitValuesToInterval = true;
  rgbMappingArrays = changeRgbMappingArraysInterval(rgbMappingArrays, 0, 1, 0, 255, limitValuesToInterval);

  // prepare manipulatePixel function for mapDataManipulation
  const manipulatePixel = prepareManipulatePixel(rgbMappingArrays);

  return await mapDataManipulation(originalBlob, manipulatePixel);
}
