import { MimeType } from '../layer/const';

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
      const img = document.createElement('img');
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
