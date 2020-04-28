import { mapDataManipulation } from './mapDataManipulation';

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

  console.log('manipulateGain start', { minValue, maxValue, gain, factor, offset, newRedValues });

  newRedValues = newRedValues.map(x => (1 / 255) * x);
  newGreenValues = newGreenValues.map(x => (1 / 255) * x);
  newBlueValues = newBlueValues.map(x => (1 / 255) * x);

  console.log('manipulateGain first step', { newRedValues, newGreenValues, newBlueValues });

  for (let i in newRedValues) {
    newRedValues[i] = Math.max(0.0, newRedValues[i] * factor + offset);
    newGreenValues[i] = Math.max(0.0, newGreenValues[i] * factor + offset);
    newBlueValues[i] = Math.max(0.0, newBlueValues[i] * factor + offset);
  }

  console.log('manipulateGain second step', { newRedValues, newGreenValues, newBlueValues });

  newRedValues = newRedValues.map(x => Math.round((255 / 1) * x));
  newGreenValues = newGreenValues.map(x => Math.round((255 / 1) * x));
  newBlueValues = newBlueValues.map(x => Math.round((255 / 1) * x));

  console.log('manipulateGain final', { newRedValues, newGreenValues, newBlueValues });

  // params.saveManipulationFunctionToStore('redGraph', function (el) {
  //   return newRedValues[el];
  // });
  // params.saveManipulationFunctionToStore('greenGraph', function (el) {
  //   return newGreenValues[el];
  // });
  // params.saveManipulationFunctionToStore('blueGraph', function (el) {
  //   return newBlueValues[el];
  // });

  // call mapDataManipulation

  // const manipulatePixel = function (r, g, b, a) {
  //   r = manFuns && manFuns.redFun ? manFuns.redFun(r) : r;
  //   g = manFuns && manFuns.greenFun ? manFuns.greenFun(g) : g;
  //   b = manFuns && manFuns.blueFun ? manFuns.blueFun(b) : b;
  //   a = manFuns && manFuns.alphaFun ? manFuns.alphaFun(a) : a;
  //   return { r, g, b, a };
  // };

  const manipulatePixel = function(r: number, g: number, b: number, a: number) {
    return { r: newRedValues[r], g: newGreenValues[g], b: newBlueValues[b], a };
  };

  const newBlob = await mapDataManipulation(originalBlob, manipulatePixel);

  return newBlob;
}
