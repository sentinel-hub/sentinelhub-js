import { BBox, AcquisitionMode, Polarization, Resolution, OrbitDirection } from '../../index';
export declare function constructFixtureFindTilesSearchIndex({ sensingTime, hasMore, fromTime, toTime, bbox, acquisitionMode, polarization, resolution, orbitDirection, }: {
    sensingTime?: string;
    hasMore?: boolean;
    fromTime?: Date;
    toTime?: Date;
    bbox?: BBox;
    acquisitionMode?: AcquisitionMode;
    polarization?: Polarization;
    resolution?: Resolution;
    orbitDirection?: OrbitDirection;
}): Record<any, any>;
export declare function constructFixtureFindTilesCatalog({ sensingTime, hasMore, fromTime, toTime, bbox, acquisitionMode, polarization, resolution, orbitDirection, }: {
    sensingTime?: string;
    hasMore?: boolean;
    fromTime?: Date;
    toTime?: Date;
    bbox?: BBox;
    acquisitionMode?: AcquisitionMode;
    polarization?: Polarization;
    resolution?: Resolution;
    orbitDirection?: OrbitDirection;
}): Record<any, any>;
