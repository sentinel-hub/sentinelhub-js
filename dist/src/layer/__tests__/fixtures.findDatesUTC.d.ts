import { AcquisitionMode, BBox, OrbitDirection, Polarization, Resolution } from '../../index';
import { AbstractSentinelHubV3Layer } from '../AbstractSentinelHubV3Layer';
import { BYOCSubTypes } from '../const';
export declare function constructFixtureFindDatesUTCSearchIndex(layer: AbstractSentinelHubV3Layer, { fromTime, toTime, bbox, maxCloudCoverPercent, productType, collectionId, acquisitionMode, polarization, resolution, orbitDirection, }: {
    fromTime?: Date;
    toTime?: Date;
    bbox?: BBox;
    maxCloudCoverPercent?: number;
    productType?: string;
    collectionId?: string;
    acquisitionMode?: AcquisitionMode;
    polarization?: Polarization.DV;
    resolution?: Resolution.HIGH;
    orbitDirection?: OrbitDirection.ASCENDING;
}): Record<any, any>;
export declare function constructFixtureFindDatesUTCCatalog(layer: AbstractSentinelHubV3Layer, { fromTime, toTime, bbox, maxCloudCoverPercent, productType, collectionId, acquisitionMode, polarization, resolution, orbitDirection, subType, }: {
    fromTime?: Date;
    toTime?: Date;
    bbox?: BBox;
    maxCloudCoverPercent?: number;
    productType?: string;
    collectionId?: string;
    acquisitionMode?: AcquisitionMode;
    polarization?: Polarization;
    resolution?: Resolution;
    orbitDirection?: OrbitDirection;
    subType?: BYOCSubTypes;
}): Record<any, any>;
