import { BBox } from '../../index';
export declare function constructFixtureFindTilesSearchIndex({ sensingTime, hasMore, fromTime, toTime, bbox, maxCloudCoverPercent, }: {
    sensingTime?: string;
    hasMore?: boolean;
    fromTime?: Date;
    toTime?: Date;
    bbox?: BBox;
    maxCloudCoverPercent?: number;
}): Record<any, any>;
export declare function constructFixtureFindTilesCatalog({ sensingTime, hasMore, fromTime, toTime, bbox, maxCloudCoverPercent, }: {
    sensingTime?: string;
    hasMore?: boolean;
    fromTime?: Date;
    toTime?: Date;
    bbox?: BBox;
    maxCloudCoverPercent?: number;
}): Record<any, any>;
