// manipulatePixel is a function that transforms pixel's (R,G,B) values into new (R,G,B) values
export async function mapDataManipulation(originalBlob: Blob, manipulatePixel: any): Promise<Blob> {
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
    const imgData = imgCtx.getImageData(0, 0, img.width, img.height).data;

    const newImgData = manipulateImage(imgData, manipulatePixel);
    const newImg = new ImageData(newImgData, img.width, img.height);
    imgCtx.putImageData(newImg, 0, 0);
    const blob: Blob = await new Promise(resolve => {
      imgCanvas.toBlob(blob => {
        resolve(blob);
      }, originalBlob.type);
    });
    return blob;
  } catch (e) {
    console.error(e);
    return originalBlob;
  } finally {
    if (imgObjectUrl) {
      window.URL.revokeObjectURL(imgObjectUrl);
    }
  }
}

function manipulateImage(imgData: any, manipulatePixel: any): any {
  let newImgData: Uint8ClampedArray = new Uint8ClampedArray(imgData.length);
  for (let i = 0; i < imgData.length; i += 4) {
    const r = imgData[i];
    const g = imgData[i + 1];
    const b = imgData[i + 2];
    const a = imgData[i + 3];

    const newPixelValues = manipulatePixel(r, g, b, a);

    newImgData[i] = newPixelValues.r;
    newImgData[i + 1] = newPixelValues.g;
    newImgData[i + 2] = newPixelValues.b;
    newImgData[i + 3] = newPixelValues.a;
  }

  return newImgData;
}
