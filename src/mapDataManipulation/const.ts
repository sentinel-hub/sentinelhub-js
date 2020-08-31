export type ColorRange = {
  from: number;
  to: number;
};

export type Effects = {
  gain?: number;
  gamma?: number;
  redRange?: ColorRange;
  greenRange?: ColorRange;
  blueRange?: ColorRange;
  customEffect?: Function;
};

export type RgbaArrays = {
  red: number[];
  green: number[];
  blue: number[];
  alpha: number[];
};

export type ImageProperties = {
  imageData: Uint8ClampedArray;
  imageWidth: number;
  imageHeight: number;
  imageFormat: string;
};
