import { RgbaArrays, Effects, ColorRange, ImageProperties } from './const';

export async function getImageData(originalBlob: Blob): Promise<ImageProperties> {
  let imgObjectUrl: any;
  try {
    const imgCanvas = document.createElement('canvas');
    const imgCtx = imgCanvas.getContext('2d');
    imgObjectUrl = window.URL.createObjectURL(originalBlob);
    const img: any = await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = imgObjectUrl;
    });

    imgCanvas.width = img.width;
    imgCanvas.height = img.height;
    imgCtx.drawImage(img, 0, 0);
    const imageData = imgCtx.getImageData(0, 0, img.width, img.height).data;
    imgCanvas.remove();

    return { imageData, imageWidth: img.width, imageHeight: img.height, imageFormat: originalBlob.type };
  } catch (e) {
    console.error(e);
    return { imageData: new Uint8ClampedArray(), imageWidth: 0, imageHeight: 0, imageFormat: '' };
  } finally {
    if (imgObjectUrl) {
      window.URL.revokeObjectURL(imgObjectUrl);
    }
  }
}

export function prepareRgbaArrays(imgData: Uint8ClampedArray): RgbaArrays {
  let red = [],
    green = [],
    blue = [],
    alpha = [];

  for (let i = 0; i < imgData.length; i += 4) {
    red.push(imgData[i]);
    green.push(imgData[i + 1]);
    blue.push(imgData[i + 2]);
    alpha.push(imgData[i + 3]);
  }

  return { red, green, blue, alpha };
}

export function prepareImageData(rgbArrays: RgbaArrays, imageData: Uint8ClampedArray): Uint8ClampedArray {
  let newImgData: Uint8ClampedArray = new Uint8ClampedArray(imageData.length);

  for (let i = 0; i < newImgData.length; i += 4) {
    newImgData[i] = rgbArrays.red[i / 4];
    newImgData[i + 1] = rgbArrays.green[i / 4];
    newImgData[i + 2] = rgbArrays.blue[i / 4];
    newImgData[i + 3] = rgbArrays.alpha[i / 4];
  }

  return newImgData;
}

export async function getBlob(imageProperties: ImageProperties): Promise<Blob> {
  const { imageData, imageWidth, imageHeight, imageFormat } = imageProperties;
  let imgObjectUrl: any;
  try {
    const imgCanvas = document.createElement('canvas');
    const imgCtx = imgCanvas.getContext('2d');
    const newImg = new ImageData(imageData, imageWidth, imageHeight);
    imgCtx.putImageData(newImg, 0, 0);
    const blob: Blob = await new Promise(resolve => {
      imgCanvas.toBlob(blob => {
        resolve(blob);
      }, imageFormat);
    });
    imgCanvas.remove();
    return blob;
  } catch (e) {
    console.error(e);
  } finally {
    if (imgObjectUrl) {
      window.URL.revokeObjectURL(imgObjectUrl);
    }
  }
}

// from one range to another
// f(x) = c + ((d - c) / (b - a)) * (x - a)
// a = oldMin, b = oldMax; c = newMin, d = newMax
// [0,255] to [0,1]: a = 0, b = 255; c = 0, d = 1
// [0,1] to [0,255]: a = 0, b = 1; c = 0, d = 255

export function transformValueToRange(
  x: number,
  oldMin: number,
  oldMax: number,
  newMin: number,
  newMax: number,
): number {
  let newX = newMin + ((newMax - newMin) / (oldMax - oldMin)) * (x - oldMin);
  newX = Math.max(newX, newMin);
  newX = Math.min(newX, newMax);
  return newX;
}

export function changeRgbaArraysRange(
  rgbaArrays: RgbaArrays,
  oldMin: number,
  oldMax: number,
  newMin: number,
  newMax: number,
): RgbaArrays {
  const newRgbaArrays = { ...rgbaArrays };
  newRgbaArrays.red = newRgbaArrays.red.map(x => transformValueToRange(x, oldMin, oldMax, newMin, newMax));
  newRgbaArrays.green = newRgbaArrays.green.map(x =>
    transformValueToRange(x, oldMin, oldMax, newMin, newMax),
  );
  newRgbaArrays.blue = newRgbaArrays.blue.map(x => transformValueToRange(x, oldMin, oldMax, newMin, newMax));
  newRgbaArrays.alpha = newRgbaArrays.alpha.map(x =>
    transformValueToRange(x, oldMin, oldMax, newMin, newMax),
  );
  return newRgbaArrays;
}

export function isEffectSet(effect: number | ColorRange | Function): boolean {
  return effect !== undefined && effect !== null;
}

export function isAnyEffectSet(effects: Effects): boolean {
  return Object.values(effects).some(e => isEffectSet(e));
}
