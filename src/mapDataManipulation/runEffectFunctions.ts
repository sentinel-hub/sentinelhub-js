import { Effects } from './const';
import { isAnyEffectSet, getImageData, getBlob, transformValueToRange } from './mapDataManipulationUtils';
import {
  runGainEffectFunction,
  runGammaEffectFunction,
  runColorEffectFunction,
  runCustomEffectFunction,
} from './effectFunctions';

// The algorithm works with numbers between 0 and 1, so we must:
// - change the range of the values from [0, 255] to [0, 1]
// - change the values according to the algorithms (gain; gamma; r,g,b effects; custom effect)
// - change the range of the values from [0, 1] back to [0, 255]

export async function runEffectFunctions(originalBlob: Blob, effects: Effects): Promise<Blob> {
  var t0 = performance.now();

  if (!isAnyEffectSet(effects)) {
    return originalBlob;
  }

  const { imageData, imageWidth, imageHeight, imageFormat } = await getImageData(originalBlob);
  let rgbaArray = Array.from(imageData);

  // change the range of the values from [0, 255] to [0, 1]
  rgbaArray = rgbaArray.map(x => transformValueToRange(x, 0, 255, 0, 1));

  // change the values according to the algorithm (gain)
  rgbaArray = runGainEffectFunction(rgbaArray, effects);

  // change the values according to the algorithm (gamma)
  rgbaArray = runGammaEffectFunction(rgbaArray, effects);

  // change the values according to the algorithm (r,g,b effects)
  rgbaArray = runColorEffectFunction(rgbaArray, effects);

  // run custom effect function (with custom range of values)
  rgbaArray = runCustomEffectFunction(rgbaArray, effects);

  // change the range of the values from [0, 1] back to [0, 255]
  rgbaArray = rgbaArray.map(x => transformValueToRange(x, 0, 1, 0, 255));

  const newImgData = Uint8ClampedArray.from(rgbaArray);
  const newBlob = getBlob({ imageData: newImgData, imageWidth, imageHeight, imageFormat });

  var t1 = performance.now();
  console.log('running effect functions took ' + (t1 - t0) + ' milliseconds.');

  return newBlob;
}
