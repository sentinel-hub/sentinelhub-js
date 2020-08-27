export type ColorRange = {
  from: number;
  to: number;
};

export type CustomEffectFunctions = {
  redFunction?: Function;
  greenFunction?: Function;
  blueFunction?: Function;
};

export type Effects = {
  gain?: number;
  gamma?: number;
  redRange?: ColorRange;
  greenRange?: ColorRange;
  blueRange?: ColorRange;
  customEffect?: CustomEffectFunctions;
};

export type RgbMappingArrays = {
  red: number[];
  green: number[];
  blue: number[];
};
