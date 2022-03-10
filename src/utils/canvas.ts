import { MimeType, ImageProperties } from '../layer/const';

export async function drawBlobOnCanvas(
  ctx: CanvasRenderingContext2D,
  blob: Blob,
  x: number = 0,
  y: number = 0,
): Promise<void> {
  const objectURL = URL.createObjectURL(blob);
  try {
    // wait until objectUrl is drawn on the image, so you can safely draw img on canvas:
    const imgDrawn: HTMLImageElement = await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = objectURL;
    });
    ctx.drawImage(imgDrawn, x, y);
  } finally {
    URL.revokeObjectURL(objectURL);
  }
}

export async function canvasToBlob(canvas: HTMLCanvasElement, mimeFormat: MimeType): Promise<Blob> {
  return await new Promise(resolve => canvas.toBlob(resolve, mimeFormat));
}

export async function getImageProperties(originalBlob: Blob): Promise<ImageProperties> {
  let imgObjectUrl: any;
  const imgCanvas = document.createElement('canvas');
  try {
    const imgCtx = imgCanvas.getContext('2d');
    imgObjectUrl = URL.createObjectURL(originalBlob);
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

    const stringToMimeType = (str: any): MimeType => str;
    const format = stringToMimeType(originalBlob.type);

    return { rgba: imgData, width: img.width, height: img.height, format: format };
  } catch (e) {
    console.error(e);
    throw new Error(e);
  } finally {
    imgCanvas.remove();
    if (imgObjectUrl) {
      URL.revokeObjectURL(imgObjectUrl);
    }
  }
}

export async function getBlob(imageProperties: ImageProperties): Promise<Blob> {
  const { rgba, width, height, format } = imageProperties;
  const imgCanvas = document.createElement('canvas');
  try {
    imgCanvas.width = width;
    imgCanvas.height = height;
    const imgCtx = imgCanvas.getContext('2d');
    const newImg = new ImageData(rgba, width, height);
    imgCtx.putImageData(newImg, 0, 0);
    const blob: Blob = await canvasToBlob(imgCanvas, format);
    return blob;
  } catch (e) {
    console.error(e);
    throw new Error(e);
  } finally {
    imgCanvas.remove();
  }
}

export async function validateCanvasDimensions(canvas: HTMLCanvasElement): Promise<boolean> {
  // If the canvas exceeds the size limit for the browser, canvas.toBlob returns null.
  const blob = await new Promise(resolve => canvas.toBlob(resolve));
  if (blob === null) {
    return false;
  }
  return true;
}

export async function scaleCanvasImage(
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
): Promise<HTMLCanvasElement> {
  const newSizeCanvas = document.createElement('canvas');
  newSizeCanvas.width = width;
  newSizeCanvas.height = height;
  const newSizeCtx = newSizeCanvas.getContext('2d');
  newSizeCtx.imageSmoothingEnabled = false;
  newSizeCtx.drawImage(canvas, 0, 0, width, height);
  return newSizeCanvas;
}
