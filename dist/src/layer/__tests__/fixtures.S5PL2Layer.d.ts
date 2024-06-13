import { BBox } from '../../index';
import { ProductType } from '../S5PL2Layer';
export declare function constructFixtureFindTilesSearchIndex({ sensingTime, hasMore, fromTime, toTime, bbox, productType, }: {
    sensingTime?: string;
    hasMore?: boolean;
    fromTime?: Date;
    toTime?: Date;
    bbox?: BBox;
    productType?: ProductType;
}): Record<any, any>;
export declare function constructFixtureFindTilesCatalog({ sensingTime, hasMore, fromTime, toTime, bbox, productType, }: {
    sensingTime?: string;
    hasMore?: boolean;
    fromTime?: Date;
    toTime?: Date;
    bbox?: BBox;
    productType?: ProductType;
}): Record<any, any>;
