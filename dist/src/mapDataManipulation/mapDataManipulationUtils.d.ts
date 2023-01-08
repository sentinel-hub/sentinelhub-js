import { Effects, ColorRange } from './const';
export declare function transformValueToRange(x: number, oldMin: number, oldMax: number, newMin: number, newMax: number): number;
export declare function isEffectSet(effect: number | ColorRange | Function): boolean;
export declare function isAnyEffectSet(effects: Effects): boolean;
