import { MimeType, ImageProperties } from '../layer/const';
export declare function drawBlobOnCanvas(ctx: CanvasRenderingContext2D, blob: Blob, x?: number, y?: number): Promise<void>;
export declare function canvasToBlob(canvas: HTMLCanvasElement, mimeFormat: MimeType | string): Promise<Blob>;
export declare function getImageProperties(originalBlob: Blob): Promise<ImageProperties>;
export declare function getBlob(imageProperties: ImageProperties): Promise<Blob>;
export declare function validateCanvasDimensions(canvas: HTMLCanvasElement): Promise<boolean>;
export declare function scaleCanvasImage(canvas: HTMLCanvasElement, width: number, height: number): Promise<HTMLCanvasElement>;
