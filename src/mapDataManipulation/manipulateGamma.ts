// from one range to other
// f(x) = c + ((d - c) / (b - a)) * (x - a)

// [0,255] to [0,1]
// a = 0, b = 255
// c = 0, d = 1

// [0,1] to [0,255]
// a = 0, b = 1
// c = 0, d = 255

// export function legacyGamma(params) {
//   let newRedValues = [...Array(256).keys()];
//   let newGreenValues = [...Array(256).keys()];
//   let newBlueValues = [...Array(256).keys()];

//   newRedValues = newRedValues.map(x => (1 / 255) * x);
//   newGreenValues = newGreenValues.map(x => (1 / 255) * x);
//   newBlueValues = newBlueValues.map(x => (1 / 255) * x);

//   if (params.gamma != 1.0) {
//     for (let i in newRedValues) {
//       newRedValues[i] = Math.pow(newRedValues[i], params.gamma);
//       newGreenValues[i] = Math.pow(newGreenValues[i], params.gamma);
//       newBlueValues[i] = Math.pow(newBlueValues[i], params.gamma);
//     }
//   }

//   newRedValues = newRedValues.map(x => Math.round((255 / 1) * x));
//   newGreenValues = newGreenValues.map(x => Math.round((255 / 1) * x));
//   newBlueValues = newBlueValues.map(x => Math.round((255 / 1) * x));

//   params.saveManipulationFunctionToStore('redGraph', function (el) {
//     return newRedValues[el];
//   });
//   params.saveManipulationFunctionToStore('greenGraph', function (el) {
//     return newGreenValues[el];
//   });
//   params.saveManipulationFunctionToStore('blueGraph', function (el) {
//     return newBlueValues[el];
//   });
// }
