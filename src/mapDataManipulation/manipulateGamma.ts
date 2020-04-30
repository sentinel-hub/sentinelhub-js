import { mapDataManipulation } from 'src/mapDataManipulation/mapDataManipulation';

// This is the algorithm closest to the algorithm on the backend.
// https://git.sinergise.com/sentinel-core/java/blob/master/RendererService/src/main/resources/com/sinergise/sentinel/renderer/javascript/global/js/defaultVisualizer.js
// The algorithm works with numbers between 0 and 1, so we must:
// - change the interval of the values from [0, 255] to [0, 1]
// - change the values according to the algorithm
// - change the interval of the values from [0, 1] back to [0, 255]

export async function manipulateGamma(originalBlob: Blob, newGamma: number): Promise<Blob> {
  let newRedValues = [...Array(256).keys()];
  let newGreenValues = [...Array(256).keys()];
  let newBlueValues = [...Array(256).keys()];

  // change the interval of the values from [0, 255] to [0, 1]
  newRedValues = newRedValues.map(x => (1 / 255) * x);
  newGreenValues = newGreenValues.map(x => (1 / 255) * x);
  newBlueValues = newBlueValues.map(x => (1 / 255) * x);

  // change the values according to the algorithm
  if (newGamma != 1.0) {
    newRedValues = newRedValues.map(x => Math.pow(x, newGamma));
    newGreenValues = newGreenValues.map(x => Math.pow(x, newGamma));
    newBlueValues = newBlueValues.map(x => Math.pow(x, newGamma));
  }

  // change the interval of the values from [0, 1] back to [0, 255]
  newRedValues = newRedValues.map(x => Math.round((255 / 1) * x));
  newGreenValues = newGreenValues.map(x => Math.round((255 / 1) * x));
  newBlueValues = newBlueValues.map(x => Math.round((255 / 1) * x));

  const manipulatePixel = function(r: number, g: number, b: number, a: number): object {
    return { r: newRedValues[r], g: newGreenValues[g], b: newBlueValues[b], a };
  };
  return await mapDataManipulation(originalBlob, manipulatePixel);
}
