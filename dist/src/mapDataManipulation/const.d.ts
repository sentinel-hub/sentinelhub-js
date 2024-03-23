export declare type ColorRange = {
    from: number;
    to: number;
};
export declare type Effects = {
    gain?: number;
    gamma?: number;
    redRange?: ColorRange;
    greenRange?: ColorRange;
    blueRange?: ColorRange;
    customEffect?: Function;
};
