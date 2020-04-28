import { mapDataManipulation } from 'src/mapDataManipulation/mapDataManipulation';

// This is the algorithm closest to the algorithm on the backend.
// https://git.sinergise.com/sentinel-core/java/blob/master/RendererService/src/main/resources/com/sinergise/sentinel/renderer/javascript/global/js/defaultVisualizer.js
// The algorithm works with numbers between 0 and 1, so we must:
// - change the interval of the values from [0, 255] to [0, 1]
// - change the values according to the algorithm
// - change the interval of the values from [0, 1] back to [0, 255]

export async function manipulateGain(
  originalBlob: Blob,
  newGain: number,
  newMinValue?: number,
  newMaxValue?: number,
  newOffset?: number,
) {
  const minValue = newMinValue ? newMinValue : 0.0;
  const maxValue = newMaxValue ? newMaxValue : 1.0;
  const gain = newGain ? newGain : 1.0;
  const factor = gain / (maxValue - minValue);
  let offset = newOffset ? newOffset : 0.0;
  offset = offset - factor * minValue;

  let newRedValues = [...Array(256).keys()];
  let newGreenValues = [...Array(256).keys()];
  let newBlueValues = [...Array(256).keys()];

  // change the interval of the values from [0, 255] to [0, 1]
  newRedValues = newRedValues.map(x => (1 / 255) * x);
  newGreenValues = newGreenValues.map(x => (1 / 255) * x);
  newBlueValues = newBlueValues.map(x => (1 / 255) * x);

  // change the values according to the algorithm
  newRedValues = newRedValues.map(x => Math.max(0.0, x * factor + offset));
  newGreenValues = newGreenValues.map(x => Math.max(0.0, x * factor + offset));
  newBlueValues = newBlueValues.map(x => Math.max(0.0, x * factor + offset));

  // change the interval of the values from [0, 1] back to [0, 255]
  newRedValues = newRedValues.map(x => Math.round((255 / 1) * x));
  newGreenValues = newGreenValues.map(x => Math.round((255 / 1) * x));
  newBlueValues = newBlueValues.map(x => Math.round((255 / 1) * x));

  const manipulatePixel = function(r: number, g: number, b: number, a: number) {
    return { r: newRedValues[r], g: newGreenValues[g], b: newBlueValues[b], a };
  };
  return await mapDataManipulation(originalBlob, manipulatePixel);
}
