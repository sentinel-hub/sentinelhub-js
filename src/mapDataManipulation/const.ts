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

export type RgbMappingArrays = {
  red: number[];
  green: number[];
  blue: number[];
};
