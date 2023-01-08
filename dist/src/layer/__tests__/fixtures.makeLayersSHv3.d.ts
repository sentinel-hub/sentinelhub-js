export declare const getLayersFromConfigurationService: ({
    '@id': string;
    id: string;
    title: string;
    description: string;
    styles: {
        name: string;
        description: string;
        evalScript: string;
    }[];
    orderHint: number;
    instance: {
        '@id': string;
    };
    dataset: {
        '@id': string;
    };
    datasetSource: {
        '@id': string;
    };
    defaultStyleName: string;
    datasourceDefaults: {
        temporal: boolean;
        previewMode: string;
        type: string;
        upsampling?: undefined;
        downsampling?: undefined;
        mosaickingOrder?: undefined;
        maxCloudCoverage?: undefined;
    };
} | {
    '@id': string;
    id: string;
    title: string;
    description: string;
    styles: {
        name: string;
        description: string;
        evalScript: string;
        legend: {
            type: string;
            items: {
                color: string;
                label: string;
            }[];
        };
    }[];
    orderHint: number;
    instance: {
        '@id': string;
    };
    dataset: {
        '@id': string;
    };
    datasetSource: {
        '@id': string;
    };
    defaultStyleName: string;
    datasourceDefaults: {
        upsampling: string;
        downsampling: string;
        mosaickingOrder: string;
        temporal: boolean;
        maxCloudCoverage: number;
        type: string;
        previewMode?: undefined;
    };
} | {
    '@id': string;
    id: string;
    title: string;
    description: string;
    styles: {
        name: string;
        description: string;
        dataProduct: {
            '@id': string;
        };
    }[];
    orderHint: number;
    instance: {
        '@id': string;
    };
    dataset: {
        '@id': string;
    };
    datasetSource: {
        '@id': string;
    };
    defaultStyleName: string;
    datasourceDefaults: {
        mosaickingOrder: string;
        temporal: boolean;
        maxCloudCoverage: number;
        type: string;
        previewMode?: undefined;
        upsampling?: undefined;
        downsampling?: undefined;
    };
})[];
export declare const getLayersFromJsonCapabilities: {
    title: string;
    layers: {
        id: string;
        name: string;
        description: string;
        dataset: string;
        legendUrl: string;
    }[];
    datasets: {
        name: string;
        bands: string[];
    }[];
};
export declare const expectedResultJsonCapabilities: (overrideConstructorParams?: Record<string, any>) => Record<string, any>[];
export declare const expectedResultConfigurationService: (overrideConstructorParams?: Record<string, any>) => Record<string, any>[];
