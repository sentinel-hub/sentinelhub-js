import { BBox, LocationIdSHv3, BYOCSubTypes } from '../../index';
export declare function constructFixtureFindTilesSearchIndex({ sensingTime, hasMore, fromTime, toTime, bbox, collectionId, locationId, }: {
    sensingTime?: string;
    hasMore?: boolean;
    fromTime?: Date;
    toTime?: Date;
    bbox?: BBox;
    collectionId?: string;
    locationId?: LocationIdSHv3;
}): Record<any, any>;
export declare function constructFixtureFindTilesCatalog({ sensingTime, hasMore, fromTime, toTime, bbox, collectionId, locationId, subType, }: {
    sensingTime?: string;
    hasMore?: boolean;
    fromTime?: Date;
    toTime?: Date;
    bbox?: BBox;
    collectionId?: string;
    locationId?: LocationIdSHv3;
    subType?: BYOCSubTypes;
}): Record<any, any>;
export declare function constructFixtureUpdateLayerFromServiceIfNeeded({ collectionId, locationId, }: {
    collectionId?: string;
    locationId?: LocationIdSHv3;
}): Record<any, any>;
