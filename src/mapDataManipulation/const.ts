export type ColorRange = {
  from: number;
  to: number;
};

export type ValueRange = {
  from: number;
  to: number;
  numberType: NumberType;
};

export type CustomEffectFunctions = {
  redFunction?: Function;
  greenFunction?: Function;
  blueFunction?: Function;
  range: ValueRange;
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

export enum NumberType {
  INT = 'INT',
  FLOAT = 'FLOAT',
}
