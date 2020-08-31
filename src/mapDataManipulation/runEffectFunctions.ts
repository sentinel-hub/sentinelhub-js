import { Effects } from './const';
import {
  isAnyEffectSet,
  getImageData,
  prepareRgbaArrays,
  changeRgbaArraysRange,
  prepareImageData,
  getBlob,
} from './mapDataManipulationUtils';
import {
  runGainEffectFunction,
  runGammaEffectFunction,
  runColorEffectFunction,
  runCustomEffectFunction,
} from './effectFunctions';

// The algorithm works with numbers between 0 and 1, so we must:
// - change the range of the values from [0, 255] to [0, 1]
// - change the values according to the algorithms (gain; gamma; r,g,b effects)
// - change the range of the values from [0, 1] back to [0, 255]

export async function runEffectFunctions(originalBlob: Blob, effects: Effects): Promise<Blob> {
  var t0 = performance.now();

  if (!isAnyEffectSet(effects)) {
    return originalBlob;
  }

  const { imageData, imageWidth, imageHeight, imageFormat } = await getImageData(originalBlob);
  let rgbaArrays = prepareRgbaArrays(imageData);

  // change the range of the values from [0, 255] to [0, 1]
  rgbaArrays = changeRgbaArraysRange(rgbaArrays, 0, 255, 0, 1);

  // change the values according to the algorithm (gain)
  rgbaArrays = runGainEffectFunction(rgbaArrays, effects);

  // change the values according to the algorithm (gamma)
  rgbaArrays = runGammaEffectFunction(rgbaArrays, effects);

  // change the values according to the algorithm (r,g,b effects)
  rgbaArrays = runColorEffectFunction(rgbaArrays, effects);

  // run custom effect function (with custom range of values)
  rgbaArrays = runCustomEffectFunction(rgbaArrays, effects);

  // change the range of the values from [0, 1] back to [0, 255]
  rgbaArrays = changeRgbaArraysRange(rgbaArrays, 0, 1, 0, 255);

  const newImgData = prepareImageData(rgbaArrays, imageData);
  const newBlob = getBlob({ imageData: newImgData, imageWidth, imageHeight, imageFormat });

  var t1 = performance.now();
  console.log('running effect functions took ' + (t1 - t0) + ' milliseconds.');

  return newBlob;
}
