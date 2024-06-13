'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var xml2js = require('xml2js');
var area = _interopDefault(require('@turf/area'));
var polygonClipping = _interopDefault(require('polygon-clipping'));
var queryString = require('query-string');
var moment = _interopDefault(require('moment'));
var WKT = _interopDefault(require('terraformer-wkt-parser'));
var axios = _interopDefault(require('axios'));

class BBox {
    constructor(crs, minX, minY, maxX, maxY) {
        if (minX >= maxX) {
            throw new Error('MinX should be lower than maxX');
        }
        if (minY >= maxY) {
            throw new Error('MinY should be lower than maxY');
        }
        this.crs = crs;
        this.minX = minX;
        this.maxX = maxX;
        this.minY = minY;
        this.maxY = maxY;
    }
    // Note that Turf's Polygon type (which is basically what we are returning) doesn't
    // allow 'crs' property, so we must return type :any.
    toGeoJSON() {
        return {
            type: 'Polygon',
            crs: { type: 'name', properties: { name: this.crs.urn } },
            coordinates: [
                [
                    [this.minX, this.minY],
                    [this.maxX, this.minY],
                    [this.maxX, this.maxY],
                    [this.minX, this.maxY],
                    [this.minX, this.minY],
                ],
            ],
        };
    }
}

/**
 * The most common CRS for online maps, used by almost all free and commercial tile providers. Uses Spherical Mercator projection.
 */
const CRS_EPSG3857 = {
    authId: 'EPSG:3857',
    auth: 'EPSG',
    srid: 3857,
    urn: 'urn:ogc:def:crs:EPSG::3857',
    opengisUrl: 'http://www.opengis.net/def/crs/EPSG/0/3857',
};
/**
 * EPSG:4326 is identifier of World Geodetic System (WGS84) which comprises of a reference ellipsoid, a standard coordinate system, altitude data and a geoid.
 */
const CRS_EPSG4326 = {
    authId: 'EPSG:4326',
    auth: 'EPSG',
    srid: 4326,
    urn: 'urn:ogc:def:crs:EPSG::4326',
    opengisUrl: 'http://www.opengis.net/def/crs/EPSG/0/4326',
};
/**
 * Same as EPSG:4326, but with a switched coordinate order.
 */
const CRS_WGS84 = {
    authId: 'CRS:84',
    auth: 'CRS',
    srid: 84,
    urn: 'urn:ogc:def:crs:OGC:1.3:CRS84',
    opengisUrl: 'http://www.opengis.net/def/crs/OGC/1.3/CRS84',
};
const SUPPORTED_CRS_OBJ = {
    [CRS_EPSG3857.authId]: CRS_EPSG3857,
    [CRS_EPSG4326.authId]: CRS_EPSG4326,
    [CRS_WGS84.authId]: CRS_WGS84,
};
function findCrsFromUrn(urn) {
    switch (urn) {
        case 'urn:ogc:def:crs:EPSG::3857':
            return CRS_EPSG3857;
        case 'urn:ogc:def:crs:EPSG::4326':
            return CRS_EPSG4326;
        case 'urn:ogc:def:crs:OGC:1.3:CRS84':
            return CRS_WGS84;
        default:
            throw new Error('CRS not found');
    }
}

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

function __rest(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
}

function __awaiter(thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

let authToken = null;
function getAuthToken() {
    return authToken;
}
function setAuthToken(newAuthToken) {
    authToken = newAuthToken;
}
function isAuthTokenSet() {
    return authToken !== null;
}
function requestAuthToken(clientId, clientSecret) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield axios({
            method: 'post',
            url: 'https://services.sentinel-hub.com/oauth/token',
            headers: { 'content-type': 'application/x-www-form-urlencoded' },
            data: `grant_type=client_credentials&client_id=${encodeURIComponent(clientId)}&client_secret=${encodeURIComponent(clientSecret)}`,
        });
        return response.data.access_token;
    });
}

(function (Interpolator) {
    Interpolator["BILINEAR"] = "BILINEAR";
    Interpolator["BICUBIC"] = "BICUBIC";
    Interpolator["LANCZOS"] = "LANCZOS";
    Interpolator["BOX"] = "BOX";
    Interpolator["NEAREST"] = "NEAREST";
})(exports.Interpolator || (exports.Interpolator = {}));
(function (PreviewMode) {
    PreviewMode[PreviewMode["DETAIL"] = 0] = "DETAIL";
    PreviewMode[PreviewMode["PREVIEW"] = 1] = "PREVIEW";
    PreviewMode[PreviewMode["EXTENDED_PREVIEW"] = 2] = "EXTENDED_PREVIEW";
})(exports.PreviewMode || (exports.PreviewMode = {}));
(function (MosaickingOrder) {
    MosaickingOrder["MOST_RECENT"] = "mostRecent";
    MosaickingOrder["LEAST_RECENT"] = "leastRecent";
    MosaickingOrder["LEAST_CC"] = "leastCC";
})(exports.MosaickingOrder || (exports.MosaickingOrder = {}));
(function (ApiType) {
    ApiType["WMS"] = "wms";
    ApiType["WMTS"] = "wmts";
    ApiType["PROCESSING"] = "processing";
})(exports.ApiType || (exports.ApiType = {}));
(function (OrbitDirection) {
    OrbitDirection["ASCENDING"] = "ASCENDING";
    OrbitDirection["DESCENDING"] = "DESCENDING";
})(exports.OrbitDirection || (exports.OrbitDirection = {}));
(function (BackscatterCoeff) {
    BackscatterCoeff["BETA0"] = "BETA0";
    BackscatterCoeff["GAMMA0_ELLIPSOID"] = "GAMMA0_ELLIPSOID";
    BackscatterCoeff["SIGMA0_ELLIPSOID"] = "SIGMA0_ELLIPSOID";
    BackscatterCoeff["GAMMA0_TERRAIN"] = "GAMMA0_TERRAIN";
})(exports.BackscatterCoeff || (exports.BackscatterCoeff = {}));
(function (LinkType) {
    LinkType["EOCLOUD"] = "eocloud";
    LinkType["AWS"] = "aws";
    LinkType["PREVIEW"] = "preview";
    LinkType["CREODIAS"] = "creodias";
    LinkType["SCIHUB"] = "scihub";
})(exports.LinkType || (exports.LinkType = {}));
const MimeTypes = {
    JPEG: 'image/jpeg',
    PNG: 'image/png',
    JPEG_OR_PNG: 'JPEG_OR_PNG',
};
const SH_SERVICE_HOSTNAMES_V1_OR_V2 = ['https://eocloud.sentinel-hub.com/'];
const SH_SERVICE_HOSTNAMES_V3 = [
    'https://services.sentinel-hub.com/',
    'https://services-uswest2.sentinel-hub.com/',
    'https://creodias.sentinel-hub.com/',
    'https://services.cdasstage.sentinel-hub.com/',
];
(function (LocationIdSHv3) {
    LocationIdSHv3["awsEuCentral1"] = "aws-eu-central-1";
    LocationIdSHv3["awsUsWest2"] = "aws-us-west-2";
    LocationIdSHv3["creo"] = "creo";
    LocationIdSHv3["mundi"] = "mundi";
    LocationIdSHv3["gcpUsCentral1"] = "gcp-us-central1";
})(exports.LocationIdSHv3 || (exports.LocationIdSHv3 = {}));
const SHV3_LOCATIONS_ROOT_URL = {
    [exports.LocationIdSHv3.awsEuCentral1]: 'https://services.sentinel-hub.com/',
    [exports.LocationIdSHv3.awsUsWest2]: 'https://services-uswest2.sentinel-hub.com/',
    [exports.LocationIdSHv3.creo]: 'https://creodias.sentinel-hub.com/',
    [exports.LocationIdSHv3.mundi]: 'https://shservices.mundiwebservices.com/',
    [exports.LocationIdSHv3.gcpUsCentral1]: 'https://services-gcp-us-central1.sentinel-hub.com/',
};
var HistogramType;
(function (HistogramType) {
    HistogramType["EQUALFREQUENCY"] = "EQUALFREQUENCY";
    // EQUIDISTANT = 'EQUIDISTANT',
    // STREAMING = 'STREAMING',
})(HistogramType || (HistogramType = {}));
const DEFAULT_FIND_TILES_MAX_COUNT_PARAMETER = 50;
const SUPPORTED_DATA_PRODUCTS_PROCESSING = [
    'https://services.sentinel-hub.com/configuration/v1/datasets/S2L1C/dataproducts/643',
];
//catalog search uses optional `limit` parameter that limits the number of items that are presented in the response document
//CATALOG_SEARCH_MAX_LIMIT represents maximum value for that parameter
const CATALOG_SEARCH_MAX_LIMIT = 100;
(function (DEMInstanceType) {
    DEMInstanceType["MAPZEN"] = "MAPZEN";
    DEMInstanceType["COPERNICUS_30"] = "COPERNICUS_30";
    DEMInstanceType["COPERNICUS_90"] = "COPERNICUS_90";
})(exports.DEMInstanceType || (exports.DEMInstanceType = {}));
(function (DEMInstanceTypeOrthorectification) {
    DEMInstanceTypeOrthorectification["MAPZEN"] = "MAPZEN";
    DEMInstanceTypeOrthorectification["COPERNICUS"] = "COPERNICUS";
    DEMInstanceTypeOrthorectification["COPERNICUS_30"] = "COPERNICUS_30";
    DEMInstanceTypeOrthorectification["COPERNICUS_90"] = "COPERNICUS_90";
})(exports.DEMInstanceTypeOrthorectification || (exports.DEMInstanceTypeOrthorectification = {}));
(function (BYOCSubTypes) {
    BYOCSubTypes["BATCH"] = "BATCH";
    BYOCSubTypes["BYOC"] = "BYOC";
    BYOCSubTypes["ZARR"] = "ZARR";
})(exports.BYOCSubTypes || (exports.BYOCSubTypes = {}));
var OgcServiceTypes;
(function (OgcServiceTypes) {
    OgcServiceTypes["WMS"] = "wms";
    OgcServiceTypes["WMTS"] = "wmts";
})(OgcServiceTypes || (OgcServiceTypes = {}));
const PLANET_FALSE_COLOR_TEMPLATES = [
    { description: '', titleSuffix: 'NDWI', resourceUrlParams: { proc: 'ndwi' } },
    { description: '', titleSuffix: 'NDVI', resourceUrlParams: { proc: 'ndvi' } },
    { description: '', titleSuffix: 'MSAVI2', resourceUrlParams: { proc: 'msavi2' } },
    { description: '', titleSuffix: 'MTVI2', resourceUrlParams: { proc: 'mtvi2' } },
    { description: '', titleSuffix: 'VARI', resourceUrlParams: { proc: 'vari' } },
    { description: '', titleSuffix: 'TGI', resourceUrlParams: { proc: 'tgi' } },
    { description: '', titleSuffix: 'CIR', resourceUrlParams: { proc: 'cir' } },
];

let debugEnabled = false;
function setDebugEnabled(value) {
    debugEnabled = value;
}
function isDebugEnabled() {
    return debugEnabled;
}

(function (CacheTarget) {
    CacheTarget["CACHE_API"] = "CACHE_API";
    CacheTarget["MEMORY"] = "MEMORY";
})(exports.CacheTarget || (exports.CacheTarget = {}));
const CACHE_API_KEY = 'sentinelhub-v1';
const SUPPORTED_TARGETS = [exports.CacheTarget.CACHE_API, exports.CacheTarget.MEMORY];
const memoryCache = new Map();
// Factory will return an instance of a Cache interface.
// The first availble target will be used
// By default we will use cache_api if availble, if not we will cache in memory
// user can also specify to just use in memory caching
// If user provides a CacheTarget.CACHE_API and cache_api is not availble we will fallback to memory
function cacheFactory(optionalTargets) {
    return __awaiter(this, void 0, void 0, function* () {
        const targets = optionalTargets || SUPPORTED_TARGETS;
        const target = yield getFirstUseableTarget(targets);
        return constructCache(target);
    });
}
function getFirstUseableTarget(targets) {
    return __awaiter(this, void 0, void 0, function* () {
        let firstTargetToUse = undefined; // default to memory if target is not supported
        for (const key of targets) {
            if (yield doesTargetExist(key)) {
                firstTargetToUse = key;
                break;
            }
        }
        return firstTargetToUse;
    });
}
function checkIfCacheApiAvailable() {
    return __awaiter(this, void 0, void 0, function* () {
        if (typeof window === 'undefined' || !window.caches) {
            return false;
        }
        try {
            const caches = window.caches;
            //make request to cacheApi to check if it is available
            yield caches.keys();
            return true;
        }
        catch (err) {
            console.warn('CacheApi is not available', err);
            return false;
        }
    });
}
function doesTargetExist(target) {
    return __awaiter(this, void 0, void 0, function* () {
        switch (target) {
            case exports.CacheTarget.CACHE_API:
                return yield checkIfCacheApiAvailable();
            case exports.CacheTarget.MEMORY:
                return true;
            default:
                return false;
        }
    });
}
function constructCache(target) {
    switch (target) {
        case exports.CacheTarget.CACHE_API:
            return new CacheApi();
        case exports.CacheTarget.MEMORY:
            return new MemoryCache();
        default:
            return null;
    }
}
class MemoryCache {
    set(key, response) {
        return __awaiter(this, void 0, void 0, function* () {
            memoryCache.set(key, response);
        });
    }
    get(key) {
        return __awaiter(this, void 0, void 0, function* () {
            const cachedResponse = memoryCache.get(key);
            if (!cachedResponse) {
                return null;
            }
            return {
                data: cachedResponse.data,
                status: cachedResponse.status,
                statusText: cachedResponse.statusText,
                headers: cachedResponse.headers,
            };
        });
    }
    has(key) {
        return __awaiter(this, void 0, void 0, function* () {
            return memoryCache.has(key);
        });
    }
    keys() {
        return __awaiter(this, void 0, void 0, function* () {
            return Array.from(memoryCache.keys());
        });
    }
    delete(key) {
        return __awaiter(this, void 0, void 0, function* () {
            memoryCache.delete(key);
        });
    }
    getHeaders(key) {
        return __awaiter(this, void 0, void 0, function* () {
            const cachedResponse = memoryCache.get(key);
            if (!cachedResponse) {
                return null;
            }
            return cachedResponse.headers;
        });
    }
    invalidate() {
        memoryCache.clear();
    }
}
class CacheApi {
    constructor() {
        this.cache = caches.open(CACHE_API_KEY);
    }
    set(key, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const cache = yield this.cache;
            const responseData = this.serializeResponseData(response);
            cache.put(key, responseData);
        });
    }
    get(key, responseType) {
        return __awaiter(this, void 0, void 0, function* () {
            const cache = yield this.cache;
            const response = yield cache.match(key);
            if (!response) {
                return null;
            }
            return {
                data: yield this.deSerializeResponseData(response, responseType),
                status: response.status,
                statusText: response.statusText,
                headers: yield this.deserializeHeaders(response.headers),
            };
        });
    }
    has(key) {
        return __awaiter(this, void 0, void 0, function* () {
            const cache = yield this.cache;
            const response = yield cache.match(key);
            return Boolean(response);
        });
    }
    keys() {
        return __awaiter(this, void 0, void 0, function* () {
            const cache = yield caches.open(CACHE_API_KEY);
            const keys = yield cache.keys();
            return keys;
        });
    }
    delete(key) {
        return __awaiter(this, void 0, void 0, function* () {
            const cache = yield this.cache;
            yield cache.delete(key);
        });
    }
    getHeaders(key) {
        return __awaiter(this, void 0, void 0, function* () {
            const cache = yield this.cache;
            const response = yield cache.match(key);
            if (!response) {
                return null;
            }
            return yield this.deserializeHeaders(response.headers);
        });
    }
    invalidate() {
        return __awaiter(this, void 0, void 0, function* () {
            const cache = yield this.cache;
            const cacheKeys = yield cache.keys();
            for (let key of cacheKeys) {
                yield cache.delete(key);
            }
        });
    }
    serializeResponseData(response) {
        let responseData;
        switch (response.config.responseType) {
            case 'blob':
            case 'arraybuffer':
            case 'text':
                // we can save usual responses as they are:
                responseData = response.data;
                break;
            case 'json':
            case undefined: // axios defaults to json https://github.com/axios/axios#request-config
                // but json was converted by axios to an object - and we want to save a string:
                responseData = JSON.stringify(response.data);
                break;
            default:
                throw new Error('Unsupported response type: ' + response.request.responseType);
        }
        return new Response(responseData, response);
    }
    deSerializeResponseData(cachedResponse, responseType) {
        return __awaiter(this, void 0, void 0, function* () {
            switch (responseType) {
                case 'blob':
                    return yield cachedResponse.clone().blob();
                case 'arraybuffer':
                    return yield cachedResponse.clone().arrayBuffer();
                case 'text':
                    return yield cachedResponse.clone().text();
                case 'json':
                case undefined: // axios defaults to json https://github.com/axios/axios#request-config
                    return yield cachedResponse.clone().json();
                default:
                    throw new Error('Unsupported response type: ' + responseType);
            }
        });
    }
    deserializeHeaders(headers) {
        return __awaiter(this, void 0, void 0, function* () {
            const newHeaders = {};
            for (let key of headers.keys()) {
                newHeaders[key] = headers.get(key);
            }
            return newHeaders;
        });
    }
}
function invalidateCaches(optionalTargets) {
    return __awaiter(this, void 0, void 0, function* () {
        const targets = optionalTargets || SUPPORTED_TARGETS;
        for (const target of targets) {
            if (!(yield doesTargetExist(target))) {
                continue;
            }
            switch (target) {
                case exports.CacheTarget.CACHE_API:
                    yield new CacheApi().invalidate();
                case exports.CacheTarget.MEMORY:
                    yield new MemoryCache().invalidate();
                default:
                    break;
            }
        }
    });
}

const CACHE_CONFIG_30MIN = { expiresIn: 1800 };
const CACHE_CONFIG_NOCACHE = { expiresIn: 0 };
const CACHE_CONFIG_30MIN_MEMORY = {
    targets: [exports.CacheTarget.MEMORY],
    expiresIn: CACHE_CONFIG_30MIN.expiresIn,
};
const EXPIRY_HEADER_KEY = 'cache_expires';
const CLEAR_CACHE_INTERVAL = 60 * 1000;
// Even though we have caching enabled, if we fire 10 (equal) requests in parallel, they will
// still all be executed - because by the time first response is saved in cache, the other 9
// requests are already made too. To combat this, we save cacheKeys of ongoing requests and
// simply delay new requests with the same cacheKey.
const cacheableRequestsInProgress = new Set();
const removeCacheableRequestsInProgress = (cacheKey) => {
    cacheableRequestsInProgress.delete(cacheKey);
};
const fetchCachedResponse = (request) => __awaiter(void 0, void 0, void 0, function* () {
    if (!isRequestCachable(request)) {
        return request;
    }
    const cacheKey = generateCacheKey(request);
    // resource not cacheable? It couldn't have been saved to cache:
    if (cacheKey === null) {
        return request;
    }
    // When request is cancelled, it must also be removed from list of cacheableRequestsInProgress.
    // In order to remove requests from cacheableRequestsInProgress, cancelToken must be aware of requests(cacheKeys) it is responsible for.
    if (request.cancelToken && request.setCancelTokenCacheKey) {
        request.setCancelTokenCacheKey(cacheKey);
    }
    // there is a request with the same cacheKey in progress - wait until it
    // finishes (we might be able to use its response from cache)
    while (cacheableRequestsInProgress.has(cacheKey)) {
        yield sleep(100);
    }
    // it is important that we block any possible parallel requests before we execute
    // our first await, otherwise other requests will step in before we can stop them:
    cacheableRequestsInProgress.add(cacheKey);
    try {
        const shCache = yield cacheFactory(request.cache.targets);
        if (!shCache) {
            return request;
        }
        const cachedResponse = yield shCache.get(cacheKey, request.responseType);
        if (!cachedResponse || !cacheStillValid(cachedResponse.headers)) {
            request.cacheKey = cacheKey;
            return request;
        }
        // serve from cache:
        request.adapter = () => __awaiter(void 0, void 0, void 0, function* () {
            return Promise.resolve({
                data: cachedResponse.data,
                headers: request.headers,
                request: request,
                config: request,
                responseType: request.responseType,
            });
        });
        return request;
    }
    finally {
        // if we have blocked other requests by mistake (we will not be creating a new cache
        // entry from this request), we should fix this now:
        if (!request.cacheKey) {
            removeCacheableRequestsInProgress(cacheKey);
        }
    }
});
const saveCacheResponse = (response) => __awaiter(void 0, void 0, void 0, function* () {
    // not using cache?
    if (!isRequestCachable(response.config)) {
        return response;
    }
    // resource not cacheable?
    if (!response.config.cacheKey) {
        return response;
    }
    try {
        const shCache = yield cacheFactory(response.config.cache.targets);
        if (!shCache) {
            return response;
        }
        if ((yield shCache.has(response.config.cacheKey)) &&
            cacheStillValid(yield shCache.getHeaders(response.config.cacheKey))) {
            return response;
        }
        // before saving response, set an artificial header that tells when it should expire:
        const expiresMs = new Date().getTime() + response.config.cache.expiresIn * 1000;
        response.headers = Object.assign(Object.assign({}, response.headers), { [EXPIRY_HEADER_KEY]: expiresMs });
        shCache.set(response.config.cacheKey, response);
        return response;
    }
    finally {
        // if response.config.cacheKey was there, we *must* remove it from the list
        // of requests in progress, otherwise all other requests with the same cacheKey
        // will wait indefinitely:
        removeCacheableRequestsInProgress(response.config.cacheKey);
    }
});
const cacheStillValid = (headers) => {
    if (!headers) {
        return true;
    }
    const now = new Date();
    const expirationDate = Number(headers[EXPIRY_HEADER_KEY]);
    return expirationDate > now.getTime();
};
const generateCacheKey = (request) => {
    switch (request.method) {
        // post requests are not supported, so we mimic a get request, by formatting the body/params to sha256, and constructing a key/url
        // idea taken from https://blog.cloudflare.com/introducing-the-workers-cache-api-giving-you-control-over-how-your-content-is-cached/
        case 'post':
            // don't serialize strings or already serialized objects as this will result in escaping some chars and different hash
            const body = typeof request.data === 'string' ? request.data : JSON.stringify(request.data);
            const hash = stringToHash(body);
            return `${request.url}?${hash}`;
        case 'get':
            return `${request.url}?${queryString.stringify(request.params)}`;
        default:
            return null;
    }
};
//https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript
const stringToHash = (message) => {
    let hash = 0;
    for (let i = 0; i < message.length; i++) {
        let chr = message.charCodeAt(i);
        hash = (hash << 5) - hash + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
};
const deleteExpiredCachedItemsAtInterval = () => {
    // delete expired items on initialization
    findAndDeleteExpiredCachedItems();
    setInterval(() => {
        findAndDeleteExpiredCachedItems();
    }, CLEAR_CACHE_INTERVAL);
};
const findAndDeleteExpiredCachedItems = () => __awaiter(void 0, void 0, void 0, function* () {
    for (const target of SUPPORTED_TARGETS) {
        const shCache = yield cacheFactory([target]);
        if (!shCache) {
            continue;
        }
        const cacheKeys = yield shCache.keys();
        cacheKeys.forEach((key) => __awaiter(void 0, void 0, void 0, function* () {
            const headers = yield shCache.getHeaders(key);
            if (!cacheStillValid(headers)) {
                yield shCache.delete(key);
            }
        }));
    }
});
const isRequestCachable = (request) => {
    if (!(request && request.cache && request.cache.expiresIn)) {
        return false;
    }
    // cache can be disabled with expiresIn: 0;
    if (request.cache.expiresIn === 0) {
        return false;
    }
    return true;
};
const sleep = (sleepTimeMs) => __awaiter(void 0, void 0, void 0, function* () {
    yield new Promise(resolve => {
        setTimeout(resolve, sleepTimeMs);
    });
});

let defaultRequestsConfig = {};
const setDefaultRequestsConfig = (reqConfig) => {
    defaultRequestsConfig = reqConfig;
};
const getDefaultRequestsConfig = () => {
    return defaultRequestsConfig;
};

class CancelToken {
    constructor() {
        this.token = null;
        this.source = null;
        //list of all request that can be cancelled by token instance
        this.cacheKeys = new Set();
        this.source = axios.CancelToken.source();
        this.token = this.source.token;
    }
    setCancelTokenCacheKey(cacheKey) {
        this.cacheKeys.add(cacheKey);
    }
    cancel() {
        if (this.cacheKeys.size > 0) {
            for (let cacheKey of this.cacheKeys) {
                removeCacheableRequestsInProgress(cacheKey);
            }
            this.cacheKeys.clear();
        }
        this.source.cancel();
    }
    getToken() {
        return this.token;
    }
}
const isCancelled = (err) => {
    return axios.isCancel(err);
};
const getAxiosReqParams = (reqConfig, defaultCache) => {
    let axiosReqConfig = {
        cache: defaultCache,
    };
    const reqConfigWithDefault = Object.assign(Object.assign({}, getDefaultRequestsConfig()), reqConfig);
    if (reqConfigWithDefault.cancelToken) {
        axiosReqConfig.setCancelTokenCacheKey = (cacheKey) => reqConfigWithDefault.cancelToken.setCancelTokenCacheKey(cacheKey);
        axiosReqConfig.cancelToken = reqConfigWithDefault.cancelToken.getToken();
    }
    if (reqConfigWithDefault.retries !== null && reqConfigWithDefault.retries !== undefined) {
        axiosReqConfig.retries = reqConfigWithDefault.retries;
    }
    if (reqConfigWithDefault.cache) {
        axiosReqConfig.cache = reqConfigWithDefault.cache;
    }
    if (reqConfigWithDefault.rewriteUrlFunc) {
        axiosReqConfig.rewriteUrlFunc = reqConfigWithDefault.rewriteUrlFunc;
    }
    if (reqConfigWithDefault.responseType) {
        axiosReqConfig.responseType = reqConfigWithDefault.responseType;
    }
    return axiosReqConfig;
};

function createGetCapabilitiesXmlUrl(baseUrl, ogcServiceType) {
    const defaultQueryParams = {
        service: ogcServiceType,
        request: 'GetCapabilities',
        format: 'text/xml',
    };
    const { url, query } = queryString.parseUrl(baseUrl);
    return queryString.stringifyUrl({ url: url, query: Object.assign(Object.assign({}, defaultQueryParams), query) }, { sort: false });
}
function fetchGetCapabilitiesXml(baseUrl, ogcServiceType, reqConfig) {
    return __awaiter(this, void 0, void 0, function* () {
        const axiosReqConfig = Object.assign({ responseType: 'text' }, getAxiosReqParams(reqConfig, CACHE_CONFIG_30MIN));
        const url = createGetCapabilitiesXmlUrl(baseUrl, ogcServiceType);
        const res = yield axios.get(url, axiosReqConfig);
        const parsedXml = yield xml2js.parseStringPromise(res.data);
        return parsedXml;
    });
}
function _flattenLayers(layers, result = []) {
    layers.forEach(l => {
        result.push(l);
        if (l.Layer) {
            _flattenLayers(l.Layer, result);
        }
    });
    return result;
}
function fetchLayersFromGetCapabilitiesXml(baseUrl, ogcServiceType, reqConfig) {
    return __awaiter(this, void 0, void 0, function* () {
        const parsedXml = (yield fetchGetCapabilitiesXml(baseUrl, ogcServiceType, reqConfig));
        // GetCapabilities might use recursion to group layers, we should flatten them and remove those with no `Name`:
        const layersInfos = _flattenLayers(parsedXml.WMS_Capabilities.Capability[0].Layer).filter(layerInfo => layerInfo.Name);
        return layersInfos;
    });
}
function fetchGetCapabilitiesJson(baseUrl, reqConfig) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            request: 'GetCapabilities',
            format: 'application/json',
        };
        const queryString$$1 = queryString.stringify(query, { sort: false });
        const url = `${baseUrl}?${queryString$$1}`;
        const axiosReqConfig = Object.assign({ responseType: 'json' }, getAxiosReqParams(reqConfig, CACHE_CONFIG_30MIN));
        const res = yield axios.get(url, axiosReqConfig);
        return res.data.layers;
    });
}
function fetchGetCapabilitiesJsonV1(baseUrl, reqConfig) {
    return __awaiter(this, void 0, void 0, function* () {
        const instanceId = parseSHInstanceId(baseUrl);
        const url = `https://eocloud.sentinel-hub.com/v1/config/instance/instance.${instanceId}?scope=ALL`;
        const axiosReqConfig = Object.assign({ responseType: 'json' }, getAxiosReqParams(reqConfig, CACHE_CONFIG_30MIN));
        const res = yield axios.get(url, axiosReqConfig);
        return res.data.layers;
    });
}
function parseSHInstanceId(baseUrl) {
    const INSTANCE_ID_LENGTH = 36;
    // AWS:
    for (let hostname of SH_SERVICE_HOSTNAMES_V3) {
        const prefix = `${hostname}ogc/wms/`;
        if (!baseUrl.startsWith(prefix)) {
            continue;
        }
        const instanceId = baseUrl.substr(prefix.length, INSTANCE_ID_LENGTH);
        return instanceId;
    }
    // EOCloud:
    for (let hostname of SH_SERVICE_HOSTNAMES_V1_OR_V2) {
        const prefix = `${hostname}v1/wms/`;
        if (!baseUrl.startsWith(prefix)) {
            continue;
        }
        const instanceId = baseUrl.substr(prefix.length, INSTANCE_ID_LENGTH);
        return instanceId;
    }
    throw new Error(`Could not parse instanceId from URL: ${baseUrl}`);
}
function fetchLayerParamsFromConfigurationService(instanceId, reqConfig) {
    return __awaiter(this, void 0, void 0, function* () {
        const authToken = reqConfig && reqConfig.authToken ? reqConfig.authToken : getAuthToken();
        if (!authToken) {
            throw new Error('Must be authenticated to fetch layer params');
        }
        // Note that for SH v3 service, the endpoint for fetching the list of layers is always
        // https://services.sentinel-hub.com/, even for creodias datasets:
        const url = `https://services.sentinel-hub.com/configuration/v1/wms/instances/${instanceId}/layers`;
        const headers = {
            Authorization: `Bearer ${authToken}`,
        };
        // reqConfig might include the cache config from getMap, which could cache instances/${this.instanceId}/layers
        // we do not want this as layer updates will not invalidate this cache, so we rather cache to memory
        const reqConfigWithMemoryCache = Object.assign(Object.assign({}, reqConfig), { 
            // Do not override cache if cache is disabled with `expiresIn: 0`
            cache: reqConfig && reqConfig.cache && reqConfig.cache.expiresIn === 0
                ? reqConfig.cache
                : CACHE_CONFIG_30MIN_MEMORY });
        const requestConfig = Object.assign({ responseType: 'json', headers: headers }, getAxiosReqParams(reqConfigWithMemoryCache, null));
        const res = yield axios.get(url, requestConfig);
        const layersParams = res.data.map((l) => {
            var _a;
            return (Object.assign(Object.assign(Object.assign({ layerId: l.id, title: l.title, description: l.description }, l.datasourceDefaults), (((_a = l.datasourceDefaults) === null || _a === void 0 ? void 0 : _a.maxCloudCoverage) !== undefined && {
                maxCloudCoverPercent: l.datasourceDefaults.maxCloudCoverage,
            })), { evalscript: l.styles[0].evalScript, dataProduct: l.styles[0].dataProduct ? l.styles[0].dataProduct['@id'] : undefined, legend: l.styles.find((s) => s.name === l.defaultStyleName)
                    ? l.styles.find((s) => s.name === l.defaultStyleName).legend
                    : null }));
        });
        return layersParams;
    });
}

// a wrapper function that ensures network requests triggered by the inner function get cancelled after the specified timeout
// the wrapper function will receive a single argument - a RequestConfiguration object that should be used to trigger all axios network requests
const ensureTimeout = (innerFunction, reqConfig) => __awaiter(void 0, void 0, void 0, function* () {
    if (!reqConfig || !reqConfig.timeout) {
        // if timeout was not specified, call the passed function with the original config
        return yield innerFunction(reqConfig);
    }
    const innerReqConfig = Object.assign(Object.assign({}, reqConfig), { cancelToken: reqConfig.cancelToken ? reqConfig.cancelToken : new CancelToken(), 
        // delete the timeout in case innerFunction has a nested ensureTimeout in order to prevent unnecessary setTimeout calls
        timeout: undefined });
    const timer = setTimeout(() => {
        innerReqConfig.cancelToken.cancel();
    }, reqConfig.timeout);
    try {
        const resolvedValue = yield innerFunction(innerReqConfig);
        clearTimeout(timer);
        return resolvedValue;
    }
    catch (e) {
        clearTimeout(timer);
        throw e;
    }
});

const DATASET_AWSEU_S1GRD = {
    id: 'AWSEU_S1GRD',
    shJsonGetCapabilitiesDataset: 'S1GRD',
    shWmsEvalsource: 'S1GRD',
    shProcessingApiDatasourceAbbreviation: 'S1GRD',
    datasetParametersType: 'S1GRD',
    shServiceHostname: 'https://services.sentinel-hub.com/',
    searchIndexUrl: 'https://services.sentinel-hub.com/index/v3/collections/S1GRD/searchIndex',
    findDatesUTCUrl: 'https://services.sentinel-hub.com/index/v3/collections/S1GRD/findAvailableData',
    orbitTimeMinutes: 49.3,
    minDate: new Date(Date.UTC(2014, 10 - 1, 3, 0, 47, 14)),
    maxDate: null,
    catalogCollectionId: 'sentinel-1-grd',
};
const DATASET_EOCLOUD_S1GRD = {
    id: 'EOC_S1GRD_IW',
    shJsonGetCapabilitiesDataset: null,
    shWmsEvalsource: null,
    shProcessingApiDatasourceAbbreviation: null,
    datasetParametersType: 'S1GRD',
    shServiceHostname: 'https://eocloud.sentinel-hub.com/',
    searchIndexUrl: 'https://eocloud.sentinel-hub.com/index/s1/v1/search',
    findDatesUTCUrl: 'https://eocloud.sentinel-hub.com/index/s1/v1/finddates',
    orbitTimeMinutes: 49.3,
    minDate: new Date(Date.UTC(2014, 10 - 1, 3, 0, 37, 40)),
    maxDate: null,
};
const DATASET_CDAS_S1GRD = {
    id: 'CDAS_S1GRD',
    shJsonGetCapabilitiesDataset: 'S1GRD',
    shWmsEvalsource: 'S1GRD',
    shProcessingApiDatasourceAbbreviation: 'S1GRD',
    datasetParametersType: 'S1GRD',
    shServiceHostname: 'https://creodias.sentinel-hub.com/',
    searchIndexUrl: 'https://creodias.sentinel-hub.com/index/v3/collections/S1GRD/searchIndex',
    findDatesUTCUrl: 'https://creodias.sentinel-hub.com/index/v3/collections/S1GRD/findAvailableData',
    orbitTimeMinutes: 49.3,
    minDate: new Date(Date.UTC(2022, 11 - 1, 1, 0, 0, 0)),
    maxDate: null,
};
const DATASET_S2L2A = {
    id: 'AWS_S2L2A',
    shJsonGetCapabilitiesDataset: 'S2L2A',
    shWmsEvalsource: 'S2L2A',
    shProcessingApiDatasourceAbbreviation: 'S2L2A',
    datasetParametersType: 'S2',
    shServiceHostname: 'https://services.sentinel-hub.com/',
    searchIndexUrl: 'https://services.sentinel-hub.com/index/v3/collections/S2L2A/searchIndex',
    findDatesUTCUrl: 'https://services.sentinel-hub.com/index/v3/collections/S2L2A/findAvailableData',
    orbitTimeMinutes: 50.3,
    minDate: new Date(Date.UTC(2016, 10 - 1, 20, 8, 9, 58)),
    maxDate: null,
    catalogCollectionId: 'sentinel-2-l2a',
};
const DATASET_S2L1C = {
    id: 'AWS_S2L1C',
    shJsonGetCapabilitiesDataset: 'S2L1C',
    shWmsEvalsource: 'S2',
    shProcessingApiDatasourceAbbreviation: 'S2L1C',
    datasetParametersType: 'S2',
    shServiceHostname: 'https://services.sentinel-hub.com/',
    searchIndexUrl: 'https://services.sentinel-hub.com/index/v3/collections/S2L1C/searchIndex',
    findDatesUTCUrl: 'https://services.sentinel-hub.com/index/v3/collections/S2L1C/findAvailableData',
    orbitTimeMinutes: 50.3,
    minDate: new Date(Date.UTC(2015, 6 - 1, 27, 10, 25, 31)),
    maxDate: null,
    catalogCollectionId: 'sentinel-2-l1c',
};
const DATASET_CDAS_S2L2A = {
    id: 'CDAS_S2L2A',
    shJsonGetCapabilitiesDataset: 'S2L2A',
    shWmsEvalsource: 'S2L2A',
    shProcessingApiDatasourceAbbreviation: 'S2L2A',
    datasetParametersType: 'S2',
    shServiceHostname: 'https://services.cdasstage.sentinel-hub.com/',
    searchIndexUrl: 'https://services.cdasstage.sentinel-hub.com/index/v3/collections/S2L2A/searchIndex',
    findDatesUTCUrl: 'https://services.cdasstage.sentinel-hub.com/index/v3/collections/S2L2A/findAvailableData',
    orbitTimeMinutes: 50.3,
    minDate: new Date(Date.UTC(2016, 10 - 1, 20, 8, 9, 58)),
    maxDate: null,
    catalogCollectionId: 'sentinel-2-l2a',
};
const DATASET_CDAS_S2L1C = {
    id: 'CDAS_S2L1C',
    shJsonGetCapabilitiesDataset: 'S2L1C',
    shWmsEvalsource: 'S2',
    shProcessingApiDatasourceAbbreviation: 'S2L1C',
    datasetParametersType: 'S2',
    shServiceHostname: 'https://services.cdasstage.sentinel-hub.com/',
    searchIndexUrl: 'https://services.cdasstage.sentinel-hub.com/index/v3/collections/S2L1C/searchIndex',
    findDatesUTCUrl: 'https://services.cdasstage.sentinel-hub.com/index/v3/collections/S2L1C/findAvailableData',
    orbitTimeMinutes: 50.3,
    minDate: new Date(Date.UTC(2015, 6 - 1, 27, 10, 25, 31)),
    maxDate: null,
    catalogCollectionId: 'sentinel-2-l1c',
};
const DATASET_S3SLSTR = {
    id: 'CRE_S3SLSTR',
    shJsonGetCapabilitiesDataset: 'S3SLSTR',
    shWmsEvalsource: 'S3SLSTR',
    shProcessingApiDatasourceAbbreviation: 'S3SLSTR',
    datasetParametersType: 'S3SLSTR',
    shServiceHostname: 'https://creodias.sentinel-hub.com/',
    searchIndexUrl: 'https://creodias.sentinel-hub.com/index/v3/collections/S3SLSTR/searchIndex',
    findDatesUTCUrl: 'https://creodias.sentinel-hub.com/index/v3/collections/S3SLSTR/findAvailableData',
    orbitTimeMinutes: 50.495,
    minDate: new Date(Date.UTC(2016, 4 - 1, 19, 0, 46, 32)),
    maxDate: null,
    catalogCollectionId: 'sentinel-3-slstr',
};
const DATASET_S3OLCI = {
    id: 'CRE_S3OLCI',
    shJsonGetCapabilitiesDataset: 'S3OLCI',
    shWmsEvalsource: 'S3OLCI',
    shProcessingApiDatasourceAbbreviation: 'S3OLCI',
    datasetParametersType: 'S3',
    shServiceHostname: 'https://creodias.sentinel-hub.com/',
    searchIndexUrl: 'https://creodias.sentinel-hub.com/index/v3/collections/S3OLCI/searchIndex',
    findDatesUTCUrl: 'https://creodias.sentinel-hub.com/index/v3/collections/S3OLCI/findAvailableData',
    orbitTimeMinutes: 50.495,
    minDate: new Date(Date.UTC(2016, 4 - 1, 25, 11, 33, 14)),
    maxDate: null,
    catalogCollectionId: 'sentinel-3-olci',
};
const DATASET_S5PL2 = {
    id: 'CRE_S5PL2',
    shJsonGetCapabilitiesDataset: 'S5PL2',
    shWmsEvalsource: 'S5P_L2',
    shProcessingApiDatasourceAbbreviation: 'S5PL2',
    datasetParametersType: 'S5PL2',
    shServiceHostname: 'https://creodias.sentinel-hub.com/',
    searchIndexUrl: 'https://creodias.sentinel-hub.com/index/v3/collections/S5PL2/searchIndex',
    findDatesUTCUrl: 'https://creodias.sentinel-hub.com/index/v3/collections/S5PL2/findAvailableData',
    orbitTimeMinutes: 101,
    minDate: new Date(Date.UTC(2018, 4 - 1, 30, 0, 18, 51)),
    maxDate: null,
    catalogCollectionId: 'sentinel-5p-l2',
};
const DATASET_AWS_L8L1C = {
    id: 'AWS_L8L1C',
    shJsonGetCapabilitiesDataset: 'L8L1C',
    shWmsEvalsource: 'L8',
    shProcessingApiDatasourceAbbreviation: 'L8L1C',
    datasetParametersType: null,
    shServiceHostname: 'https://services-uswest2.sentinel-hub.com/',
    searchIndexUrl: 'https://services-uswest2.sentinel-hub.com/index/v3/collections/L8L1C/searchIndex',
    findDatesUTCUrl: 'https://services-uswest2.sentinel-hub.com/index/v3/collections/L8L1C/findAvailableData',
    orbitTimeMinutes: 99,
    minDate: new Date(Date.UTC(2013, 3 - 1, 18, 15, 59, 2)),
    maxDate: null,
    catalogCollectionId: 'landsat-8-l1c',
};
const DATASET_AWS_LOTL1 = {
    id: 'AWS_LOTL1',
    shJsonGetCapabilitiesDataset: 'LOTL1',
    shWmsEvalsource: 'L8',
    shProcessingApiDatasourceAbbreviation: 'LOTL1',
    datasetParametersType: null,
    shServiceHostname: 'https://services-uswest2.sentinel-hub.com/',
    searchIndexUrl: 'https://services-uswest2.sentinel-hub.com/index/v3/collections/LOTL1/searchIndex',
    findDatesUTCUrl: 'https://services-uswest2.sentinel-hub.com/index/v3/collections/LOTL1/findAvailableData',
    orbitTimeMinutes: 99,
    minDate: new Date(Date.UTC(2013, 3 - 1, 18, 15, 58, 14)),
    maxDate: null,
    catalogCollectionId: 'landsat-ot-l1',
};
const DATASET_AWS_LOTL2 = {
    id: 'AWS_LOTL2',
    shJsonGetCapabilitiesDataset: 'LOTL2',
    shWmsEvalsource: 'L8',
    shProcessingApiDatasourceAbbreviation: 'LOTL2',
    datasetParametersType: null,
    shServiceHostname: 'https://services-uswest2.sentinel-hub.com/',
    searchIndexUrl: 'https://services-uswest2.sentinel-hub.com/index/v3/collections/LOTL2/searchIndex',
    findDatesUTCUrl: 'https://services-uswest2.sentinel-hub.com/index/v3/collections/LOTL2/findAvailableData',
    orbitTimeMinutes: 99,
    minDate: new Date(Date.UTC(2013, 3 - 1, 18, 15, 58, 14)),
    maxDate: null,
    catalogCollectionId: 'landsat-ot-l2',
};
const DATASET_AWS_LTML1 = {
    id: 'AWS_LTML1',
    shJsonGetCapabilitiesDataset: 'LTML1',
    shWmsEvalsource: 'LTML1',
    shProcessingApiDatasourceAbbreviation: 'LTML1',
    datasetParametersType: null,
    shServiceHostname: 'https://services-uswest2.sentinel-hub.com/',
    searchIndexUrl: 'https://services-uswest2.sentinel-hub.com/index/v3/collections/LTML1/searchIndex',
    findDatesUTCUrl: 'https://services-uswest2.sentinel-hub.com/index/v3/collections/LTML1/findAvailableData',
    orbitTimeMinutes: 99,
    minDate: new Date(Date.UTC(1982, 8 - 1, 22, 14, 18, 20)),
    maxDate: new Date(Date.UTC(2012, 5 - 1, 5, 17, 54, 6)),
    catalogCollectionId: 'landsat-tm-l1',
};
const DATASET_AWS_LTML2 = {
    id: 'AWS_LTML2',
    shJsonGetCapabilitiesDataset: 'LTML2',
    shWmsEvalsource: 'LTML2',
    shProcessingApiDatasourceAbbreviation: 'LTML2',
    datasetParametersType: null,
    shServiceHostname: 'https://services-uswest2.sentinel-hub.com/',
    searchIndexUrl: 'https://services-uswest2.sentinel-hub.com/index/v3/collections/LTML2/searchIndex',
    findDatesUTCUrl: 'https://services-uswest2.sentinel-hub.com/index/v3/collections/LTML2/findAvailableData',
    orbitTimeMinutes: 99,
    minDate: new Date(Date.UTC(1982, 8 - 1, 22, 14, 18, 20)),
    maxDate: new Date(Date.UTC(2012, 5 - 1, 5, 17, 54, 6)),
    catalogCollectionId: 'landsat-tm-l2',
};
const DATASET_AWS_LMSSL1 = {
    id: 'AWS_LMSSL1',
    shJsonGetCapabilitiesDataset: 'LMSSL1',
    shWmsEvalsource: 'LMSSL1',
    shProcessingApiDatasourceAbbreviation: 'LMSSL1',
    datasetParametersType: null,
    shServiceHostname: 'https://services-uswest2.sentinel-hub.com/',
    searchIndexUrl: 'https://services-uswest2.sentinel-hub.com/index/v3/collections/LMSSL1/searchIndex',
    findDatesUTCUrl: 'https://services-uswest2.sentinel-hub.com/index/v3/collections/LMSSL1/findAvailableData',
    orbitTimeMinutes: 99,
    minDate: new Date(Date.UTC(1972, 7 - 1, 1, 0, 0, 0)),
    maxDate: new Date(Date.UTC(2013, 1 - 1, 31, 23, 59, 59)),
    catalogCollectionId: 'landsat-mss-l1',
};
const DATASET_AWS_LETML1 = {
    id: 'AWS_LETML1',
    shJsonGetCapabilitiesDataset: 'LETML1',
    shWmsEvalsource: 'LETML1',
    shProcessingApiDatasourceAbbreviation: 'LETML1',
    datasetParametersType: null,
    shServiceHostname: 'https://services-uswest2.sentinel-hub.com/',
    searchIndexUrl: 'https://services-uswest2.sentinel-hub.com/index/v3/collections/LETML1/searchIndex',
    findDatesUTCUrl: 'https://services-uswest2.sentinel-hub.com/index/v3/collections/LETML1/findAvailableData',
    orbitTimeMinutes: 99,
    minDate: new Date(Date.UTC(1999, 4 - 1, 1, 0, 0, 0)),
    maxDate: null,
    catalogCollectionId: 'landsat-etm-l1',
};
const DATASET_AWS_LETML2 = {
    id: 'AWS_LETML2',
    shJsonGetCapabilitiesDataset: 'LETML2',
    shWmsEvalsource: 'LETML2',
    shProcessingApiDatasourceAbbreviation: 'LETML2',
    datasetParametersType: null,
    shServiceHostname: 'https://services-uswest2.sentinel-hub.com/',
    searchIndexUrl: 'https://services-uswest2.sentinel-hub.com/index/v3/collections/LETML2/searchIndex',
    findDatesUTCUrl: 'https://services-uswest2.sentinel-hub.com/index/v3/collections/LETML2/findAvailableData',
    orbitTimeMinutes: 99,
    minDate: new Date(Date.UTC(1999, 4 - 1, 1, 0, 0, 0)),
    maxDate: null,
    catalogCollectionId: 'landsat-etm-l2',
};
const DATASET_EOCLOUD_LANDSAT5 = {
    id: 'EOC_L5',
    shJsonGetCapabilitiesDataset: null,
    shWmsEvalsource: 'L5',
    shProcessingApiDatasourceAbbreviation: null,
    datasetParametersType: null,
    shServiceHostname: 'https://eocloud.sentinel-hub.com/',
    searchIndexUrl: 'https://eocloud.sentinel-hub.com/index/landsat5/v2/search',
    findDatesUTCUrl: 'https://eocloud.sentinel-hub.com/index/landsat5/v2/dates',
    orbitTimeMinutes: 99,
    minDate: new Date(Date.UTC(1984, 4 - 1, 6, 7, 45, 13)),
    maxDate: new Date(Date.UTC(2011, 11 - 1, 16, 10, 2, 33)),
};
const DATASET_EOCLOUD_LANDSAT7 = {
    id: 'EOC_L7',
    shJsonGetCapabilitiesDataset: null,
    shWmsEvalsource: 'L7',
    shProcessingApiDatasourceAbbreviation: null,
    datasetParametersType: null,
    shServiceHostname: 'https://eocloud.sentinel-hub.com/',
    searchIndexUrl: 'https://eocloud.sentinel-hub.com/index/landsat7/v2/search',
    findDatesUTCUrl: 'https://eocloud.sentinel-hub.com/index/landsat7/v2/dates',
    orbitTimeMinutes: 99,
    minDate: new Date(Date.UTC(1999, 7 - 1, 3, 19, 16, 17)),
    maxDate: new Date(Date.UTC(2017, 1 - 1, 15, 23, 49, 15)),
};
const DATASET_EOCLOUD_LANDSAT8 = {
    id: 'EOC_L8',
    shJsonGetCapabilitiesDataset: null,
    shWmsEvalsource: 'L8',
    shProcessingApiDatasourceAbbreviation: null,
    datasetParametersType: null,
    shServiceHostname: 'https://eocloud.sentinel-hub.com/',
    searchIndexUrl: 'https://eocloud.sentinel-hub.com/index/landsat8/v2/search',
    findDatesUTCUrl: 'https://eocloud.sentinel-hub.com/index/landsat8/v2/dates',
    orbitTimeMinutes: 99,
    minDate: new Date(Date.UTC(2013, 3 - 1, 24, 0, 25, 55)),
    maxDate: null,
};
const DATASET_AWS_HLS = {
    id: 'AWS_HLS',
    shJsonGetCapabilitiesDataset: 'HLS',
    shWmsEvalsource: 'HLS',
    shProcessingApiDatasourceAbbreviation: 'HLS',
    datasetParametersType: 'HLS',
    shServiceHostname: 'https://services-uswest2.sentinel-hub.com/',
    searchIndexUrl: 'https://services-uswest2.sentinel-hub.com/index/v3/collections/HLS/searchIndex',
    findDatesUTCUrl: 'https://services-uswest2.sentinel-hub.com/index/v3/collections/HLS/findAvailableData',
    orbitTimeMinutes: 99,
    minDate: new Date(Date.UTC(2013, 4 - 1, 1, 0, 25, 55)),
    maxDate: null,
    catalogCollectionId: 'hls',
};
const DATASET_EOCLOUD_ENVISAT_MERIS = {
    id: 'EOC_ENVISAT_MERIS',
    shJsonGetCapabilitiesDataset: null,
    shWmsEvalsource: 'ENV',
    shProcessingApiDatasourceAbbreviation: null,
    datasetParametersType: null,
    shServiceHostname: 'https://eocloud.sentinel-hub.com/',
    searchIndexUrl: 'https://eocloud.sentinel-hub.com/index/envisat/v1/search',
    findDatesUTCUrl: 'https://eocloud.sentinel-hub.com/index/envisat/v1/finddates',
    orbitTimeMinutes: 100.16,
    minDate: new Date(Date.UTC(2002, 5 - 1, 17, 14, 0, 27)),
    maxDate: new Date(Date.UTC(2012, 4 - 1, 8, 10, 58, 58)),
};
const DATASET_MODIS = {
    id: 'AWS_MODIS',
    shJsonGetCapabilitiesDataset: 'MODIS',
    shWmsEvalsource: 'Modis',
    shProcessingApiDatasourceAbbreviation: 'MODIS',
    datasetParametersType: null,
    shServiceHostname: 'https://services-uswest2.sentinel-hub.com/',
    searchIndexUrl: 'https://services-uswest2.sentinel-hub.com/index/v3/collections/MODIS/searchIndex',
    findDatesUTCUrl: 'https://services-uswest2.sentinel-hub.com/index/v3/collections/MODIS/findAvailableData',
    orbitTimeMinutes: 99,
    minDate: new Date(Date.UTC(2000, 2 - 1, 24, 12, 0, 0)),
    maxDate: null,
    catalogCollectionId: 'modis',
};
const DATASET_AWS_DEM = {
    id: 'AWS_DEM',
    shJsonGetCapabilitiesDataset: 'DEM',
    shWmsEvalsource: 'DEM',
    shProcessingApiDatasourceAbbreviation: 'DEM',
    datasetParametersType: null,
    shServiceHostname: 'https://services.sentinel-hub.com/',
    searchIndexUrl: null,
    findDatesUTCUrl: null,
    orbitTimeMinutes: null,
    minDate: null,
    maxDate: null,
};
const DATASET_AWSUS_DEM = {
    id: 'AWSUS_DEM',
    shJsonGetCapabilitiesDataset: 'DEM',
    shWmsEvalsource: 'DEM',
    shProcessingApiDatasourceAbbreviation: 'DEM',
    datasetParametersType: null,
    shServiceHostname: 'https://services-uswest2.sentinel-hub.com/',
    searchIndexUrl: null,
    findDatesUTCUrl: null,
    orbitTimeMinutes: null,
    minDate: null,
    maxDate: null,
};
const DATASET_BYOC = {
    id: 'CUSTOM',
    shJsonGetCapabilitiesDataset: 'CUSTOM',
    shWmsEvalsource: 'CUSTOM',
    shProcessingApiDatasourceAbbreviation: 'CUSTOM',
    datasetParametersType: 'BYOC',
    shServiceHostname: null,
    searchIndexUrl: null,
    findDatesUTCUrl: null,
    orbitTimeMinutes: null,
    minDate: null,
    maxDate: null,
    catalogCollectionId: null,
};
const DATASET_PLANET_NICFI = {
    id: 'PLANET_NICFI',
    shJsonGetCapabilitiesDataset: null,
    shWmsEvalsource: null,
    shProcessingApiDatasourceAbbreviation: null,
    datasetParametersType: null,
    shServiceHostname: null,
    searchIndexUrl: null,
    findDatesUTCUrl: null,
    orbitTimeMinutes: null,
    minDate: new Date(Date.UTC(2016, 6 - 1, 31, 12, 0, 0)),
    maxDate: null,
};

var ServiceType;
(function (ServiceType) {
    ServiceType["WMS"] = "WMS";
    ServiceType["WCS"] = "WCS";
    ServiceType["WFS"] = "WFS";
})(ServiceType || (ServiceType = {}));
const OGC_SERVICES_IMPLEMENTED_VERSIONS = {
    // to simplify, we always choose the versions which will use longitude/latitude order
    // https://www.sentinel-hub.com/faq/why-result-different-when-i-am-using-wms-or-wcs-when-coordinate-system-epsg4326
    WMS: '1.1.1',
    WCS: '1.0.0',
    WFS: '1.0.0',
};
function wmsGetMapUrl(baseUrl, layers, params, evalscript = null, evalscriptUrl = null, evalsource = null, additionalParameters = {}) {
    const queryParams = Object.assign({ version: OGC_SERVICES_IMPLEMENTED_VERSIONS[ServiceType.WMS], service: ServiceType.WMS, request: 'GetMap', format: MimeTypes.JPEG, srs: CRS_EPSG4326.authId, layers: undefined, bbox: undefined, time: undefined, width: undefined, height: undefined, showlogo: undefined, transparent: undefined }, additionalParameters);
    if (layers === null) {
        throw new Error('LayerId must be provided for WMS even if only evalscript or dataProduct is used');
    }
    queryParams.layers = layers;
    if (!params.bbox) {
        throw new Error('No bbox provided');
    }
    queryParams.bbox = `${params.bbox.minX},${params.bbox.minY},${params.bbox.maxX},${params.bbox.maxY}`;
    queryParams.srs = params.bbox.crs.authId;
    if (params.format) {
        queryParams.format = params.format;
    }
    if (!params.fromTime) {
        queryParams.time = moment.utc(params.toTime).format('YYYY-MM-DDTHH:mm:ss') + 'Z';
    }
    else {
        queryParams.time = `${moment.utc(params.fromTime).format('YYYY-MM-DDTHH:mm:ss') + 'Z'}/${moment
            .utc(params.toTime)
            .format('YYYY-MM-DDTHH:mm:ss') + 'Z'}`;
    }
    if (params.width && params.height) {
        queryParams.width = params.width;
        queryParams.height = params.height;
    }
    else if (params.resx && params.resy) {
        queryParams.resx = params.resx;
        queryParams.resy = params.resy;
    }
    else {
        throw new Error('One of resx/resy or width/height must be provided');
    }
    if (evalscript || evalscriptUrl) {
        // on eo-cloud, datasource must be defined if we are using evalscript:
        if (!evalsource && baseUrl.startsWith('https://eocloud.sentinel-hub.com/')) {
            throw new Error('Dataset is not defined on this layer - are you using a correct subclass?');
        }
        queryParams.evalsource = evalsource;
    }
    if (evalscript) {
        if (typeof window !== 'undefined' && window.btoa) {
            queryParams.evalscript = btoa(evalscript);
        }
        else {
            // node.js doesn't support btoa:
            queryParams.evalscript = Buffer.from(evalscript, 'utf8').toString('base64');
        }
    }
    if (evalscriptUrl) {
        queryParams.evalscripturl = evalscriptUrl;
    }
    if (params.preview !== undefined) {
        queryParams.preview = params.preview;
    }
    if (params.geometry) {
        queryParams.geometry = WKT.convert(params.geometry);
    }
    if (params.quality) {
        queryParams.quality = params.quality;
    }
    if (params.nicename) {
        queryParams.nicename = params.nicename;
    }
    if (params.showlogo !== undefined) {
        queryParams.showlogo = params.showlogo;
    }
    if (params.bgcolor) {
        queryParams.bgcolor = params.bgcolor;
    }
    if (params.transparent !== undefined) {
        queryParams.transparent = params.transparent;
    }
    if (params.temporal) {
        queryParams.temporal = params.temporal;
    }
    const queryString$$1 = queryString.stringify(queryParams, { sort: false });
    // To avoid duplicate entries in query params, we perform a double check here, issuing
    // a warning if some unknown param should be ignored, but wasn't.
    const queryParamsKeys = Object.keys(queryParams);
    const unknownParamsKeys = Object.keys(params.unknown || {});
    const validUnknownParamsKeys = unknownParamsKeys.filter(k => !queryParamsKeys.includes(k));
    if (unknownParamsKeys.length !== validUnknownParamsKeys.length) {
        console.warn("Some of the keys are missing from the list 'IGNORE_KNOWN_PARAMS', removing them. This is a problem with a library and should be fixed, please file a bug report.", { unknownParamsKeys, validUnknownParamsKeys });
    }
    let unknownParams = {};
    for (let k of validUnknownParamsKeys) {
        unknownParams[k] = params.unknown[k];
    }
    const unknownParamsStr = unknownParams && Object.keys(unknownParams).length > 0
        ? '&' + queryString.stringify(unknownParams, { sort: false })
        : '';
    return `${baseUrl}?${queryString$$1}${unknownParamsStr}`;
}

function drawBlobOnCanvas(ctx, blob, x = 0, y = 0) {
    return __awaiter(this, void 0, void 0, function* () {
        const objectURL = URL.createObjectURL(blob);
        try {
            // wait until objectUrl is drawn on the image, so you can safely draw img on canvas:
            const imgDrawn = yield new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = reject;
                img.src = objectURL;
            });
            ctx.drawImage(imgDrawn, x, y);
        }
        finally {
            URL.revokeObjectURL(objectURL);
        }
    });
}
function canvasToBlob(canvas, mimeFormat) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield new Promise(resolve => canvas.toBlob(resolve, mimeFormat));
    });
}
function getImageProperties(originalBlob) {
    return __awaiter(this, void 0, void 0, function* () {
        let imgObjectUrl;
        const imgCanvas = document.createElement('canvas');
        try {
            const imgCtx = imgCanvas.getContext('2d');
            imgObjectUrl = URL.createObjectURL(originalBlob);
            const img = yield new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = reject;
                img.src = imgObjectUrl;
            });
            imgCanvas.width = img.width;
            imgCanvas.height = img.height;
            imgCtx.drawImage(img, 0, 0);
            const imgData = imgCtx.getImageData(0, 0, img.width, img.height).data;
            const stringToMimeType = (str) => str;
            const format = stringToMimeType(originalBlob.type);
            return { rgba: imgData, width: img.width, height: img.height, format: format };
        }
        catch (e) {
            console.error(e);
            throw new Error(e);
        }
        finally {
            imgCanvas.remove();
            if (imgObjectUrl) {
                URL.revokeObjectURL(imgObjectUrl);
            }
        }
    });
}
function getBlob(imageProperties) {
    return __awaiter(this, void 0, void 0, function* () {
        const { rgba, width, height, format } = imageProperties;
        const imgCanvas = document.createElement('canvas');
        try {
            imgCanvas.width = width;
            imgCanvas.height = height;
            const imgCtx = imgCanvas.getContext('2d');
            const newImg = new ImageData(rgba, width, height);
            imgCtx.putImageData(newImg, 0, 0);
            const blob = yield canvasToBlob(imgCanvas, format);
            return blob;
        }
        catch (e) {
            console.error(e);
            throw new Error(e);
        }
        finally {
            imgCanvas.remove();
        }
    });
}
function validateCanvasDimensions(canvas) {
    return __awaiter(this, void 0, void 0, function* () {
        // If the canvas exceeds the size limit for the browser, canvas.toBlob returns null.
        const blob = yield new Promise(resolve => canvas.toBlob(resolve));
        if (blob === null) {
            return false;
        }
        return true;
    });
}
function scaleCanvasImage(canvas, width, height) {
    return __awaiter(this, void 0, void 0, function* () {
        const newSizeCanvas = document.createElement('canvas');
        newSizeCanvas.width = width;
        newSizeCanvas.height = height;
        const newSizeCtx = newSizeCanvas.getContext('2d');
        newSizeCtx.imageSmoothingEnabled = false;
        newSizeCtx.drawImage(canvas, 0, 0, width, height);
        return newSizeCanvas;
    });
}

// from one range to another
// f(x) = c + ((d - c) / (b - a)) * (x - a)
// a = oldMin, b = oldMax; c = newMin, d = newMax
// [0,255] to [0,1]: a = 0, b = 255; c = 0, d = 1
// [0,1] to [0,255]: a = 0, b = 1; c = 0, d = 255
function transformValueToRange(x, oldMin, oldMax, newMin, newMax) {
    let newX = newMin + ((newMax - newMin) / (oldMax - oldMin)) * (x - oldMin);
    newX = Math.max(newX, newMin);
    newX = Math.min(newX, newMax);
    return newX;
}
function isEffectSet(effect) {
    return effect !== undefined && effect !== null;
}
function isAnyEffectSet(effects) {
    return Object.values(effects).some(e => isEffectSet(e));
}

function runGainEffectFunction(rgbaArray, effects) {
    // change the values according to the algorithm (gain)
    const minValue = 0.0;
    const maxValue = 1.0;
    const gain = isEffectSet(effects.gain) ? effects.gain : 1.0;
    const factor = gain / (maxValue - minValue);
    let offset = 0.0;
    offset = offset - factor * minValue;
    if (gain === 1.0) {
        return rgbaArray;
    }
    const transformValueWithGain = (x) => Math.max(0.0, x * factor + offset);
    for (let i = 0; i < rgbaArray.length; i += 4) {
        rgbaArray[i] = transformValueWithGain(rgbaArray[i]);
        rgbaArray[i + 1] = transformValueWithGain(rgbaArray[i + 1]);
        rgbaArray[i + 2] = transformValueWithGain(rgbaArray[i + 2]);
    }
    return rgbaArray;
}
function runGammaEffectFunction(rgbaArray, effects) {
    // change the values according to the algorithm (gamma)
    const gamma = isEffectSet(effects.gamma) ? effects.gamma : 1.0;
    if (gamma === 1.0) {
        return rgbaArray;
    }
    const transformValueWithGamma = (x) => Math.pow(x, gamma);
    for (let i = 0; i < rgbaArray.length; i += 4) {
        rgbaArray[i] = transformValueWithGamma(rgbaArray[i]);
        rgbaArray[i + 1] = transformValueWithGamma(rgbaArray[i + 1]);
        rgbaArray[i + 2] = transformValueWithGamma(rgbaArray[i + 2]);
    }
    return rgbaArray;
}
function runColorEffectFunction(rgbaArray, effects) {
    for (let i = 0; i < rgbaArray.length; i += 4) {
        const red = rgbaArray[i];
        const green = rgbaArray[i + 1];
        const blue = rgbaArray[i + 2];
        if (isEffectSet(effects.redRange)) {
            rgbaArray[i] = transformValueToRange(red, effects.redRange.from, effects.redRange.to, 0, 1);
        }
        if (isEffectSet(effects.greenRange)) {
            rgbaArray[i + 1] = transformValueToRange(green, effects.greenRange.from, effects.greenRange.to, 0, 1);
        }
        if (isEffectSet(effects.blueRange)) {
            rgbaArray[i + 2] = transformValueToRange(blue, effects.blueRange.from, effects.blueRange.to, 0, 1);
        }
    }
    return rgbaArray;
}
function runCustomEffectFunction(rgbaArray, effects) {
    if (!isEffectSet(effects.customEffect)) {
        return rgbaArray;
    }
    for (let i = 0; i < rgbaArray.length; i += 4) {
        const red = rgbaArray[i];
        const green = rgbaArray[i + 1];
        const blue = rgbaArray[i + 2];
        const alpha = rgbaArray[i + 3];
        const { r, g, b, a } = effects.customEffect({ r: red, g: green, b: blue, a: alpha });
        if (r === undefined || g === undefined || b === undefined || a === undefined) {
            throw new Error('Custom effect function must return an object with properties r, g, b, a.');
        }
        rgbaArray[i] = r;
        rgbaArray[i + 1] = g;
        rgbaArray[i + 2] = b;
        rgbaArray[i + 3] = a;
    }
    return rgbaArray;
}

// The algorithm works with numbers between 0 and 1, so we must:
// - change the range of the values from [0, 255] to [0, 1]
// - change the values according to the algorithms (gain; gamma; r,g,b effects; custom effect)
// - change the range of the values from [0, 1] back to [0, 255]
function runEffectFunctions(originalBlob, effects) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!isAnyEffectSet(effects)) {
            return originalBlob;
        }
        const { rgba, width, height, format } = yield getImageProperties(originalBlob);
        // change the range of the values from [0, 255] to [0, 1]
        let rgbaArray = new Array(rgba.length);
        for (let i = 0; i < rgba.length; i++) {
            rgbaArray[i] = transformValueToRange(rgba[i], 0, 255, 0, 1);
        }
        // change the values according to the algorithm (gain)
        rgbaArray = runGainEffectFunction(rgbaArray, effects);
        // change the values according to the algorithm (gamma)
        rgbaArray = runGammaEffectFunction(rgbaArray, effects);
        // change the values according to the algorithm (r,g,b effects)
        rgbaArray = runColorEffectFunction(rgbaArray, effects);
        // run custom effect function (with custom range of values)
        rgbaArray = runCustomEffectFunction(rgbaArray, effects);
        // change the range of the values from [0, 1] back to [0, 255]
        const newImgData = new Uint8ClampedArray(rgbaArray.length);
        for (let i = 0; i < rgbaArray.length; i++) {
            newImgData[i] = transformValueToRange(rgbaArray[i], 0, 1, 0, 255);
        }
        const newBlob = yield getBlob({ rgba: newImgData, width, height, format });
        return newBlob;
    });
}

class AbstractLayer {
    constructor({ title = null, description = null, legendUrl = null }) {
        this.title = null;
        this.description = null;
        this.dataset = null;
        this.legendUrl = null;
        this.title = title;
        this.description = description;
        this.legendUrl = legendUrl;
    }
    getMap(params, api, reqConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            const blob = yield ensureTimeout((innerReqConfig) => __awaiter(this, void 0, void 0, function* () {
                switch (api) {
                    case exports.ApiType.WMS:
                        if (params.outputResponseId || params.outputResponseId === '') {
                            throw new Error('outputResponseId is only available with Processing API');
                        }
                        // When API type is set to WMS, getMap() uses getMapUrl() with the same provided parameters for
                        //   getting the url of the image.
                        // getMap() changes the received image according to provided gain and gamma after it is received.
                        // An error is thrown in getMapUrl() in case gain and gamma are present, because:
                        // - we don't send gain and gamma to the services as they may not be supported there and we don't want
                        //    to deceive the users with returning the image where gain and gamma were ignored
                        // - if they are supported on the services, gain and gamma would be applied twice in getMap() if they
                        //    were sent to the services in getMapUrl()
                        // In other words, gain and gamma need to be removed from the parameters in getMap() so the
                        //   errors in getMapUrl() are not triggered.
                        const paramsWithoutEffects = Object.assign({}, params);
                        delete paramsWithoutEffects.gain;
                        delete paramsWithoutEffects.gamma;
                        delete paramsWithoutEffects.effects;
                        const url = this.getMapUrl(paramsWithoutEffects, api);
                        const requestConfig = Object.assign({ 
                            // 'blob' responseType does not work with Node.js:
                            responseType: typeof window !== 'undefined' && window.Blob ? 'blob' : 'arraybuffer' }, getAxiosReqParams(innerReqConfig, CACHE_CONFIG_30MIN));
                        const response = yield axios.get(url, requestConfig);
                        let blob = response.data;
                        // apply effects:
                        // support deprecated GetMapParams.gain and .gamma parameters
                        // but override them if they are also present in .effects
                        const effects = Object.assign({ gain: params.gain, gamma: params.gamma }, params.effects);
                        blob = yield runEffectFunctions(blob, effects);
                        return blob;
                    default:
                        const className = this.constructor.name;
                        throw new Error(`API type "${api}" not supported in ${className}`);
                }
            }), reqConfig);
            return blob;
        });
    }
    decideJpegOrPng(params, reqConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            // If using JPEG_OR_PNG format, this function changes params so that format is set to either JPEG or PNG.
            if (params.format !== MimeTypes.JPEG_OR_PNG) {
                return params;
            }
            const res = yield this.findFlyovers(params.bbox, params.fromTime, params.toTime, null, null, reqConfig, Number.POSITIVE_INFINITY);
            if (res.length === 0) {
                // no data - transparent image needed, use PNG:
                return Object.assign(Object.assign({}, params), { format: MimeTypes.PNG });
            }
            const { coveragePercent } = res[0];
            const format = coveragePercent === 100 ? MimeTypes.JPEG : MimeTypes.PNG;
            return Object.assign(Object.assign({}, params), { format: format });
        });
    }
    getHugeMap(params, api, reqConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield ensureTimeout((innerReqConfig) => __awaiter(this, void 0, void 0, function* () {
                const { width, height, bbox } = params;
                if (!width || !height) {
                    throw new Error('Method getHugeMap() requests that width and height of resulting image are specified');
                }
                if (params.format !== MimeTypes.JPEG &&
                    params.format !== MimeTypes.PNG &&
                    params.format !== MimeTypes.JPEG_OR_PNG) {
                    throw new Error('Format ' +
                        params.format +
                        ' not supported, only ' +
                        MimeTypes.PNG +
                        ' and ' +
                        MimeTypes.JPEG +
                        ' are allowed');
                }
                const LIMIT_DIM = 2500;
                if (width <= LIMIT_DIM && height <= LIMIT_DIM) {
                    return yield this.getMap(params, api, innerReqConfig);
                }
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                const isCanvasValid = yield validateCanvasDimensions(canvas);
                if (!isCanvasValid) {
                    throw new Error(`Image dimensions (${width}x${height}) exceed the canvas size limit for this browser.`);
                }
                const xSplitBy = Math.ceil(width / LIMIT_DIM);
                const chunkWidth = Math.ceil(width / xSplitBy);
                const ySplitBy = Math.ceil(height / LIMIT_DIM);
                const chunkHeight = Math.ceil(height / ySplitBy);
                const { minX: lng0, minY: lat0, maxX: lng1, maxY: lat1 } = bbox;
                const xToLng = (x) => Math.min(lng0, lng1) + (x / width) * Math.abs(lng1 - lng0);
                const yToLat = (y) => Math.max(lat0, lat1) - (y / height) * Math.abs(lat1 - lat0);
                for (let x = 0; x < width; x += chunkWidth) {
                    const xTo = Math.min(x + chunkWidth, width);
                    for (let y = 0; y < height; y += chunkHeight) {
                        const yTo = Math.min(y + chunkHeight, height);
                        const paramsChunk = Object.assign(Object.assign({}, params), { width: xTo - x, height: yTo - y, bbox: new BBox(bbox.crs, xToLng(x), yToLat(yTo), xToLng(xTo), yToLat(y)), preview: exports.PreviewMode.EXTENDED_PREVIEW });
                        const blob = yield this.getMap(paramsChunk, api, innerReqConfig);
                        yield drawBlobOnCanvas(ctx, blob, x, y);
                    }
                }
                // JPEG_OR_PNG is not a real format - use PNG instead:
                const outputFormat = (params.format === MimeTypes.JPEG_OR_PNG
                    ? MimeTypes.PNG
                    : params.format);
                return yield canvasToBlob(canvas, outputFormat);
            }), reqConfig);
        });
    }
    supportsApiType(api) {
        return api === exports.ApiType.WMS;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getMapUrl(params, api) {
        throw new Error('getMapUrl() not implemented yet');
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setEvalscript(evalscript) {
        throw new Error('Evalscript is only supported on Sentinel Hub layers');
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setEvalscriptUrl(evalscriptUrl) {
        throw new Error('EvalscriptUrl is only supported on Sentinel Hub layers');
    }
    findTilesInner(bbox, // eslint-disable-line @typescript-eslint/no-unused-vars
    fromTime, // eslint-disable-line @typescript-eslint/no-unused-vars
    toTime, // eslint-disable-line @typescript-eslint/no-unused-vars
    maxCount = null, // eslint-disable-line @typescript-eslint/no-unused-vars
    offset = null, // eslint-disable-line @typescript-eslint/no-unused-vars
    reqConfig, // eslint-disable-line @typescript-eslint/no-unused-vars
    intersects) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('findTilesInner() not implemented yet');
        });
    }
    findTiles(bbox, // eslint-disable-line @typescript-eslint/no-unused-vars
    fromTime, // eslint-disable-line @typescript-eslint/no-unused-vars
    toTime, // eslint-disable-line @typescript-eslint/no-unused-vars
    maxCount = null, // eslint-disable-line @typescript-eslint/no-unused-vars
    offset = null, // eslint-disable-line @typescript-eslint/no-unused-vars
    reqConfig, // eslint-disable-line @typescript-eslint/no-unused-vars
    intersects) {
        return __awaiter(this, void 0, void 0, function* () {
            const findTilesResponse = yield ensureTimeout((innerReqConfig) => __awaiter(this, void 0, void 0, function* () { return yield this.findTilesInner(bbox, fromTime, toTime, maxCount, offset, innerReqConfig, intersects); }), reqConfig);
            return findTilesResponse;
        });
    }
    findFlyovers(bbox, fromTime, toTime, maxFindTilesRequests = 50, tilesPerRequest = 50, reqConfig, overrideOrbitTimeMinutes = null) {
        return __awaiter(this, void 0, void 0, function* () {
            const flyOvers = yield ensureTimeout((innerReqConfig) => __awaiter(this, void 0, void 0, function* () {
                if (overrideOrbitTimeMinutes === null && (!this.dataset || !this.dataset.orbitTimeMinutes)) {
                    throw new Error('Orbit time is needed for grouping tiles into flyovers.');
                }
                if (bbox.crs !== CRS_EPSG4326) {
                    throw new Error('Currently, only EPSG:4326 in findFlyovers');
                }
                if (maxFindTilesRequests === null) {
                    maxFindTilesRequests = 50;
                }
                if (tilesPerRequest === null) {
                    tilesPerRequest = 50;
                }
                const orbitTimeS = overrideOrbitTimeMinutes === null
                    ? this.dataset.orbitTimeMinutes * 60
                    : overrideOrbitTimeMinutes * 60;
                const bboxGeometry = this.roundCoordinates([
                    [
                        [bbox.minX, bbox.minY],
                        [bbox.maxX, bbox.minY],
                        [bbox.maxX, bbox.maxY],
                        [bbox.minX, bbox.maxY],
                        [bbox.minX, bbox.minY],
                    ],
                ]);
                const bboxArea = area({
                    type: 'Polygon',
                    coordinates: bboxGeometry,
                });
                let flyovers = [];
                let flyoverIndex = 0;
                let currentFlyoverGeometry = null;
                let nTilesInFlyover;
                let sumCloudCoverPercent;
                for (let i = 0; i < maxFindTilesRequests; i++) {
                    // grab new batch of tiles:
                    const { tiles, hasMore } = yield this.findTiles(bbox, fromTime, toTime, tilesPerRequest, i * tilesPerRequest, innerReqConfig);
                    // apply each tile to the flyover to calculate coverage:
                    for (let tileIndex = 0; tileIndex < tiles.length; tileIndex++) {
                        // first tile ever? just add its info and continue:
                        if (flyovers.length === 0) {
                            flyovers[flyoverIndex] = {
                                fromTime: tiles[tileIndex].sensingTime,
                                toTime: tiles[tileIndex].sensingTime,
                                coveragePercent: 0,
                                meta: {},
                            };
                            currentFlyoverGeometry = tiles[tileIndex].geometry.coordinates;
                            sumCloudCoverPercent = tiles[tileIndex].meta.cloudCoverPercent;
                            nTilesInFlyover = 1;
                            continue;
                        }
                        // append the tile to flyovers:
                        const prevDateS = moment.utc(flyovers[flyoverIndex].fromTime).unix();
                        const currDateS = moment.utc(tiles[tileIndex].sensingTime).unix();
                        const diffS = Math.abs(prevDateS - currDateS);
                        if (diffS > orbitTimeS) {
                            // finish the old flyover:
                            try {
                                flyovers[flyoverIndex].coveragePercent = this.calculateCoveragePercent(bboxGeometry, bboxArea, currentFlyoverGeometry);
                            }
                            catch (err) {
                                // if anything goes wrong, play it safe and set coveragePercent to null:
                                flyovers[flyoverIndex].coveragePercent = null;
                            }
                            if (sumCloudCoverPercent !== undefined) {
                                flyovers[flyoverIndex].meta.averageCloudCoverPercent = sumCloudCoverPercent / nTilesInFlyover;
                            }
                            // and start a new one:
                            flyoverIndex++;
                            flyovers[flyoverIndex] = {
                                fromTime: tiles[tileIndex].sensingTime,
                                toTime: tiles[tileIndex].sensingTime,
                                coveragePercent: 0,
                                meta: {},
                            };
                            currentFlyoverGeometry = tiles[tileIndex].geometry.coordinates;
                            sumCloudCoverPercent = tiles[tileIndex].meta.cloudCoverPercent;
                            nTilesInFlyover = 1;
                        }
                        else {
                            // the same flyover:
                            flyovers[flyoverIndex].fromTime = tiles[tileIndex].sensingTime;
                            currentFlyoverGeometry = polygonClipping.union(this.roundCoordinates(currentFlyoverGeometry), this.roundCoordinates(tiles[tileIndex].geometry.coordinates));
                            sumCloudCoverPercent =
                                sumCloudCoverPercent !== undefined
                                    ? sumCloudCoverPercent + tiles[tileIndex].meta.cloudCoverPercent
                                    : undefined;
                            nTilesInFlyover++;
                        }
                    }
                    // make sure we exit when there are no more tiles:
                    if (!hasMore) {
                        break;
                    }
                    if (i + 1 === maxFindTilesRequests) {
                        throw new Error(`Could not fetch all the tiles in [${maxFindTilesRequests}] requests for [${tilesPerRequest}] tiles`);
                    }
                }
                // if needed, finish the last flyover:
                if (flyovers.length > 0) {
                    try {
                        flyovers[flyoverIndex].coveragePercent = this.calculateCoveragePercent(bboxGeometry, bboxArea, currentFlyoverGeometry);
                    }
                    catch (err) {
                        // if anything goes wrong, play it safe and set coveragePercent to null:
                        flyovers[flyoverIndex].coveragePercent = null;
                    }
                    if (sumCloudCoverPercent !== undefined) {
                        flyovers[flyoverIndex].meta.averageCloudCoverPercent = sumCloudCoverPercent / nTilesInFlyover;
                    }
                }
                return flyovers;
            }), reqConfig);
            return flyOvers;
        });
    }
    calculateCoveragePercent(bboxGeometry, bboxArea, flyoverGeometry) {
        let bboxedFlyoverGeometry;
        try {
            bboxedFlyoverGeometry = polygonClipping.intersection(this.roundCoordinates(bboxGeometry), this.roundCoordinates(flyoverGeometry));
        }
        catch (ex) {
            console.error({ msg: 'intersection() failed', ex, bboxGeometry, flyoverGeometry });
            throw ex;
        }
        try {
            const coveredArea = area({
                type: 'MultiPolygon',
                coordinates: bboxedFlyoverGeometry,
            });
            return (coveredArea / bboxArea) * 100;
        }
        catch (ex) {
            console.error({ msg: 'Turf.js area() division failed', ex, bboxedFlyoverGeometry, flyoverGeometry });
            throw ex;
        }
    }
    // Because of the bug in polygon-clipping, we need to round coordinates or union() will fail:
    // https://github.com/mfogel/polygon-clipping/issues/93
    roundCoordinates(geometry) {
        if (typeof geometry === 'number') {
            const shift = 1000000;
            return Math.round(geometry * shift) / shift;
        }
        return geometry.map((x) => this.roundCoordinates(x));
    }
    findDatesUTC(bbox, // eslint-disable-line @typescript-eslint/no-unused-vars
    fromTime, // eslint-disable-line @typescript-eslint/no-unused-vars
    toTime, // eslint-disable-line @typescript-eslint/no-unused-vars
    reqConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('findDatesUTC() not implemented yet');
        });
    }
    /**
     * @deprecated Please use findDatesUTC() instead.
     */
    findDates(bbox, fromTime, toTime) {
        return __awaiter(this, void 0, void 0, function* () {
            console.warn('Method findDates() is deprecated and will be removed, please use findDatesUTC() instead');
            return yield this.findDatesUTC(bbox, fromTime, toTime);
        });
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getStats(payload, reqConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('getStats() not implemented for this dataset');
        });
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    updateLayerFromServiceIfNeeded(reqConfig) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
}

class WmsLayer extends AbstractLayer {
    constructor({ baseUrl, layerId, title = null, description = null, legendUrl = null, }) {
        super({ title, description, legendUrl });
        this.baseUrl = baseUrl;
        this.layerId = layerId;
    }
    getMapUrl(params, api) {
        if (api !== exports.ApiType.WMS) {
            throw new Error('Only WMS is supported on this layer');
        }
        if (params.gain) {
            throw new Error('Parameter gain is not supported in getMapUrl. Use getMap method instead.');
        }
        if (params.gamma) {
            throw new Error('Parameter gamma is not supported in getMapUrl. Use getMap method instead.');
        }
        if (params.effects) {
            throw new Error('Parameter effects is not supported in getMapUrl. Use getMap method instead.');
        }
        return wmsGetMapUrl(this.baseUrl, this.layerId, params);
    }
    findDatesUTC(bbox, // eslint-disable-line @typescript-eslint/no-unused-vars
    fromTime, toTime, reqConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            const dates = yield ensureTimeout((innerReqConfig) => __awaiter(this, void 0, void 0, function* () {
                // http://cite.opengeospatial.org/OGCTestData/wms/1.1.1/spec/wms1.1.1.html#dims
                const parsedLayers = yield fetchLayersFromGetCapabilitiesXml(this.baseUrl, OgcServiceTypes.WMS, innerReqConfig);
                const layer = parsedLayers.find(layerInfo => this.layerId === layerInfo.Name[0]);
                if (!layer) {
                    throw new Error('Layer not found');
                }
                if (!layer.Dimension) {
                    throw new Error('Layer does not supply time information (no Dimension field)');
                }
                const timeDimension = layer.Dimension.find(d => d['$'].name === 'time');
                if (!timeDimension) {
                    throw new Error("Layer does not supply time information (no Dimension field with name === 'time')");
                }
                // http://cite.opengeospatial.org/OGCTestData/wms/1.1.1/spec/wms1.1.1.html#date_time
                if (timeDimension['$'].units !== 'ISO8601') {
                    throw new Error('Layer time information is not in ISO8601 format, parsing not supported');
                }
                let allTimesMomentUTC = [];
                const times = timeDimension['_'].split(',');
                for (let i = 0; i < times.length; i++) {
                    const timeParts = times[i].split('/');
                    switch (timeParts.length) {
                        case 1:
                            allTimesMomentUTC.push(moment.utc(timeParts[0]));
                            break;
                        case 3:
                            const [intervalFromTime, intervalToTime, intervalDuration] = timeParts;
                            const intervalFromTimeMoment = moment.utc(intervalFromTime);
                            const intervalToTimeMoment = moment.utc(intervalToTime);
                            const intervalDurationMoment = moment.duration(intervalDuration);
                            for (let t = intervalFromTimeMoment; t.isSameOrBefore(intervalToTimeMoment); t.add(intervalDurationMoment)) {
                                allTimesMomentUTC.push(t.clone());
                            }
                            break;
                        default:
                            throw new Error('Unable to parse time information');
                    }
                }
                const found = allTimesMomentUTC.filter(t => t.isBetween(moment.utc(fromTime), moment.utc(toTime), null, '[]'));
                found.sort((a, b) => b.unix() - a.unix());
                return found.map(m => m.toDate());
            }), reqConfig);
            return dates;
        });
    }
    updateLayerFromServiceIfNeeded(reqConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            yield ensureTimeout((innerReqConfig) => __awaiter(this, void 0, void 0, function* () {
                if (this.legendUrl) {
                    return;
                }
                if (this.baseUrl === null || this.layerId === null) {
                    throw new Error("Additional data can't be fetched from service because baseUrl and layerId are not defined");
                }
                const parsedLayers = yield fetchLayersFromGetCapabilitiesXml(this.baseUrl, OgcServiceTypes.WMS, innerReqConfig);
                const layer = parsedLayers.find(layer => this.layerId === layer.Name[0]);
                if (!layer) {
                    throw new Error('Layer not found');
                }
                const legendUrl = layer.Style && layer.Style[0].LegendURL
                    ? layer.Style[0].LegendURL[0].OnlineResource[0]['$']['xlink:href']
                    : layer.Layer && layer.Layer[0].Style && layer.Layer[0].Style[0].LegendURL
                        ? layer.Layer[0].Style[0].LegendURL[0].OnlineResource[0]['$']['xlink:href']
                        : null;
                this.legendUrl = legendUrl;
            }), reqConfig);
        });
    }
}

var PreviewModeString;
(function (PreviewModeString) {
    PreviewModeString["DETAIL"] = "DETAIL";
    PreviewModeString["PREVIEW"] = "PREVIEW";
    PreviewModeString["EXTENDED_PREVIEW"] = "EXTENDED_PREVIEW";
})(PreviewModeString || (PreviewModeString = {}));
function convertPreviewToString(preview) {
    // WMS parameter description:
    //   https://www.sentinel-hub.com/develop/documentation/api/preview-modes
    // In the Processing API the values are enums:
    //   - 0 -> DETAIL
    //   - 1 -> PREVIEW
    //   - 2 -> EXTENDED_PREVIEW
    //   - 3 -> EXTENDED_PREVIEW (used, but not officially supported)
    switch (preview) {
        case 0:
            return PreviewModeString.DETAIL;
        case 1:
            return PreviewModeString.PREVIEW;
        case 2:
        case 3:
            return PreviewModeString.EXTENDED_PREVIEW;
        default:
            throw new Error('Preview mode does not exist, options are 0 (DETAIL), 1 (PREVIEW) or 2/3 (EXTENDED_PREVIEW)');
    }
}
function createProcessingPayload(dataset, params, evalscript = null, dataProduct = null, mosaickingOrder = null, upsampling = null, downsampling = null) {
    var _a;
    const { bbox } = params;
    const payload = {
        input: {
            bounds: {
                properties: {
                    crs: params.bbox ? params.bbox.crs.opengisUrl : (_a = params === null || params === void 0 ? void 0 : params.crs) === null || _a === void 0 ? void 0 : _a.opengisUrl,
                },
            },
            data: [
                {
                    dataFilter: {
                        timeRange: {
                            from: params.fromTime.toISOString(),
                            to: params.toTime.toISOString(),
                        },
                        mosaickingOrder: mosaickingOrder ? mosaickingOrder : exports.MosaickingOrder.MOST_RECENT,
                    },
                    processing: {},
                    type: dataset.shProcessingApiDatasourceAbbreviation,
                },
            ],
        },
        output: {
            width: params.width,
            height: params.height,
            responses: [
                {
                    identifier: params.outputResponseId ? params.outputResponseId : 'default',
                    format: {
                        type: params.format,
                    },
                },
            ],
        },
    };
    if (bbox) {
        payload.input.bounds.bbox = [bbox.minX, bbox.minY, bbox.maxX, bbox.maxY];
    }
    if (params.upsampling || upsampling) {
        payload.input.data[0].processing.upsampling = params.upsampling ? params.upsampling : upsampling;
    }
    if (params.downsampling || downsampling) {
        payload.input.data[0].processing.downsampling = params.downsampling ? params.downsampling : downsampling;
    }
    if (params.geometry !== undefined) {
        payload.input.bounds.geometry = params.geometry;
    }
    if (params.preview !== undefined) {
        payload.input.data[0].dataFilter.previewMode = convertPreviewToString(params.preview);
    }
    //dataProduct should not be set if evalscript is passed as parameter
    if (evalscript) {
        payload.evalscript = evalscript;
    }
    else if (dataProduct) {
        payload.dataProduct = {
            '@id': dataProduct,
        };
        payload.evalscript = ''; // evalscript must not be null
    }
    else {
        throw new Error('Either evalscript or dataProduct should be defined with Processing API');
    }
    return payload;
}
function processingGetMap(shServiceHostname, payload, reqConfig) {
    return __awaiter(this, void 0, void 0, function* () {
        const authToken = reqConfig && reqConfig.authToken ? reqConfig.authToken : getAuthToken();
        if (!authToken) {
            throw new Error('Must be authenticated to use Processing API');
        }
        const requestConfig = Object.assign({ headers: {
                Authorization: 'Bearer ' + authToken,
                'Content-Type': 'application/json',
                Accept: '*/*',
            }, 
            // 'blob' responseType does not work with Node.js:
            responseType: typeof window !== 'undefined' && window.Blob ? 'blob' : 'arraybuffer' }, getAxiosReqParams(reqConfig, CACHE_CONFIG_30MIN));
        const response = yield axios.post(`${shServiceHostname}api/v1/process`, payload, requestConfig);
        return response.data;
    });
}

// this class provides any SHv1- or SHv2-specific (EO Cloud) functionality to the subclasses:
class AbstractSentinelHubV1OrV2Layer extends AbstractLayer {
    constructor({ instanceId = null, layerId = null, evalscript = null, evalscriptUrl = null, mosaickingOrder = null, title = null, description = null, upsampling = null, downsampling = null, legendUrl = null, }) {
        super({ title, description, legendUrl });
        if (!layerId || !instanceId) {
            throw new Error('Parameters instanceId and layerId must be specified!');
        }
        this.instanceId = instanceId;
        this.layerId = layerId;
        this.evalscript = evalscript;
        this.evalscriptUrl = evalscriptUrl;
        this.mosaickingOrder = mosaickingOrder;
        this.upsampling = upsampling;
        this.downsampling = downsampling;
    }
    getEvalsource() {
        // some subclasses (Sentinel 1 at EO Cloud) might want to return a different
        // evalsource depending on their parameters
        return this.dataset.shWmsEvalsource;
    }
    getLayerId() {
        return this.layerId;
    }
    getEvalscript() {
        return this.evalscript;
    }
    getInstanceId() {
        return this.instanceId;
    }
    getWmsGetMapUrlAdditionalParameters() {
        let additionalParameters = {};
        if (this.mosaickingOrder) {
            additionalParameters.priority = this.mosaickingOrder;
        }
        if (this.upsampling) {
            additionalParameters.upsampling = this.upsampling;
        }
        if (this.downsampling) {
            additionalParameters.downsampling = this.downsampling;
        }
        return additionalParameters;
    }
    getMapUrl(params, api) {
        if (api !== exports.ApiType.WMS) {
            throw new Error('Only WMS is supported on this layer');
        }
        if (params.gain) {
            throw new Error('Parameter gain is not supported in getMapUrl. Use getMap method instead.');
        }
        if (params.gamma) {
            throw new Error('Parameter gamma is not supported in getMapUrl. Use getMap method instead.');
        }
        if (params.effects) {
            throw new Error('Parameter effects is not supported in getMapUrl. Use getMap method instead.');
        }
        const baseUrl = `${this.dataset.shServiceHostname}v1/wms/${this.instanceId}`;
        return wmsGetMapUrl(baseUrl, this.layerId, params, this.evalscript, this.evalscriptUrl, this.getEvalsource(), this.getWmsGetMapUrlAdditionalParameters());
    }
    setEvalscript(evalscript) {
        this.evalscript = evalscript;
    }
    setEvalscriptUrl(evalscriptUrl) {
        this.evalscriptUrl = evalscriptUrl;
    }
    getFindTilesAdditionalParameters() {
        return {};
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    extractFindTilesMeta(tile) {
        return {};
    }
    findTilesInner(bbox, fromTime, toTime, maxCount = null, offset = null, reqConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.dataset.searchIndexUrl) {
                throw new Error('This dataset does not support searching for tiles');
            }
            if (maxCount === null) {
                maxCount = DEFAULT_FIND_TILES_MAX_COUNT_PARAMETER;
            }
            if (offset === null) {
                offset = 0;
            }
            const payload = bbox.toGeoJSON();
            const params = Object.assign({ expand: 'true', timefrom: fromTime.toISOString(), timeto: toTime.toISOString(), maxcount: maxCount, offset: Number(offset) }, this.getFindTilesAdditionalParameters());
            const url = `${this.dataset.searchIndexUrl}?${queryString.stringify(params, { sort: false })}`;
            const response = yield axios.post(url, payload, Object.assign({ headers: {
                    'Content-Type': 'application/json',
                    'Accept-CRS': 'EPSG:4326',
                } }, getAxiosReqParams(reqConfig, CACHE_CONFIG_NOCACHE)));
            const responseTiles = response.data.tiles;
            return {
                tiles: responseTiles.map(tile => ({
                    geometry: tile.tileDrawRegionGeometry,
                    sensingTime: moment.utc(tile.sensingTime).toDate(),
                    meta: this.extractFindTilesMeta(tile),
                    links: this.getTileLinks(tile),
                })),
                hasMore: response.data.hasMore,
            };
        });
    }
    getFindDatesUTCAdditionalParameters(reqConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            return {};
        });
    }
    getStatsAdditionalParameters() {
        return {};
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getTileLinks(tile) {
        return [];
    }
    findDatesUTC(bbox, fromTime, toTime, reqConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            const datesUTC = yield ensureTimeout((innerReqConfig) => __awaiter(this, void 0, void 0, function* () {
                if (!this.dataset.findDatesUTCUrl) {
                    throw new Error('This dataset does not support searching for dates');
                }
                const payload = bbox.toGeoJSON();
                const params = Object.assign({ timefrom: fromTime.toISOString(), timeto: toTime.toISOString() }, (yield this.getFindDatesUTCAdditionalParameters(innerReqConfig)));
                const url = `${this.dataset.findDatesUTCUrl}?${queryString.stringify(params, { sort: false })}`;
                const response = yield axios.post(url, payload, Object.assign({ headers: {
                        'Content-Type': 'application/json',
                    } }, getAxiosReqParams(innerReqConfig, CACHE_CONFIG_NOCACHE)));
                return response.data.map((date) => moment.utc(date).toDate());
            }), reqConfig);
            return datesUTC;
        });
    }
    getStats(params, reqConfig = {}, statsProvider = exports.StatisticsProviderType.FIS) {
        return __awaiter(this, void 0, void 0, function* () {
            const stats = yield ensureTimeout((innerReqConfig) => __awaiter(this, void 0, void 0, function* () {
                const sp = getStatisticsProvider(statsProvider);
                const data = yield sp.getStats(this, params, innerReqConfig);
                return data;
            }), reqConfig);
            return stats;
        });
    }
    updateLayerFromServiceIfNeeded(reqConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            const legendUrl = yield ensureTimeout((innerReqConfig) => __awaiter(this, void 0, void 0, function* () {
                if (this.instanceId === null || this.layerId === null) {
                    throw new Error("Additional data can't be fetched from service because instanceId and layerId are not defined");
                }
                const baseUrl = `${this.dataset.shServiceHostname}v1/wms/${this.instanceId}`;
                const parsedLayers = yield fetchLayersFromGetCapabilitiesXml(baseUrl, OgcServiceTypes.WMS, innerReqConfig);
                const layer = parsedLayers.find(layerInfo => this.layerId === layerInfo.Name[0]);
                if (!layer) {
                    throw new Error('Layer not found');
                }
                const legendUrl = layer.Style && layer.Style[0].LegendURL
                    ? layer.Style[0].LegendURL[0].OnlineResource[0]['$']['xlink:href']
                    : null;
                return legendUrl;
            }), reqConfig);
            this.legendUrl = legendUrl;
        });
    }
}

class Fis {
    getStatistics() {
        throw new Error('Method not implemented.');
    }
    createFISPayload(layer, params) {
        if (!params.geometry) {
            throw new Error('Parameter "geometry" needs to be provided');
        }
        if (!params.resolution) {
            throw new Error('Parameter "resolution" needs to be provided');
        }
        if (!params.fromTime || !params.toTime) {
            throw new Error('Parameters "fromTime" and "toTime" need to be provided');
        }
        const payload = Object.assign({ layer: layer.getLayerId(), crs: params.crs ? params.crs.authId : CRS_EPSG4326.authId, geometry: WKT.convert(params.geometry), time: `${moment.utc(params.fromTime).format('YYYY-MM-DDTHH:mm:ss') + 'Z'}/${moment
                .utc(params.toTime)
                .format('YYYY-MM-DDTHH:mm:ss') + 'Z'}`, resolution: undefined, bins: params.bins || 5, type: HistogramType.EQUALFREQUENCY }, layer.getStatsAdditionalParameters());
        if (params.geometry.crs) {
            const selectedCrs = findCrsFromUrn(params.geometry.crs.properties.name);
            payload.crs = selectedCrs.authId;
        }
        // When using CRS=EPSG:4326 or CRS_WGS84 one has to add the "m" suffix to enforce resolution in meters per pixel
        if (payload.crs === CRS_EPSG4326.authId || payload.crs === CRS_WGS84.authId) {
            payload.resolution = params.resolution + 'm';
        }
        else {
            payload.resolution = params.resolution;
        }
        if (layer.getEvalscript()) {
            if (typeof window !== 'undefined' && window.btoa) {
                payload.evalscript = btoa(layer.getEvalscript());
            }
            else {
                payload.evalscript = Buffer.from(layer.getEvalscript(), 'utf8').toString('base64');
            }
            if (layer instanceof AbstractSentinelHubV1OrV2Layer) {
                payload.evalsource = layer.getEvalsource();
            }
        }
        return payload;
    }
    convertFISResponse(data) {
        // convert date strings to Date objects
        for (let channel in data) {
            data[channel] = data[channel].map((dailyStats) => (Object.assign(Object.assign({}, dailyStats), { date: new Date(dailyStats.date) })));
        }
        return data;
    }
    getStats(layer, params, reqConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            if (layer instanceof AbstractSentinelHubV3Layer) {
                return this.handleV3(layer, params, reqConfig);
            }
            else if (layer instanceof AbstractSentinelHubV1OrV2Layer) {
                return this.handleV1orV2(layer, params, reqConfig);
            }
            else {
                throw new Error('Not supported');
            }
        });
    }
    handleV3(layer, params, reqConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            const payload = this.createFISPayload(layer, params);
            const axiosReqConfig = Object.assign({}, getAxiosReqParams(reqConfig, CACHE_CONFIG_NOCACHE));
            const shServiceHostname = layer.getShServiceHostname();
            const { data } = yield axios.post(shServiceHostname + 'ogc/fis/' + layer.getInstanceId(), payload, axiosReqConfig);
            return this.convertFISResponse(data);
        });
    }
    handleV1orV2(layer, params, reqConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            const payload = this.createFISPayload(layer, params);
            const { data } = yield axios.get(layer.dataset.shServiceHostname + 'v1/fis/' + layer.getInstanceId(), Object.assign({ params: payload }, getAxiosReqParams(reqConfig, CACHE_CONFIG_NOCACHE)));
            return this.convertFISResponse(data);
        });
    }
}

function convertToFISResponse(data, defaultOutput = 'default') {
    //array of stats objects (interval+outputs)
    const statisticsPerBand = new Map();
    for (let statObject of data) {
        const date = new Date(statObject.interval.from);
        const { outputs } = statObject;
        const outputId = Object.keys(outputs).find(output => output === defaultOutput) || Object.keys(outputs)[0];
        const outputData = outputs[outputId];
        const { bands } = outputData;
        Object.keys(bands).forEach(band => {
            const { stats } = bands[band];
            const dailyStats = {
                date: date,
                basicStats: stats,
            };
            // statistical api doesn't support equal frequency histograms so we try to
            // create them from percentiles
            if (!!stats.percentiles) {
                const lowEdges = Object.keys(stats.percentiles).sort((a, b) => parseFloat(a) - parseFloat(b));
                const bins = [stats.min, ...lowEdges.map((lowEdge) => stats.percentiles[lowEdge])].map(value => ({
                    lowEdge: value,
                    mean: null,
                    count: null,
                }));
                dailyStats.histogram = {
                    bins: bins,
                };
            }
            //remove percentiles from basic stats
            delete stats.percentiles;
            let dcs = [];
            if (statisticsPerBand.has(band)) {
                dcs = statisticsPerBand.get(band);
            }
            dcs.push(dailyStats);
            statisticsPerBand.set(band, dcs);
        });
    }
    const result = {};
    for (let band of statisticsPerBand.keys()) {
        const bandStats = statisticsPerBand.get(band);
        //bands in FIS response are
        // - prefixed with C
        // - sorted descending
        result[band.replace('B', 'C')] = bandStats.sort((a, b) => b.date.valueOf() - a.date.valueOf());
    }
    return result;
}
function createInputPayload(layer, params, reqConfig) {
    return __awaiter(this, void 0, void 0, function* () {
        const processingPayload = createProcessingPayload(layer.dataset, Object.assign({}, params), layer.getEvalscript(), layer.getDataProduct(), layer.mosaickingOrder, layer.upsampling, layer.downsampling);
        const updatedProcessingPayload = yield layer._updateProcessingGetMapPayload(processingPayload, 0, reqConfig);
        const { input } = updatedProcessingPayload;
        return input;
    });
}
function createAggregationPayload(layer, params) {
    if (!params.fromTime) {
        throw new Error('fromTime must be defined');
    }
    if (!params.toTime) {
        throw new Error('toTime must be defined');
    }
    if (!params.aggregationInterval) {
        throw new Error('aggregationInterval must be defined');
    }
    const resX = params.resolution;
    const resY = params.resolution;
    const payload = {
        timeRange: {
            from: params.fromTime.toISOString(),
            to: params.toTime.toISOString(),
        },
        aggregationInterval: {
            of: params.aggregationInterval,
        },
        resx: resX,
        resy: resY,
        evalscript: layer.getEvalscript(),
    };
    return payload;
}
function createCalculationsPayload(layer, params, output = 'default') {
    //calculate percentiles for selected output
    const statisticsForAllBands = {
        statistics: {
            //If it is "default", the statistics specified below will be calculated for all bands of this output
            default: {
                percentiles: {
                    k: Array.from({ length: params.bins - 1 }, (_, i) => ((i + 1) * 100) / params.bins),
                },
            },
        },
    };
    return {
        [output]: statisticsForAllBands,
    };
}
const StatisticsUtils = {
    convertToFISResponse: convertToFISResponse,
    createInputPayload: createInputPayload,
    createAggregationPayload: createAggregationPayload,
    createCalculationsPayload: createCalculationsPayload,
};

const STATS_DEFAULT_OUTPUT = 'default';
class StatisticalApi {
    getStats(layer, params, reqConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            const authToken = reqConfig && reqConfig.authToken ? reqConfig.authToken : getAuthToken();
            if (!authToken) {
                throw new Error('Must be authenticated to use Statistical API');
            }
            yield layer.updateLayerFromServiceIfNeeded(reqConfig);
            const input = yield StatisticsUtils.createInputPayload(layer, params, reqConfig);
            const aggregation = StatisticsUtils.createAggregationPayload(layer, Object.assign(Object.assign({}, params), { aggregationInterval: 'P1D' }));
            const calculations = StatisticsUtils.createCalculationsPayload(layer, params, (params === null || params === void 0 ? void 0 : params.output) || STATS_DEFAULT_OUTPUT);
            const payload = {
                input: input,
                aggregation: aggregation,
                calculations: calculations,
            };
            const data = this.getStatistics(`${layer.getShServiceHostname()}api/v1/statistics`, payload, reqConfig);
            return data;
        });
    }
    getStatistics(shServiceHostname, payload, reqConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            const authToken = reqConfig && reqConfig.authToken ? reqConfig.authToken : getAuthToken();
            if (!authToken) {
                throw new Error('Must be authenticated to use Statistical API');
            }
            const requestConfig = Object.assign({ headers: {
                    Authorization: 'Bearer ' + authToken,
                    'Content-Type': 'application/json',
                    Accept: '*/*',
                } }, getAxiosReqParams(reqConfig, CACHE_CONFIG_30MIN));
            const { data } = yield axios.post(shServiceHostname, payload, requestConfig);
            return data;
        });
    }
}

(function (StatisticsProviderType) {
    StatisticsProviderType["FIS"] = "FIS";
    StatisticsProviderType["STAPI"] = "STAPI";
})(exports.StatisticsProviderType || (exports.StatisticsProviderType = {}));
function getStatisticsProvider(statsProvider) {
    switch (statsProvider) {
        case exports.StatisticsProviderType.STAPI:
            return new StatisticalApi();
        case exports.StatisticsProviderType.FIS:
            return new Fis();
        default:
            throw new Error(`Unknows statistics provider ${statsProvider}`);
    }
}

// this class provides any SHv3-specific functionality to the subclasses:
class AbstractSentinelHubV3Layer extends AbstractLayer {
    constructor({ instanceId = null, layerId = null, evalscript = null, evalscriptUrl = null, dataProduct = null, mosaickingOrder = null, title = null, description = null, upsampling = null, downsampling = null, legendUrl = null, }) {
        super({ title, description, legendUrl });
        if ((layerId === null || instanceId === null) &&
            evalscript === null &&
            evalscriptUrl === null &&
            dataProduct === null) {
            throw new Error('At least one of these parameters (instanceId + layerId, evalscript, evalscriptUrl, dataProduct) must be specified!');
        }
        this.instanceId = instanceId;
        this.layerId = layerId;
        this.evalscript = evalscript;
        this.evalscriptUrl = evalscriptUrl;
        this.dataProduct = dataProduct;
        this.mosaickingOrder = mosaickingOrder;
        this.upsampling = upsampling;
        this.downsampling = downsampling;
    }
    getLayerId() {
        return this.layerId;
    }
    getEvalscript() {
        return this.evalscript;
    }
    getDataProduct() {
        return this.dataProduct;
    }
    getInstanceId() {
        return this.instanceId;
    }
    fetchLayerParamsFromSHServiceV3(reqConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.instanceId === null || this.layerId === null) {
                throw new Error('Could not fetch layer params - instanceId and layerId must be set on Layer');
            }
            if (!this.dataset) {
                throw new Error('This layer does not support Processing API (unknown dataset)');
            }
            const layersParams = yield fetchLayerParamsFromConfigurationService(this.instanceId, reqConfig);
            const layerParams = layersParams.find((l) => l.layerId === this.layerId);
            if (!layerParams) {
                throw new Error('Layer params could not be found');
            }
            return layerParams;
        });
    }
    _updateProcessingGetMapPayload(payload, datasetSeqNo = 0, // eslint-disable-line @typescript-eslint/no-unused-vars
    reqConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            // Subclasses should override this method if they wish to supply additional
            // parameters to Processing API.
            // Typically, if additional layer data is needed for that, this code will be called:
            //   const layerParams = await this.fetchLayerParamsFromSHServiceV3();
            return payload;
        });
    }
    getShServiceHostname() {
        return this.dataset.shServiceHostname;
    }
    getCatalogCollectionId() {
        return this.dataset.catalogCollectionId;
    }
    getSearchIndexUrl() {
        return this.dataset.searchIndexUrl;
    }
    fetchEvalscriptUrlIfNeeded(reqConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.evalscriptUrl && !this.evalscript) {
                const response = yield axios.get(this.evalscriptUrl, Object.assign({ responseType: 'text' }, getAxiosReqParams(reqConfig, CACHE_CONFIG_30MIN)));
                this.evalscript = response.data;
            }
        });
    }
    getMap(params, api, reqConfig) {
        const _super = Object.create(null, {
            getMap: { get: () => super.getMap }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return yield ensureTimeout((innerReqConfig) => __awaiter(this, void 0, void 0, function* () {
                params = yield this.decideJpegOrPng(params, innerReqConfig);
                // SHv3 services support Processing API:
                if (api === exports.ApiType.PROCESSING) {
                    if (!this.dataset) {
                        throw new Error('This layer does not support Processing API (unknown dataset)');
                    }
                    yield this.fetchEvalscriptUrlIfNeeded(innerReqConfig);
                    let layerParams = null;
                    if (!this.evalscript && !this.dataProduct) {
                        layerParams = yield this.fetchLayerParamsFromSHServiceV3(innerReqConfig);
                        if (layerParams.evalscript) {
                            this.evalscript = layerParams.evalscript;
                        }
                        else if (layerParams.dataProduct) {
                            this.dataProduct = layerParams.dataProduct;
                        }
                        else {
                            throw new Error(`Could not fetch evalscript / dataProduct from service for layer ${this.layerId}`);
                        }
                    }
                    if (this.instanceId &&
                        this.layerId &&
                        (!this.mosaickingOrder || !this.upsampling || !this.downsampling)) {
                        if (!layerParams) {
                            layerParams = yield this.fetchLayerParamsFromSHServiceV3(innerReqConfig);
                        }
                        if (!this.mosaickingOrder && layerParams && layerParams.mosaickingOrder) {
                            this.mosaickingOrder = layerParams.mosaickingOrder;
                        }
                        if (!this.upsampling && layerParams && layerParams.upsampling) {
                            this.upsampling = layerParams.upsampling;
                        }
                        if (!this.downsampling && layerParams && layerParams.downsampling) {
                            this.downsampling = layerParams.downsampling;
                        }
                    }
                    const payload = createProcessingPayload(this.dataset, params, this.evalscript, this.dataProduct, this.mosaickingOrder, this.upsampling, this.downsampling);
                    // allow subclasses to update payload with their own parameters:
                    const updatedPayload = yield this._updateProcessingGetMapPayload(payload, 0, innerReqConfig);
                    const shServiceHostname = this.getShServiceHostname();
                    let blob = yield processingGetMap(shServiceHostname, updatedPayload, innerReqConfig);
                    // apply effects:
                    // support deprecated GetMapParams.gain and .gamma parameters
                    // but override them if they are also present in .effects
                    const effects = Object.assign({ gain: params.gain, gamma: params.gamma }, params.effects);
                    blob = yield runEffectFunctions(blob, effects);
                    return blob;
                }
                return _super.getMap.call(this, params, api, innerReqConfig);
            }), reqConfig);
        });
    }
    supportsApiType(api) {
        if (this.dataProduct && !SUPPORTED_DATA_PRODUCTS_PROCESSING.includes(this.dataProduct)) {
            return api === exports.ApiType.WMS;
        }
        return api === exports.ApiType.WMS || (api === exports.ApiType.PROCESSING && !!this.dataset);
    }
    getWmsGetMapUrlAdditionalParameters() {
        let additionalParameters = {};
        if (this.mosaickingOrder) {
            additionalParameters.priority = this.mosaickingOrder;
        }
        if (this.upsampling) {
            additionalParameters.upsampling = this.upsampling;
        }
        if (this.downsampling) {
            additionalParameters.downsampling = this.downsampling;
        }
        return additionalParameters;
    }
    getMapUrl(params, api) {
        if (api !== exports.ApiType.WMS) {
            throw new Error('This API type does not support GET HTTP method!');
        }
        if (!this.dataset) {
            throw new Error('This layer does not have a dataset specified');
        }
        if (params.gain) {
            throw new Error('Parameter gain is not supported in getMapUrl. Use getMap method instead.');
        }
        if (params.gamma) {
            throw new Error('Parameter gamma is not supported in getMapUrl. Use getMap method instead.');
        }
        if (params.effects) {
            throw new Error('Parameter effects is not supported in getMapUrl. Use getMap method instead.');
        }
        const shServiceHostname = this.getShServiceHostname();
        const baseUrl = `${shServiceHostname}ogc/wms/${this.instanceId}`;
        const evalsource = this.dataset.shWmsEvalsource;
        return wmsGetMapUrl(baseUrl, this.layerId, params, this.evalscript, this.evalscriptUrl, evalsource, this.getWmsGetMapUrlAdditionalParameters());
    }
    setEvalscript(evalscript) {
        this.evalscript = evalscript;
    }
    setEvalscriptUrl(evalscriptUrl) {
        this.evalscriptUrl = evalscriptUrl;
    }
    createSearchIndexRequestConfig(reqConfig) {
        const requestConfig = Object.assign({ headers: { 'Accept-CRS': 'EPSG:4326' } }, getAxiosReqParams(reqConfig, CACHE_CONFIG_NOCACHE));
        return requestConfig;
    }
    convertResponseFromSearchIndex(response) {
        return {
            tiles: response.data.tiles.map(tile => ({
                geometry: tile.dataGeometry,
                sensingTime: moment.utc(tile.sensingTime).toDate(),
                meta: this.extractFindTilesMeta(tile),
                links: this.getTileLinks(tile),
            })),
            hasMore: response.data.hasMore,
        };
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    extractFindTilesMetaFromCatalog(feature) {
        return {};
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getTileLinksFromCatalog(feature) {
        const { assets, links } = feature;
        let result = [];
        if (!assets && !links) {
            return [];
        }
        if (assets && assets.data) {
            result.push({ target: assets.data.href, type: exports.LinkType.AWS });
        }
        if (assets && assets.thumbnail) {
            result.push({ target: assets.thumbnail.href, type: exports.LinkType.PREVIEW });
        }
        const sciHubLink = links.find((l) => {
            return l.title === 'scihub download';
        });
        if (sciHubLink) {
            result.push({ target: sciHubLink.href, type: exports.LinkType.SCIHUB });
        }
        return result;
    }
    convertResponseFromCatalog(response) {
        return {
            tiles: response.data.features.map((feature) => ({
                geometry: feature.geometry,
                sensingTime: moment.utc(feature.properties.datetime).toDate(),
                meta: this.extractFindTilesMetaFromCatalog(feature),
                links: this.getTileLinksFromCatalog(feature),
            })),
            hasMore: !!response.data.context.next,
        };
    }
    findTilesInner(bbox, fromTime, toTime, maxCount = null, offset = null, reqConfig, intersects) {
        return __awaiter(this, void 0, void 0, function* () {
            const authToken = reqConfig && reqConfig.authToken ? reqConfig.authToken : getAuthToken();
            const canUseCatalog = authToken && !!this.getCatalogCollectionId();
            let result = null;
            if (canUseCatalog) {
                const response = yield this.findTilesUsingCatalog(authToken, bbox, fromTime, toTime, maxCount, offset, reqConfig, this.getFindTilesAdditionalParameters(), intersects);
                result = this.convertResponseFromCatalog(response);
            }
            else {
                result = yield this.findTilesUsingSearchIndex(this.getSearchIndexUrl(), bbox, fromTime, toTime, maxCount, offset, reqConfig, this.getFindTilesAdditionalParameters());
            }
            return result;
        });
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    extractFindTilesMeta(tile) {
        return {};
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getTileLinks(tile) {
        return [];
    }
    findTilesUsingSearchIndex(searchIndexUrl, bbox, fromTime, toTime, maxCount = null, offset = null, reqConfig, findTilesAdditionalParameters) {
        return __awaiter(this, void 0, void 0, function* () {
            if (maxCount === null) {
                maxCount = DEFAULT_FIND_TILES_MAX_COUNT_PARAMETER;
            }
            if (offset === null) {
                offset = 0;
            }
            if (!searchIndexUrl) {
                throw new Error('This dataset does not support searching for tiles');
            }
            const { maxCloudCoverPercent, datasetParameters } = findTilesAdditionalParameters;
            const bboxPolygon = bbox.toGeoJSON();
            // Note: we are requesting maxCloudCoverage as a number between 0 and 1, but in
            // the tiles we get cloudCoverPercentage (0..100).
            const payload = {
                clipping: bboxPolygon,
                maxcount: maxCount,
                maxCloudCoverage: maxCloudCoverPercent !== null ? maxCloudCoverPercent / 100 : null,
                timeFrom: fromTime.toISOString(),
                timeTo: toTime.toISOString(),
                offset: offset,
            };
            if (datasetParameters) {
                payload.datasetParameters = datasetParameters;
            }
            const response = yield axios.post(searchIndexUrl, payload, this.createSearchIndexRequestConfig(reqConfig));
            return this.convertResponseFromSearchIndex(response);
        });
    }
    createCatalogFilterQuery(maxCloudCoverPercent, // eslint-disable-line @typescript-eslint/no-unused-vars
    datasetParameters) {
        return null;
    }
    findTilesUsingCatalog(authToken, bbox, fromTime, toTime, maxCount = null, offset = null, reqConfig, findTilesAdditionalParameters, intersects) {
        return __awaiter(this, void 0, void 0, function* () {
            if (maxCount !== null && maxCount > CATALOG_SEARCH_MAX_LIMIT) {
                throw new Error(`Parameter maxCount must be less than or equal to ${CATALOG_SEARCH_MAX_LIMIT}`);
            }
            if (!authToken) {
                throw new Error('Must be authenticated to use Catalog service');
            }
            const catalogCollectionId = this.getCatalogCollectionId();
            if (!catalogCollectionId) {
                throw new Error('Cannot use Catalog service without collection');
            }
            const headers = {
                Authorization: `Bearer ${authToken}`,
                'Content-Type': 'application/json',
            };
            const requestConfig = Object.assign({ headers: headers }, getAxiosReqParams(reqConfig, CACHE_CONFIG_30MIN));
            const { maxCloudCoverPercent, datasetParameters, distinct } = findTilesAdditionalParameters;
            const payload = {
                bbox: [bbox.minX, bbox.minY, bbox.maxX, bbox.maxY],
                datetime: `${moment.utc(fromTime).toISOString()}/${moment.utc(toTime).toISOString()}`,
                collections: [catalogCollectionId],
            };
            if (maxCount > 0) {
                payload.limit = maxCount;
            }
            if (offset > 0) {
                payload.next = offset;
            }
            if (intersects) {
                payload.intersects = intersects;
                payload.bbox = null;
            }
            const filterQuery = this.createCatalogFilterQuery(maxCloudCoverPercent, datasetParameters);
            if (filterQuery) {
                payload.filter = filterQuery;
                payload['filter-lang'] = 'cql2-json';
            }
            if (distinct) {
                payload['distinct'] = distinct;
            }
            const shServiceHostname = this.getShServiceHostname();
            return yield axios.post(`${shServiceHostname}api/v1/catalog/1.0.0/search`, payload, requestConfig);
        });
    }
    getFindDatesUTCAdditionalParameters(reqConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            return {};
        });
    }
    getStatsAdditionalParameters() {
        return {};
    }
    getFindDatesUTCUrl(reqConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.dataset.findDatesUTCUrl;
        });
    }
    findDatesUTC(bbox, fromTime, toTime, reqConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            const findDatesUTCValue = yield ensureTimeout((innerReqConfig) => __awaiter(this, void 0, void 0, function* () {
                const authToken = reqConfig && reqConfig.authToken ? reqConfig.authToken : getAuthToken();
                const canUseCatalog = authToken && !!this.getCatalogCollectionId();
                if (canUseCatalog) {
                    return yield this.findDatesUTCCatalog(innerReqConfig, authToken, bbox, fromTime, toTime);
                }
                else {
                    return yield this.findDatesUTCSearchIndex(innerReqConfig, bbox, fromTime, toTime);
                }
            }), reqConfig);
            return findDatesUTCValue;
        });
    }
    findDatesUTCSearchIndex(innerReqConfig, bbox, fromTime, toTime) {
        return __awaiter(this, void 0, void 0, function* () {
            const findDatesUTCUrl = yield this.getFindDatesUTCUrl(innerReqConfig);
            if (!findDatesUTCUrl) {
                throw new Error('This dataset does not support searching for dates');
            }
            const bboxPolygon = bbox.toGeoJSON();
            const payload = Object.assign({ queryArea: bboxPolygon, from: fromTime.toISOString(), to: toTime.toISOString() }, (yield this.getFindDatesUTCAdditionalParameters(innerReqConfig)));
            const axiosReqConfig = Object.assign({}, getAxiosReqParams(innerReqConfig, CACHE_CONFIG_30MIN));
            const response = yield axios.post(findDatesUTCUrl, payload, axiosReqConfig);
            const found = response.data.map((date) => moment.utc(date));
            // S-5P, S-3 and possibly other datasets return the results in reverse order (leastRecent).
            // Let's sort the data so that we always return most recent results first:
            found.sort((a, b) => b.unix() - a.unix());
            return found.map(m => m.toDate());
        });
    }
    findDatesUTCCatalog(innerReqConfig, authToken, bbox, fromTime, toTime) {
        return __awaiter(this, void 0, void 0, function* () {
            const { maxCloudCoverage, datasetParameters } = yield this.getFindDatesUTCAdditionalParameters();
            let findTilesAdditionalParameters = { datasetParameters: datasetParameters };
            if (maxCloudCoverage !== null && maxCloudCoverage !== undefined) {
                findTilesAdditionalParameters.maxCloudCoverPercent = maxCloudCoverage * 100;
            }
            findTilesAdditionalParameters.distinct = 'date';
            let results = [];
            let offset = 0;
            let hasMore = true;
            while (hasMore) {
                const response = yield this.findTilesUsingCatalog(authToken, bbox, fromTime, toTime, CATALOG_SEARCH_MAX_LIMIT, offset, innerReqConfig, findTilesAdditionalParameters);
                if (response && response.data && response.data.features) {
                    results = [...results, ...response.data.features.map((date) => new Date(date))];
                }
                if (response && response.data && response.data.context && !!response.data.context.next) {
                    hasMore = !!response.data.context.next;
                    offset = response.data.context.next;
                }
                else {
                    hasMore = false;
                }
            }
            return results.sort((a, b) => b.getTime() - a.getTime());
        });
    }
    getStats(params, reqConfig = {}, statsProvider = exports.StatisticsProviderType.FIS) {
        return __awaiter(this, void 0, void 0, function* () {
            const stats = yield ensureTimeout((innerReqConfig) => __awaiter(this, void 0, void 0, function* () {
                const sp = getStatisticsProvider(statsProvider);
                const data = yield sp.getStats(this, params, innerReqConfig);
                return data;
            }), reqConfig);
            return stats;
        });
    }
    updateLayerFromServiceIfNeeded(reqConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            yield ensureTimeout((innerReqConfig) => __awaiter(this, void 0, void 0, function* () {
                const layerParams = yield this.fetchLayerParamsFromSHServiceV3(innerReqConfig);
                this.legend = layerParams['legend'] ? layerParams['legend'] : null;
                if (!this.evalscript) {
                    this.evalscript = layerParams['evalscript'] ? layerParams['evalscript'] : null;
                }
                if (!this.mosaickingOrder && layerParams.mosaickingOrder) {
                    this.mosaickingOrder = layerParams.mosaickingOrder;
                }
                if (!this.upsampling && layerParams.upsampling) {
                    this.upsampling = layerParams.upsampling;
                }
                if (!this.downsampling && layerParams.downsampling) {
                    this.downsampling = layerParams.downsampling;
                }
                // this is a hotfix for `supportsApiType()` not having enough information - should be fixed properly later:
                this.dataProduct = layerParams['dataProduct'] ? layerParams['dataProduct'] : null;
            }), reqConfig);
        });
    }
    getFindTilesAdditionalParameters() {
        return {
            maxCloudCoverPercent: null,
            datasetParameters: null,
        };
    }
}

(function (AcquisitionMode) {
    AcquisitionMode["IW"] = "IW";
    AcquisitionMode["EW"] = "EW";
})(exports.AcquisitionMode || (exports.AcquisitionMode = {}));
(function (Polarization) {
    Polarization["DV"] = "DV";
    Polarization["SH"] = "SH";
    Polarization["DH"] = "DH";
    Polarization["SV"] = "SV";
})(exports.Polarization || (exports.Polarization = {}));
(function (Resolution) {
    Resolution["HIGH"] = "HIGH";
    Resolution["MEDIUM"] = "MEDIUM";
})(exports.Resolution || (exports.Resolution = {}));
(function (SpeckleFilterType) {
    SpeckleFilterType["NONE"] = "NONE";
    SpeckleFilterType["LEE"] = "LEE";
})(exports.SpeckleFilterType || (exports.SpeckleFilterType = {}));
class S1GRDAWSEULayer extends AbstractSentinelHubV3Layer {
    constructor({ instanceId = null, layerId = null, evalscript = null, evalscriptUrl = null, dataProduct = null, title = null, description = null, legendUrl = null, acquisitionMode = null, polarization = null, resolution = null, orthorectify = null, demInstanceType = null, backscatterCoeff = exports.BackscatterCoeff.GAMMA0_ELLIPSOID, orbitDirection = null, speckleFilter = null, }) {
        super({ instanceId, layerId, evalscript, evalscriptUrl, dataProduct, title, description, legendUrl });
        this.dataset = DATASET_AWSEU_S1GRD;
        this.resolution = null;
        this.orbitDirection = null;
        this.orthorectify = null;
        this.demInstanceType = null;
        this.backscatterCoeff = exports.BackscatterCoeff.GAMMA0_ELLIPSOID;
        this.acquisitionMode = acquisitionMode;
        this.polarization = polarization;
        this.resolution = resolution;
        this.orthorectify = orthorectify;
        this.demInstanceType = demInstanceType;
        this.backscatterCoeff = backscatterCoeff;
        this.orbitDirection = orbitDirection;
        this.speckleFilter = speckleFilter;
    }
    updateLayerFromServiceIfNeeded(reqConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            yield ensureTimeout((innerReqConfig) => __awaiter(this, void 0, void 0, function* () {
                if (this.polarization !== null && this.acquisitionMode !== null && this.resolution !== null) {
                    return;
                }
                if (this.instanceId === null || this.layerId === null) {
                    throw new Error("One or more of these parameters (polarization, acquisitionMode, resolution) \
          are not set and can't be fetched from service because instanceId and layerId are not available");
                }
                const layerParams = yield this.fetchLayerParamsFromSHServiceV3(innerReqConfig);
                this.acquisitionMode = layerParams['acquisitionMode'];
                this.polarization = layerParams['polarization'];
                this.resolution = layerParams['resolution'];
                this.backscatterCoeff = layerParams['backCoeff'];
                this.orbitDirection = layerParams['orbitDirection'] ? layerParams['orbitDirection'] : null;
                if (this.orthorectify === null) {
                    this.orthorectify = layerParams['orthorectify'];
                }
                if (!this.demInstanceType) {
                    this.demInstanceType = layerParams['demInstance'];
                }
                if (!this.speckleFilter) {
                    this.speckleFilter = layerParams['speckleFilter'];
                }
                this.legend = layerParams['legend'] ? layerParams['legend'] : null;
                if (!this.evalscript) {
                    this.evalscript = layerParams['evalscript'] ? layerParams['evalscript'] : null;
                }
                if (!this.mosaickingOrder && layerParams.mosaickingOrder) {
                    this.mosaickingOrder = layerParams.mosaickingOrder;
                }
                if (!this.upsampling && layerParams.upsampling) {
                    this.upsampling = layerParams.upsampling;
                }
                if (!this.downsampling && layerParams.downsampling) {
                    this.downsampling = layerParams.downsampling;
                }
                // this is a hotfix for `supportsApiType()` not having enough information - should be fixed properly later:
                this.dataProduct = layerParams['dataProduct'] ? layerParams['dataProduct'] : null;
            }), reqConfig);
        });
    }
    _updateProcessingGetMapPayload(payload, datasetSeqNo = 0, reqConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.updateLayerFromServiceIfNeeded(reqConfig);
            payload.input.data[datasetSeqNo].dataFilter.acquisitionMode = this.acquisitionMode;
            payload.input.data[datasetSeqNo].dataFilter.polarization = this.polarization;
            payload.input.data[datasetSeqNo].dataFilter.resolution = this.resolution;
            if (this.orbitDirection !== null) {
                payload.input.data[datasetSeqNo].dataFilter.orbitDirection = this.orbitDirection;
            }
            payload.input.data[datasetSeqNo].processing.backCoeff = this.backscatterCoeff;
            if (this.orthorectify === true) {
                payload.input.data[datasetSeqNo].processing.demInstance = this.demInstanceType;
                payload.input.data[datasetSeqNo].processing.orthorectify = this.orthorectify;
            }
            payload.input.data[datasetSeqNo].processing.speckleFilter = this.speckleFilter;
            return payload;
        });
    }
    convertResponseFromSearchIndex(response) {
        return {
            tiles: response.data.tiles.map(tile => ({
                geometry: tile.dataGeometry,
                sensingTime: moment.utc(tile.sensingTime).toDate(),
                meta: {
                    tileId: tile.id,
                    orbitDirection: tile.orbitDirection,
                    polarization: tile.polarization,
                    acquisitionMode: tile.acquisitionMode,
                    resolution: tile.resolution,
                },
                links: this.getTileLinks(tile),
            })),
            hasMore: response.data.hasMore,
        };
    }
    extractFindTilesMetaFromCatalog(feature) {
        if (!feature) {
            return {};
        }
        return {
            orbitDirection: feature.properties['sat:orbit_state'].toUpperCase(),
            polarization: feature.properties['polarization'],
            acquisitionMode: feature.properties['sar:instrument_mode'],
            resolution: feature.properties['resolution'],
        };
    }
    getFindTilesAdditionalParameters() {
        const findTilesDatasetParameters = {
            type: this.dataset.datasetParametersType,
            acquisitionMode: this.acquisitionMode,
            polarization: this.polarization,
            orbitDirection: this.orbitDirection,
            resolution: this.resolution,
        };
        return {
            maxCloudCoverPercent: null,
            datasetParameters: findTilesDatasetParameters,
        };
    }
    findTilesInner(bbox, fromTime, toTime, maxCount = null, offset = null, reqConfig, intersects) {
        const _super = Object.create(null, {
            findTilesInner: { get: () => super.findTilesInner }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield this.updateLayerFromServiceIfNeeded(reqConfig);
            const response = yield _super.findTilesInner.call(this, bbox, fromTime, toTime, maxCount, offset, reqConfig, intersects);
            return response;
        });
    }
    getFindDatesUTCAdditionalParameters(reqConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = {
                datasetParameters: {
                    type: this.dataset.datasetParametersType,
                    acquisitionMode: this.acquisitionMode,
                    polarization: this.polarization,
                    resolution: this.resolution,
                },
            };
            if (this.orbitDirection !== null) {
                result.datasetParameters.orbitDirection = this.orbitDirection;
            }
            return result;
        });
    }
    getTileLinks(tile) {
        return [
            {
                target: tile.dataUri,
                type: exports.LinkType.AWS,
            },
        ];
    }
    createCatalogFilterQuery(maxCloudCoverPercent, datasetParameters) {
        let result = Object.assign({}, super.createCatalogFilterQuery(maxCloudCoverPercent, datasetParameters));
        if (datasetParameters) {
            let args = [];
            if (datasetParameters.acquisitionMode) {
                args.push({
                    op: '=',
                    args: [{ property: 'sar:instrument_mode' }, datasetParameters.acquisitionMode],
                });
            }
            if (datasetParameters.polarization) {
                args.push({
                    op: '=',
                    args: [{ property: 's1:polarization' }, datasetParameters.polarization],
                });
            }
            if (datasetParameters.resolution) {
                args.push({
                    op: '=',
                    args: [{ property: 's1:resolution' }, datasetParameters.resolution],
                });
            }
            if (datasetParameters.orbitDirection) {
                args.push({
                    op: '=',
                    args: [{ property: 'sat:orbit_state' }, datasetParameters.orbitDirection],
                });
            }
            result.op = 'and';
            result.args = args;
        }
        return result && Object.keys(result).length > 0 ? result : null;
    }
    getTileLinksFromCatalog(feature) {
        const { assets } = feature;
        let result = super.getTileLinksFromCatalog(feature);
        // for some reason data link is stored differently as in other datasets (s3 instead of data)
        if (assets.s3 && assets.s3.href) {
            result.push({ target: assets.s3.href, type: exports.LinkType.AWS });
        }
        return result;
    }
}

// same as AbstractSentinelHubV3Layer, but with maxCloudCoverPercent (for layers which support it)
class AbstractSentinelHubV3WithCCLayer extends AbstractSentinelHubV3Layer {
    constructor(_a) {
        var { maxCloudCoverPercent = 100 } = _a, rest = __rest(_a, ["maxCloudCoverPercent"]);
        super(rest);
        this.maxCloudCoverPercent = maxCloudCoverPercent;
    }
    getWmsGetMapUrlAdditionalParameters() {
        return Object.assign(Object.assign({}, super.getWmsGetMapUrlAdditionalParameters()), { maxcc: this.maxCloudCoverPercent });
    }
    _updateProcessingGetMapPayload(payload, datasetSeqNo = 0) {
        const _super = Object.create(null, {
            _updateProcessingGetMapPayload: { get: () => super._updateProcessingGetMapPayload }
        });
        return __awaiter(this, void 0, void 0, function* () {
            payload = yield _super._updateProcessingGetMapPayload.call(this, payload);
            payload.input.data[datasetSeqNo].dataFilter.maxCloudCoverage = this.maxCloudCoverPercent;
            return payload;
        });
    }
    extractFindTilesMetaFromCatalog(feature) {
        let result = {};
        if (!feature) {
            return result;
        }
        result = Object.assign(Object.assign({}, super.extractFindTilesMetaFromCatalog(feature)), { cloudCoverPercent: feature.properties['eo:cloud_cover'] });
        return result;
    }
    getFindDatesUTCAdditionalParameters(reqConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.maxCloudCoverPercent !== null && this.maxCloudCoverPercent !== undefined
                ? {
                    maxCloudCoverage: this.maxCloudCoverPercent / 100,
                }
                : {};
        });
    }
    getStatsAdditionalParameters() {
        return {
            maxcc: this.maxCloudCoverPercent,
        };
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    extractFindTilesMeta(tile) {
        return Object.assign(Object.assign({}, super.extractFindTilesMeta(tile)), { cloudCoverPercent: tile.cloudCoverPercentage });
    }
    createCatalogFilterQuery(maxCloudCoverPercent, datasetParameters) {
        let result = Object.assign({}, super.createCatalogFilterQuery(maxCloudCoverPercent, datasetParameters));
        if (maxCloudCoverPercent !== null && maxCloudCoverPercent !== undefined) {
            result['op'] = '<=';
            result['args'] = [
                {
                    property: 'eo:cloud_cover',
                },
                maxCloudCoverPercent,
            ];
        }
        return result && Object.keys(result).length > 0 ? result : null;
    }
    getFindTilesAdditionalParameters() {
        return {
            maxCloudCoverPercent: this.maxCloudCoverPercent,
            datasetParameters: null,
        };
    }
}

class S2L2ALayer extends AbstractSentinelHubV3WithCCLayer {
    constructor() {
        super(...arguments);
        this.dataset = DATASET_S2L2A;
    }
    _updateProcessingGetMapPayload(payload, datasetSeqNo = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            payload.input.data[datasetSeqNo].dataFilter.maxCloudCoverage = this.maxCloudCoverPercent;
            return payload;
        });
    }
    createPreviewLinkFromDataUri(dataUri) {
        return {
            // S-2 L2A doesn't have previews, but we can use corresponding L1C ones instead:
            target: `https://roda.sentinel-hub.com/sentinel-s2-l1c/tiles${dataUri}preview.jpg`,
            type: exports.LinkType.PREVIEW,
        };
    }
    getTileLinks(tile) {
        return [
            {
                target: tile.dataUri,
                type: exports.LinkType.AWS,
            },
            this.createPreviewLinkFromDataUri(`${tile.dataUri.split('tiles')[1]}/`),
        ];
    }
    getTileLinksFromCatalog(feature) {
        let result = super.getTileLinksFromCatalog(feature);
        if (feature && feature.assets && feature.assets.data) {
            const dataUri = feature.assets.data.href.split('tiles')[1];
            result.push(this.createPreviewLinkFromDataUri(dataUri));
        }
        return result;
    }
    extractFindTilesMeta(tile) {
        return Object.assign(Object.assign({}, super.extractFindTilesMeta(tile)), { tileId: tile.id, MGRSLocation: tile.dataUri
                .split('/')
                .slice(4, 7)
                .join('') });
    }
    extractFindTilesMetaFromCatalog(feature) {
        let result = super.extractFindTilesMetaFromCatalog(feature);
        if (feature.assets && feature.assets.data && feature.assets.data.href) {
            result.MGRSLocation = feature.assets.data.href
                .split('/')
                .slice(4, 7)
                .join('');
        }
        return result;
    }
}

class S2L1CLayer extends AbstractSentinelHubV3WithCCLayer {
    constructor() {
        super(...arguments);
        this.dataset = DATASET_S2L1C;
    }
    getTileLinks(tile) {
        return [
            {
                target: tile.dataUri,
                type: exports.LinkType.AWS,
            },
            {
                target: `https://roda.sentinel-hub.com/sentinel-s2-l1c/tiles${tile.dataUri.split('tiles')[1]}/preview.jpg`,
                type: exports.LinkType.PREVIEW,
            },
        ];
    }
    extractFindTilesMeta(tile) {
        return Object.assign(Object.assign({}, super.extractFindTilesMeta(tile)), { tileId: tile.id, MGRSLocation: tile.dataUri
                .split('/')
                .slice(4, 7)
                .join('') });
    }
    extractFindTilesMetaFromCatalog(feature) {
        let result = super.extractFindTilesMetaFromCatalog(feature);
        if (feature.assets && feature.assets.data && feature.assets.data.href) {
            result.MGRSLocation = feature.assets.data.href
                .split('/')
                .slice(4, 7)
                .join('');
        }
        return result;
    }
}

(function (S3SLSTRView) {
    S3SLSTRView["NADIR"] = "NADIR";
    S3SLSTRView["OBLIQUE"] = "OBLIQUE";
})(exports.S3SLSTRView || (exports.S3SLSTRView = {}));
class S3SLSTRLayer extends AbstractSentinelHubV3WithCCLayer {
    constructor(_a) {
        var { view = exports.S3SLSTRView.NADIR } = _a, rest = __rest(_a, ["view"]);
        super(rest);
        this.dataset = DATASET_S3SLSTR;
        // images that are not DESCENDING appear empty:
        this.orbitDirection = exports.OrbitDirection.DESCENDING;
        this.view = view;
    }
    _updateProcessingGetMapPayload(payload, datasetSeqNo = 0) {
        const _super = Object.create(null, {
            _updateProcessingGetMapPayload: { get: () => super._updateProcessingGetMapPayload }
        });
        return __awaiter(this, void 0, void 0, function* () {
            payload = yield _super._updateProcessingGetMapPayload.call(this, payload);
            payload.input.data[datasetSeqNo].dataFilter.orbitDirection = this.orbitDirection;
            payload.input.data[datasetSeqNo].processing.view = this.view;
            return payload;
        });
    }
    convertResponseFromSearchIndex(response) {
        return {
            tiles: response.data.tiles.map(tile => ({
                geometry: tile.dataGeometry,
                sensingTime: moment.utc(tile.sensingTime).toDate(),
                meta: this.extractFindTilesMeta(tile),
                links: this.getTileLinks(tile),
            })),
            hasMore: response.data.hasMore,
        };
    }
    getFindTilesAdditionalParameters() {
        const findTilesDatasetParameters = {
            type: this.dataset.shProcessingApiDatasourceAbbreviation,
            orbitDirection: this.orbitDirection,
            view: this.view,
        };
        return {
            maxCloudCoverPercent: this.maxCloudCoverPercent,
            datasetParameters: findTilesDatasetParameters,
        };
    }
    getFindDatesUTCAdditionalParameters(reqConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = {
                datasetParameters: {
                    type: this.dataset.datasetParametersType,
                    view: this.view,
                },
            };
            if (this.orbitDirection !== null) {
                result.datasetParameters.orbitDirection = this.orbitDirection;
            }
            if (this.maxCloudCoverPercent !== null) {
                result.maxCloudCoverage = this.maxCloudCoverPercent / 100;
            }
            return result;
        });
    }
    getTileLinks(tile) {
        return [
            {
                target: tile.originalId.replace('EODATA', '/eodata'),
                type: exports.LinkType.CREODIAS,
            },
            {
                target: `https://finder.creodias.eu/files${tile.originalId.replace('EODATA', '')}/${tile.productName.replace('.SEN3', '')}-ql.jpg`,
                type: exports.LinkType.PREVIEW,
            },
        ];
    }
    extractFindTilesMeta(tile) {
        return Object.assign(Object.assign({}, super.extractFindTilesMeta(tile)), { orbitDirection: tile.orbitDirection });
    }
    extractFindTilesMetaFromCatalog(feature) {
        let result = {};
        if (!feature) {
            return result;
        }
        result = Object.assign(Object.assign({}, super.extractFindTilesMetaFromCatalog(feature)), { orbitDirection: feature.properties['sat:orbit_state'] });
        return result;
    }
    getTileLinksFromCatalog(feature) {
        const { assets } = feature;
        let result = super.getTileLinksFromCatalog(feature);
        if (assets.data && assets.data.href) {
            result.push({ target: assets.data.href.replace('s3://EODATA', '/eodata'), type: exports.LinkType.CREODIAS });
        }
        return result;
    }
}

class S3OLCILayer extends AbstractSentinelHubV3Layer {
    constructor() {
        super(...arguments);
        this.dataset = DATASET_S3OLCI;
    }
    convertResponseFromSearchIndex(response) {
        return {
            tiles: response.data.tiles.map(tile => ({
                geometry: tile.dataGeometry,
                sensingTime: moment.utc(tile.sensingTime).toDate(),
                meta: {},
                links: this.getTileLinks(tile),
            })),
            hasMore: response.data.hasMore,
        };
    }
    getTileLinks(tile) {
        return [
            {
                target: tile.originalId.replace('EODATA', '/eodata'),
                type: exports.LinkType.CREODIAS,
            },
            {
                target: `https://finder.creodias.eu/files${tile.originalId.replace('EODATA', '')}/${tile.productName.replace('.SEN3', '')}-ql.jpg`,
                type: exports.LinkType.PREVIEW,
            },
        ];
    }
    getTileLinksFromCatalog(feature) {
        const { assets } = feature;
        let result = super.getTileLinksFromCatalog(feature);
        if (assets.data && assets.data.href) {
            result.push({ target: assets.data.href.replace('s3://DIAS', '/dias'), type: exports.LinkType.CREODIAS });
        }
        return result;
    }
}

/*
  S-5P is a bit special in that we need to supply productType when searching
  for tiles, but we don't need it for getMap() (it is determined automatically
  from the evalscript).
*/
var ProductType;
(function (ProductType) {
    ProductType["AER_AI"] = "AER_AI";
    ProductType["CLOUD"] = "CLOUD";
    ProductType["CO"] = "CO";
    ProductType["HCHO"] = "HCHO";
    ProductType["NO2"] = "NO2";
    ProductType["O3"] = "O3";
    ProductType["SO2"] = "SO2";
    ProductType["CH4"] = "CH4";
})(ProductType || (ProductType = {}));
class S5PL2Layer extends AbstractSentinelHubV3Layer {
    constructor({ instanceId = null, layerId = null, evalscript = null, evalscriptUrl = null, dataProduct = null, title = null, description = null, legendUrl = null, productType = null, maxCloudCoverPercent = 100, minQa = null, }) {
        super({ instanceId, layerId, evalscript, evalscriptUrl, dataProduct, title, description, legendUrl });
        this.dataset = DATASET_S5PL2;
        this.productType = productType;
        this.maxCloudCoverPercent = maxCloudCoverPercent;
        this.minQa = minQa;
    }
    _updateProcessingGetMapPayload(payload, datasetSeqNo = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            payload.input.data[datasetSeqNo].dataFilter.maxCloudCoverage = this.maxCloudCoverPercent;
            if (this.minQa !== null) {
                payload.input.data[datasetSeqNo].processing.minQa = this.minQa;
            }
            // note that productType is not present among the parameters:
            // https://docs.sentinel-hub.com/api/latest/reference/#operation/process
            return payload;
        });
    }
    convertResponseFromSearchIndex(response) {
        return {
            tiles: response.data.tiles.map(tile => {
                return {
                    geometry: tile.tileDrawRegionGeometry,
                    sensingTime: moment.utc(tile.sensingTime).toDate(),
                    meta: {},
                    links: this.getTileLinks(tile),
                };
            }),
            hasMore: response.data.hasMore,
        };
    }
    getFindTilesAdditionalParameters() {
        const findTilesDatasetParameters = {
            type: this.dataset.datasetParametersType,
            productType: this.productType,
        };
        return {
            maxCloudCoverPercent: this.maxCloudCoverPercent,
            datasetParameters: findTilesDatasetParameters,
        };
    }
    findTilesInner(bbox, fromTime, toTime, maxCount = null, offset = null, reqConfig, intersects) {
        const _super = Object.create(null, {
            findTilesInner: { get: () => super.findTilesInner }
        });
        return __awaiter(this, void 0, void 0, function* () {
            if (this.productType === null) {
                throw new Error('Parameter productType must be specified!');
            }
            const response = yield _super.findTilesInner.call(this, bbox, fromTime, toTime, maxCount, offset, reqConfig, intersects);
            return response;
        });
    }
    getFindDatesUTCAdditionalParameters(reqConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = {
                datasetParameters: {
                    type: this.dataset.datasetParametersType,
                },
            };
            if (this.productType !== null) {
                result.datasetParameters.productType = this.productType;
            }
            if (this.maxCloudCoverPercent !== null) {
                result.maxCloudCoverage = this.maxCloudCoverPercent / 100;
            }
            return result;
        });
    }
    getStatsAdditionalParameters() {
        return {
            maxcc: this.maxCloudCoverPercent,
        };
    }
    getTileLinks(tile) {
        return [
            {
                target: tile.originalId.replace('EODATA', '/eodata'),
                type: exports.LinkType.CREODIAS,
            },
        ];
    }
    createCatalogFilterQuery(maxCloudCoverPercent, datasetParameters) {
        let result = Object.assign({}, super.createCatalogFilterQuery(maxCloudCoverPercent, datasetParameters));
        if (datasetParameters && datasetParameters.productType) {
            result['op'] = '=';
            result['args'] = [{ property: 's5p:type' }, datasetParameters.productType];
        }
        return result && Object.keys(result).length > 0 ? result : null;
    }
    getTileLinksFromCatalog(feature) {
        const { assets } = feature;
        let result = super.getTileLinksFromCatalog(feature);
        if (assets.data) {
            result.push({ target: assets.data.href.replace('s3://EODATA', '/eodata'), type: exports.LinkType.CREODIAS });
        }
        return result;
    }
}

class MODISLayer extends AbstractSentinelHubV3Layer {
    constructor() {
        super(...arguments);
        this.dataset = DATASET_MODIS;
    }
}

class AbstractDEMLayer extends AbstractSentinelHubV3Layer {
    constructor(_a) {
        var { demInstance, egm, clampNegative } = _a, rest = __rest(_a, ["demInstance", "egm", "clampNegative"]);
        super(rest);
        this.egm = null;
        this.clampNegative = null;
        this.layerUpdatedFromService = false;
        this.demInstance = demInstance;
        this.egm = egm;
        this.clampNegative = clampNegative;
    }
    shouldUpdateLayerFromService() {
        //don't update layer info if layer has already been updated
        if (this.layerUpdatedFromService) {
            return false;
        }
        //update from service if any of DEM parameters is not set
        return !(this.demInstance && isDefined(this.egm) && isDefined(this.clampNegative));
    }
    updateLayerFromServiceIfNeeded(reqConfig) {
        const _super = Object.create(null, {
            updateLayerFromServiceIfNeeded: { get: () => super.updateLayerFromServiceIfNeeded }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield ensureTimeout((innerReqConfig) => __awaiter(this, void 0, void 0, function* () {
                if (!(this.instanceId && this.layerId)) {
                    return;
                }
                //update properties defined on parent layer
                yield _super.updateLayerFromServiceIfNeeded.call(this, innerReqConfig);
                //update DEM specific properties if they're not set
                if (this.shouldUpdateLayerFromService()) {
                    const layerParams = yield this.fetchLayerParamsFromSHServiceV3(innerReqConfig);
                    if (!this.demInstance) {
                        this.demInstance = layerParams['demInstance'] ? layerParams['demInstance'] : null;
                    }
                    if (!isDefined(this.clampNegative)) {
                        this.clampNegative = layerParams['clampNegative'] ? layerParams['clampNegative'] : null;
                    }
                    if (!isDefined(this.egm)) {
                        //this in not a typo. Configuration service returns `EGM`, process api accepts `egm`
                        this.egm = layerParams['EGM'] ? layerParams['EGM'] : null;
                    }
                    this.layerUpdatedFromService = true;
                }
            }), reqConfig);
        });
    }
    getMap(params, api, reqConfig) {
        const _super = Object.create(null, {
            getMap: { get: () => super.getMap }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return yield ensureTimeout((innerReqConfig) => __awaiter(this, void 0, void 0, function* () {
                params = yield this.decideJpegOrPng(params, innerReqConfig);
                if (api === exports.ApiType.PROCESSING) {
                    yield this.updateLayerFromServiceIfNeeded(innerReqConfig);
                }
                return yield _super.getMap.call(this, params, api, innerReqConfig);
            }), reqConfig);
        });
    }
    _updateProcessingGetMapPayload(payload, datasetSeqNo = 0) {
        const _super = Object.create(null, {
            _updateProcessingGetMapPayload: { get: () => super._updateProcessingGetMapPayload }
        });
        return __awaiter(this, void 0, void 0, function* () {
            payload = yield _super._updateProcessingGetMapPayload.call(this, payload);
            if (this.demInstance) {
                payload.input.data[datasetSeqNo].dataFilter.demInstance = this.demInstance;
            }
            if (isDefined(this.egm)) {
                payload.input.data[datasetSeqNo].processing.egm = this.egm;
            }
            //clampNegative is MAPZEN specific option
            if ((!this.demInstance || this.demInstance === exports.DEMInstanceType.MAPZEN) && isDefined(this.clampNegative)) {
                payload.input.data[datasetSeqNo].processing.clampNegative = this.clampNegative;
            }
            //DEM doesn't support dates and mosaickingOrder so they can be removed from payload
            delete payload.input.data[datasetSeqNo].dataFilter.mosaickingOrder;
            delete payload.input.data[datasetSeqNo].dataFilter.timeRange;
            return payload;
        });
    }
    bboxToPolygon(bbox) {
        const west = Number(bbox.minX);
        const south = Number(bbox.minY);
        const east = Number(bbox.maxX);
        const north = Number(bbox.maxY);
        const southWest = [west, south];
        const northWest = [west, north];
        const northEast = [east, north];
        const southEast = [east, south];
        return {
            type: 'Polygon',
            crs: {
                type: 'name',
                properties: {
                    name: bbox.crs.urn,
                },
            },
            coordinates: [[southWest, southEast, northEast, northWest, southWest]],
        };
    }
    // Since DEM dataset doesn't have dates/tiles we mock tiles by always returning
    //one "tile" which is covering input bounding box on the date of intervals end.
    findTiles(bbox, fromTime, // eslint-disable-line @typescript-eslint/no-unused-vars
    toTime, maxCount = null, // eslint-disable-line @typescript-eslint/no-unused-vars
    offset = null, // eslint-disable-line @typescript-eslint/no-unused-vars
    reqConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            const tiles = [];
            let hasMore = false;
            tiles.push({
                geometry: this.bboxToPolygon(bbox),
                sensingTime: moment.utc(toTime).toDate(),
                meta: {},
            });
            return { tiles: tiles, hasMore: hasMore };
        });
    }
    findDatesUTC(bbox, fromTime, toTime, reqConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            const { tiles } = yield this.findTiles(bbox, fromTime, toTime);
            return tiles.map(tile => moment.utc(tile.sensingTime).toDate());
        });
    }
}
const isDefined = (value) => value !== null && value !== undefined;

class DEMAWSUSLayer extends AbstractDEMLayer {
    constructor(_a) {
        var { demInstance } = _a, rest = __rest(_a, ["demInstance"]);
        super(rest);
        this.dataset = DATASET_AWSUS_DEM;
        if (!demInstance || demInstance === exports.DEMInstanceType.MAPZEN) {
            this.demInstance = exports.DEMInstanceType.MAPZEN;
        }
        else {
            throw new Error(`DEMAWSUSLayer does not support demInstance ${demInstance}`);
        }
    }
}

class DEMLayer extends AbstractDEMLayer {
    constructor() {
        super(...arguments);
        this.dataset = DATASET_AWS_DEM;
    }
}

class AbstractLandsat8Layer extends AbstractSentinelHubV3WithCCLayer {
    getTileLinks(tile) {
        return [
            {
                target: tile.dataUri,
                type: exports.LinkType.AWS,
            },
            {
                target: `${tile.dataUri}_thumb_small.jpg`,
                type: exports.LinkType.PREVIEW,
            },
        ];
    }
    extractFindTilesMeta(tile) {
        return Object.assign(Object.assign({}, super.extractFindTilesMeta(tile)), { sunElevation: tile.sunElevation });
    }
    extractFindTilesMetaFromCatalog(feature) {
        return Object.assign(Object.assign({}, super.extractFindTilesMetaFromCatalog(feature)), { sunElevation: feature.properties['view:sun_elevation'], projEpsg: feature.properties['proj:epsg'] });
    }
    getTileLinksFromCatalog(feature) {
        const { assets } = feature;
        let result = super.getTileLinksFromCatalog(feature);
        if (assets.data && assets.data.href) {
            result.push({
                target: assets.data.href.replace('/index.html', `/${feature.id}_thumb_small.jpg`),
                type: exports.LinkType.PREVIEW,
            });
        }
        return result;
    }
}

class Landsat8AWSLayer extends AbstractLandsat8Layer {
    constructor() {
        super(...arguments);
        this.dataset = DATASET_AWS_L8L1C;
    }
}

class BYOCLayer extends AbstractSentinelHubV3Layer {
    constructor({ instanceId = null, layerId = null, evalscript = null, evalscriptUrl = null, dataProduct = null, title = null, description = null, collectionId = null, locationId = null, subType = null, }) {
        super({ instanceId, layerId, evalscript, evalscriptUrl, dataProduct, title, description });
        this.dataset = DATASET_BYOC;
        this.collectionId = collectionId;
        this.locationId = locationId;
        this.subType = subType;
    }
    updateLayerFromServiceIfNeeded(reqConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            yield ensureTimeout((innerReqConfig) => __awaiter(this, void 0, void 0, function* () {
                if (this.collectionId !== null && this.locationId !== null) {
                    return;
                }
                if (this.instanceId === null || this.layerId === null) {
                    throw new Error("Some of layer parameters (collectionId, locationId) are not set and can't be fetched from service because instanceId and layerId are not available");
                }
                if (this.collectionId === null || this.evalscript === null || this.subType === null) {
                    const layerParams = yield this.fetchLayerParamsFromSHServiceV3(innerReqConfig);
                    this.collectionId = layerParams['collectionId'];
                    if (!this.legend) {
                        this.legend = layerParams['legend'] ? layerParams['legend'] : null;
                    }
                    if (!this.evalscript) {
                        this.evalscript = layerParams['evalscript'] ? layerParams['evalscript'] : null;
                    }
                    if (!this.subType) {
                        this.subType = layerParams['subType'] ? layerParams['subType'] : null;
                    }
                    if (!this.mosaickingOrder && layerParams.mosaickingOrder) {
                        this.mosaickingOrder = layerParams.mosaickingOrder;
                    }
                    if (!this.upsampling && layerParams.upsampling) {
                        this.upsampling = layerParams.upsampling;
                    }
                    if (!this.downsampling && layerParams.downsampling) {
                        this.downsampling = layerParams.downsampling;
                    }
                }
                if (this.locationId === null) {
                    if (this.subType !== exports.BYOCSubTypes.ZARR) {
                        const url = `https://services.sentinel-hub.com/api/v1/metadata/collection/${this.getTypeId()}`;
                        const headers = { Authorization: `Bearer ${getAuthToken()}` };
                        const res = yield axios.get(url, Object.assign({ responseType: 'json', headers: headers }, getAxiosReqParams(innerReqConfig, CACHE_CONFIG_30MIN)));
                        this.locationId = res.data.location.id;
                    }
                    else {
                        // Obtaining location ID is currently not possible for ZARR.
                        // We hardcode AWS EU as the only currently supported location.
                        this.locationId = exports.LocationIdSHv3.awsEuCentral1;
                    }
                }
            }), reqConfig);
        });
    }
    getMap(params, api, reqConfig) {
        const _super = Object.create(null, {
            getMap: { get: () => super.getMap }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return yield ensureTimeout((innerReqConfig) => __awaiter(this, void 0, void 0, function* () {
                params = yield this.decideJpegOrPng(params, innerReqConfig);
                yield this.updateLayerFromServiceIfNeeded(innerReqConfig);
                return yield _super.getMap.call(this, params, api, innerReqConfig);
            }), reqConfig);
        });
    }
    _updateProcessingGetMapPayload(payload, datasetSeqNo = 0, reqConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.updateLayerFromServiceIfNeeded(reqConfig);
            payload.input.data[datasetSeqNo].type = this.getTypeId();
            return payload;
        });
    }
    convertResponseFromSearchIndex(response) {
        return {
            tiles: response.data.tiles.map(tile => {
                return {
                    geometry: tile.dataGeometry,
                    sensingTime: moment.utc(tile.sensingTime).toDate(),
                    meta: {},
                };
            }),
            hasMore: response.data.hasMore,
        };
    }
    getFindTilesAdditionalParameters() {
        const findTilesDatasetParameters = {
            type: 'BYOC',
            collectionId: this.collectionId,
        };
        return {
            maxCloudCoverPercent: null,
            datasetParameters: findTilesDatasetParameters,
        };
    }
    findTilesInner(bbox, fromTime, toTime, maxCount = null, offset = null, reqConfig, intersects) {
        const _super = Object.create(null, {
            findTilesInner: { get: () => super.findTilesInner }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield this.updateLayerFromServiceIfNeeded(reqConfig);
            const response = yield _super.findTilesInner.call(this, bbox, fromTime, toTime, maxCount, offset, reqConfig, intersects);
            return response;
        });
    }
    getShServiceHostname() {
        if (this.locationId === null) {
            throw new Error('Parameter locationId must be specified');
        }
        const shServiceHostname = SHV3_LOCATIONS_ROOT_URL[this.locationId];
        return shServiceHostname;
    }
    getTypeId() {
        return `${this.getTypePrefix()}-${this.collectionId}`;
    }
    getTypePrefix() {
        switch (this.subType) {
            case exports.BYOCSubTypes.BATCH:
                return 'batch';
            case exports.BYOCSubTypes.ZARR:
                return 'zarr';
            default:
                return 'byoc';
        }
    }
    getCatalogCollectionId() {
        return this.getTypeId();
    }
    getSearchIndexUrl() {
        const rootUrl = this.getShServiceHostname();
        const searchIndexUrl = `${rootUrl}byoc/v3/collections/CUSTOM/searchIndex`;
        return searchIndexUrl;
    }
    createSearchIndexRequestConfig() {
        return {};
    }
    getFindDatesUTCUrl(reqConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.updateLayerFromServiceIfNeeded(reqConfig);
            const rootUrl = SHV3_LOCATIONS_ROOT_URL[this.locationId];
            const findDatesUTCUrl = `${rootUrl}byoc/v3/collections/CUSTOM/findAvailableData`;
            return findDatesUTCUrl;
        });
    }
    getFindDatesUTCAdditionalParameters(reqConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.updateLayerFromServiceIfNeeded(reqConfig);
            const result = {
                datasetParameters: {
                    type: this.dataset.datasetParametersType,
                    collectionId: this.collectionId,
                },
            };
            return result;
        });
    }
    getStats(params, reqConfig = {}, statsProvider = exports.StatisticsProviderType.FIS) {
        const _super = Object.create(null, {
            getStats: { get: () => super.getStats }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield this.updateLayerFromServiceIfNeeded();
            return _super.getStats.call(this, params, reqConfig, statsProvider);
        });
    }
    getAvailableBands(reqConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            const bandsResponseData = yield ensureTimeout((innerReqConfig) => __awaiter(this, void 0, void 0, function* () {
                if (this.collectionId === null) {
                    throw new Error('Parameter collectionId is not set');
                }
                if (this.subType === exports.BYOCSubTypes.ZARR) {
                    throw new Error('Fetching available bands for ZARR not supported.');
                }
                const url = `https://services.sentinel-hub.com/api/v1/metadata/collection/${this.getTypeId()}`;
                const headers = { Authorization: `Bearer ${getAuthToken()}` };
                const res = yield axios.get(url, Object.assign({ responseType: 'json', headers: headers }, getAxiosReqParams(innerReqConfig, CACHE_CONFIG_30MIN)));
                return res.data.bands;
            }), reqConfig);
            return bandsResponseData;
        });
    }
}

class S1GRDEOCloudLayer extends AbstractSentinelHubV1OrV2Layer {
    constructor({ instanceId = null, layerId = null, evalscript = null, evalscriptUrl = null, mosaickingOrder = null, title = null, description = null, acquisitionMode = null, polarization = null, orbitDirection = null, }) {
        super({ instanceId, layerId, evalscript, evalscriptUrl, mosaickingOrder, title, description });
        this.dataset = DATASET_EOCLOUD_S1GRD;
        this.orbitDirection = null;
        // it is not possible to determine these parameters by querying the service, because there
        // is no endpoint which would return them:
        if ((evalscript || evalscriptUrl) && (!acquisitionMode || !polarization)) {
            throw new Error('Parameters acquisitionMode and polarization are mandatory when using evalscript');
        }
        this.acquisitionMode = acquisitionMode;
        this.polarization = polarization;
        this.orbitDirection = orbitDirection;
    }
    static makeLayer(layerInfo, instanceId, layerId, evalscript, evalscriptUrl, title, description) {
        let acquisitionMode = null;
        let polarization = null;
        switch (layerInfo.settings.datasourceName) {
            case 'S1':
                acquisitionMode = exports.AcquisitionMode.IW;
                polarization = exports.Polarization.DV; // SV is not available on EO Cloud
                break;
            case 'S1_EW':
                acquisitionMode = exports.AcquisitionMode.EW;
                polarization = exports.Polarization.DH;
                break;
            case 'S1_EW_SH':
                acquisitionMode = exports.AcquisitionMode.EW;
                polarization = exports.Polarization.SH;
                break;
            default:
                throw new Error(`Unknown datasourceName (${layerInfo.settings.datasourceName})`);
        }
        return new S1GRDEOCloudLayer({
            instanceId,
            layerId,
            evalscript,
            evalscriptUrl,
            title,
            description,
            acquisitionMode,
            polarization,
            orbitDirection: null,
        });
    }
    getEvalsource() {
        // ignore this.dataset.shWmsEvalsource and return the string based on acquisitionMode:
        if (this.acquisitionMode === exports.AcquisitionMode.IW && this.polarization === exports.Polarization.DV) {
            // note that on EO Cloud, for IW acquisition mode only DV is available (SV is not available)
            return 'S1';
        }
        if (this.acquisitionMode === exports.AcquisitionMode.EW && this.polarization === exports.Polarization.DH) {
            return 'S1_EW';
        }
        if (this.acquisitionMode === exports.AcquisitionMode.EW && this.polarization === exports.Polarization.SH) {
            return 'S1_EW_SH';
        }
        throw new Error(`This combination of acquisition mode and polarization (${this.acquisitionMode} / ${this.polarization}) is not available on EO Cloud`);
    }
    getFindTilesAdditionalParameters() {
        const result = {
            productType: 'GRD',
            acquisitionMode: this.acquisitionMode,
            polarization: this.polarization,
        };
        if (this.orbitDirection !== null) {
            result.orbitDirection = this.orbitDirection;
        }
        return result;
    }
    getFindDatesUTCAdditionalParameters(reqConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = {
                productType: 'GRD',
                acquisitionMode: this.acquisitionMode,
                polarization: this.polarization,
            };
            if (this.orbitDirection !== null) {
                result.orbitDirection = this.orbitDirection;
            }
            return result;
        });
    }
    getTileLinks(tile) {
        return [
            {
                target: tile.pathFragment,
                type: exports.LinkType.EOCLOUD,
            },
            {
                target: `https://finder.creodias.eu/files/${tile.pathFragment.split('eodata')[1]}/preview/quick-look.png`,
                type: exports.LinkType.PREVIEW,
            },
        ];
    }
}

// same as AbstractSentinelHubV1OrV2Layer, but with maxCloudCoverPercent (useful for Landsat datasets)
class AbstractSentinelHubV1OrV2WithCCLayer extends AbstractSentinelHubV1OrV2Layer {
    constructor(_a) {
        var { maxCloudCoverPercent = 100 } = _a, rest = __rest(_a, ["maxCloudCoverPercent"]);
        super(rest);
        this.maxCloudCoverPercent = maxCloudCoverPercent;
    }
    getWmsGetMapUrlAdditionalParameters() {
        return Object.assign(Object.assign({}, super.getWmsGetMapUrlAdditionalParameters()), { maxcc: this.maxCloudCoverPercent });
    }
    getFindTilesAdditionalParameters() {
        return {
            maxcc: this.maxCloudCoverPercent / 100,
        };
    }
    extractFindTilesMeta(tile) {
        return {
            cloudCoverPercent: tile.cloudCoverPercentage,
        };
    }
    getFindDatesUTCAdditionalParameters() {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                maxcc: this.maxCloudCoverPercent / 100,
            };
        });
    }
    getStatsAdditionalParameters() {
        return {
            maxcc: this.maxCloudCoverPercent,
        };
    }
}

class Landsat5EOCloudLayer extends AbstractSentinelHubV1OrV2WithCCLayer {
    constructor() {
        super(...arguments);
        this.dataset = DATASET_EOCLOUD_LANDSAT5;
    }
    static makeLayer(layerInfo, instanceId, layerId, evalscript, evalscriptUrl, title, description) {
        const maxCloudCoverPercent = layerInfo.settings.maxCC;
        return new Landsat5EOCloudLayer({
            instanceId,
            layerId,
            evalscript,
            evalscriptUrl,
            title,
            description,
            maxCloudCoverPercent,
        });
    }
    getTileLinks(tile) {
        return [
            {
                target: tile.pathFragment,
                type: exports.LinkType.EOCLOUD,
            },
            {
                target: `${tile.previewUrl.replace('eocloud', 'creodias')}.JPG`,
                type: exports.LinkType.PREVIEW,
            },
        ];
    }
    extractFindTilesMeta(tile) {
        return Object.assign(Object.assign({}, super.extractFindTilesMeta(tile)), { sunElevation: tile.sunElevation });
    }
}

class Landsat7EOCloudLayer extends AbstractSentinelHubV1OrV2WithCCLayer {
    constructor() {
        super(...arguments);
        this.dataset = DATASET_EOCLOUD_LANDSAT7;
    }
    static makeLayer(layerInfo, instanceId, layerId, evalscript, evalscriptUrl, title, description) {
        const maxCloudCoverPercent = layerInfo.settings.maxCC;
        return new Landsat7EOCloudLayer({
            instanceId,
            layerId,
            evalscript,
            evalscriptUrl,
            title,
            description,
            maxCloudCoverPercent,
        });
    }
    getTileLinks(tile) {
        return [
            {
                target: tile.pathFragment,
                type: exports.LinkType.EOCLOUD,
            },
            {
                target: `${tile.previewUrl.replace('eocloud', 'creodias')}.JPG`,
                type: exports.LinkType.PREVIEW,
            },
        ];
    }
    extractFindTilesMeta(tile) {
        return Object.assign(Object.assign({}, super.extractFindTilesMeta(tile)), { sunElevation: tile.sunElevation });
    }
}

class Landsat8EOCloudLayer extends AbstractSentinelHubV1OrV2WithCCLayer {
    constructor() {
        super(...arguments);
        this.dataset = DATASET_EOCLOUD_LANDSAT8;
    }
    static makeLayer(layerInfo, instanceId, layerId, evalscript, evalscriptUrl, title, description) {
        const maxCloudCoverPercent = layerInfo.settings.maxCC;
        return new Landsat8EOCloudLayer({
            instanceId,
            layerId,
            evalscript,
            evalscriptUrl,
            title,
            description,
            maxCloudCoverPercent,
        });
    }
    getTileLinks(tile) {
        return [
            {
                target: tile.pathFragment,
                type: exports.LinkType.EOCLOUD,
            },
            {
                target: `https://finder.creodias.eu/files${tile.pathFragment.replace('/eodata', '')}.png`,
                type: exports.LinkType.PREVIEW,
            },
        ];
    }
    extractFindTilesMeta(tile) {
        return Object.assign(Object.assign({}, super.extractFindTilesMeta(tile)), { sunElevation: tile.sunElevation });
    }
}

class EnvisatMerisEOCloudLayer extends AbstractSentinelHubV1OrV2Layer {
    constructor() {
        super(...arguments);
        this.dataset = DATASET_EOCLOUD_ENVISAT_MERIS;
    }
    static makeLayer(layerInfo, // eslint-disable-line @typescript-eslint/no-unused-vars
    instanceId, layerId, evalscript, evalscriptUrl, title, description) {
        return new EnvisatMerisEOCloudLayer({
            instanceId,
            layerId,
            evalscript,
            evalscriptUrl,
            title,
            description,
        });
    }
    getTileLinks(tile) {
        return [
            {
                target: tile.pathFragment,
                type: exports.LinkType.EOCLOUD,
            },
        ];
    }
}

class Landsat8AWSLOTL1Layer extends AbstractLandsat8Layer {
    constructor() {
        super(...arguments);
        this.dataset = DATASET_AWS_LOTL1;
    }
    getPreviewUrl(productId) {
        return `https://landsatlook.usgs.gov/gen-browse?size=thumb&type=refl&product_id=${productId}`;
    }
    getTileLinks(tile) {
        return [
            {
                target: tile.dataUri,
                type: exports.LinkType.AWS,
            },
            {
                target: this.getPreviewUrl(tile.originalId),
                type: exports.LinkType.PREVIEW,
            },
        ];
    }
    getTileLinksFromCatalog(feature) {
        const { assets } = feature;
        let result = [];
        if (assets && assets.data) {
            result.push({ target: assets.data.href, type: exports.LinkType.AWS });
        }
        result.push({
            target: this.getPreviewUrl(feature.id),
            type: exports.LinkType.PREVIEW,
        });
        return result;
    }
}

class Landsat8AWSLOTL2Layer extends AbstractLandsat8Layer {
    constructor() {
        super(...arguments);
        this.dataset = DATASET_AWS_LOTL2;
    }
    getTileLinks(tile) {
        return [
            {
                target: tile.dataUri,
                type: exports.LinkType.AWS,
            },
        ];
    }
    getTileLinksFromCatalog(feature) {
        const { assets } = feature;
        let result = [];
        if (assets && assets.data) {
            result.push({ target: assets.data.href, type: exports.LinkType.AWS });
        }
        return result;
    }
}

class Landsat45AWSLTML1Layer extends AbstractSentinelHubV3WithCCLayer {
    constructor() {
        super(...arguments);
        this.dataset = DATASET_AWS_LTML1;
    }
}

class Landsat45AWSLTML2Layer extends AbstractSentinelHubV3WithCCLayer {
    constructor() {
        super(...arguments);
        this.dataset = DATASET_AWS_LTML2;
    }
}

class Landsat15AWSLMSSL1Layer extends AbstractSentinelHubV3WithCCLayer {
    constructor() {
        super(...arguments);
        this.dataset = DATASET_AWS_LMSSL1;
    }
}

class Landsat7AWSLETML1Layer extends AbstractSentinelHubV3WithCCLayer {
    constructor() {
        super(...arguments);
        this.dataset = DATASET_AWS_LETML1;
    }
}

class Landsat7AWSLETML2Layer extends AbstractSentinelHubV3WithCCLayer {
    constructor() {
        super(...arguments);
        this.dataset = DATASET_AWS_LETML2;
    }
}

const DEGREE_TO_RADIAN = Math.PI / 180;
const RADIAN_TO_DEGREE = 180 / Math.PI;
const EQUATOR_RADIUS = 6378137.0;
function toWgs84(xy) {
    return [
        (xy[0] * RADIAN_TO_DEGREE) / EQUATOR_RADIUS,
        (Math.PI * 0.5 - 2.0 * Math.atan(Math.exp(-xy[1] / EQUATOR_RADIUS))) * RADIAN_TO_DEGREE,
    ];
}
function bboxToWidthAndZoom(bbox, requestedImageWidth, tileMatrices) {
    if (bbox.crs === CRS_EPSG3857) {
        const topLeft = toWgs84([bbox.minX, bbox.minY]);
        const bottomRight = toWgs84([bbox.maxX, bbox.maxY]);
        bbox = new BBox(CRS_EPSG4326, topLeft[0], topLeft[1], bottomRight[0], bottomRight[1]);
    }
    // Find the first zoom level where the requested imageWidth is lower than the pixel width of the bbox
    // or the last availble zoom level provided by the TileMatrixSet in getCapabilities
    for (let [index, tileMatrix] of tileMatrices.entries()) {
        const { matrixWidth, tileWidth, tileHeight, zoom } = tileMatrix;
        const mapWidth = tileWidth * matrixWidth;
        const degreeDiff = Math.abs(bbox.maxX - bbox.minX);
        const pixelsPerDegree = tileWidth / 360;
        const bboxPixelWidth = Math.floor(((pixelsPerDegree * mapWidth) / tileWidth) * degreeDiff);
        if (requestedImageWidth <= bboxPixelWidth || index === tileMatrices.length - 1) {
            return { zoom: zoom, bboxPixelWidth: bboxPixelWidth, tileWidth: tileWidth, tileHeight: tileHeight };
        }
    }
}
function bboxToXyzGrid(bbox, imageWidth, imageHeight, tileMatrices) {
    if (bbox.crs === CRS_EPSG3857) {
        const topLeft = toWgs84([bbox.minX, bbox.minY]);
        const bottomRight = toWgs84([bbox.maxX, bbox.maxY]);
        bbox = new BBox(CRS_EPSG4326, topLeft[0], topLeft[1], bottomRight[0], bottomRight[1]);
    }
    const { zoom, bboxPixelWidth, tileWidth: tileSize } = bboxToWidthAndZoom(bbox, imageWidth, tileMatrices);
    const topLeft = [bbox.minX, bbox.maxY];
    const bottomRight = [bbox.maxX, bbox.minY];
    const { pixelX: topLeftPixelX, pixelY: topLeftpixelY } = toPixel(topLeft, tileMatrices, zoom);
    const { pixelX: bottomRightPixelX, pixelY: bottomRightPixelY } = toPixel(bottomRight, tileMatrices, zoom);
    const xTiles = [Math.floor(topLeftPixelX / tileSize), Math.floor((bottomRightPixelX - 1) / tileSize)].sort((a, b) => a - b);
    const yTiles = [Math.floor(topLeftpixelY / tileSize), Math.floor((bottomRightPixelY - 1) / tileSize)].sort((a, b) => a - b);
    const tileTopLeftX = xTiles[0] * tileSize;
    const tileTopLeftY = yTiles[0] * tileSize;
    const tiles = [];
    let xIndex = 0;
    let yIndex = 0;
    for (let x = xTiles[0]; x <= xTiles[xTiles.length - 1]; x++) {
        for (let y = yTiles[0]; y <= yTiles[yTiles.length - 1]; y++) {
            const tile = {
                x: x,
                y: y,
                z: zoom,
                imageOffsetX: xIndex * tileSize - (topLeftPixelX - tileTopLeftX),
                imageOffsetY: yIndex * tileSize - (topLeftpixelY - tileTopLeftY),
            };
            tiles.push(tile);
            yIndex++;
        }
        xIndex++;
        yIndex = 0;
    }
    return {
        nativeWidth: bboxPixelWidth,
        nativeHeight: bboxPixelWidth * (imageHeight / imageWidth),
        tiles: tiles,
    };
}
function toPixel(coord, tileMatrices, zoom) {
    const [longitude, latitude] = coord;
    const tileMatrix = tileMatrices.find(matrix => matrix.zoom === zoom);
    const mapWidth = tileMatrix.tileWidth * tileMatrix.matrixWidth;
    const sinLatitude = Math.min(Math.max(Math.sin(DEGREE_TO_RADIAN * latitude), -0.9999), 0.9999);
    const pixelX = Math.round(((longitude + 180) / 360) * mapWidth);
    const pixelY = Math.round((0.5 - Math.log((1 + sinLatitude) / (1 - sinLatitude)) / (4 * Math.PI)) * mapWidth);
    return { pixelX, pixelY };
}
function parseXmlWmtsLayers(parsedXml) {
    return parsedXml.Capabilities.Contents[0].Layer.map(l => {
        return {
            Name: l['ows:Identifier'],
            Title: l['ows:Title'],
            Abstract: l['ows:Abstract'],
            Style: l.Style,
            ResourceUrl: getResourceUrl(l),
        };
    });
}
function fetchLayersFromWmtsGetCapabilitiesXml(baseUrl, reqConfig) {
    return __awaiter(this, void 0, void 0, function* () {
        const parsedXml = (yield fetchGetCapabilitiesXml(baseUrl, OgcServiceTypes.WMTS, reqConfig));
        const layers = parseXmlWmtsLayers(parsedXml);
        return layers;
    });
}
function getResourceUrl(xmlLayer) {
    if (xmlLayer.ResourceURL[0] && xmlLayer.ResourceURL[0].$) {
        const resource = xmlLayer.ResourceURL[0].$;
        if (resource.resourceType === 'tile') {
            return resource.template;
        }
    }
    return null;
}
function getMatrixSets(baseUrl, reqConfig) {
    return __awaiter(this, void 0, void 0, function* () {
        const parsedXml = (yield fetchGetCapabilitiesXml(baseUrl, OgcServiceTypes.WMTS, reqConfig));
        return parsedXml.Capabilities.Contents[0].TileMatrixSet.map(tileMatrixSet => ({
            id: tileMatrixSet['ows:Identifier'][0],
            tileMatrices: tileMatrixSet.TileMatrix.map(tileMatrix => ({
                zoom: Number(tileMatrix['ows:Identifier'][0]),
                tileWidth: Number(tileMatrix.TileWidth[0]),
                tileHeight: Number(tileMatrix.TileHeight[0]),
                matrixWidth: Number(tileMatrix.MatrixWidth[0]),
                matrixHeight: Number(tileMatrix.MatrixHeight[0]),
            })),
        }));
    });
}

class WmtsLayer extends AbstractLayer {
    constructor({ baseUrl, layerId, title = null, description = null, legendUrl = null, resourceUrl = null, matrixSet = null, }) {
        super({ title, description, legendUrl });
        this.baseUrl = baseUrl;
        this.layerId = layerId;
        this.resourceUrl = resourceUrl;
        this.matrixSet = matrixSet;
        this.tileMatrix = null;
    }
    updateLayerFromServiceIfNeeded(reqConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            yield ensureTimeout((innerReqConfig) => __awaiter(this, void 0, void 0, function* () {
                if (!this.resourceUrl) {
                    const parsedLayers = yield fetchLayersFromWmtsGetCapabilitiesXml(this.baseUrl, innerReqConfig);
                    const layer = parsedLayers.find(layerInfo => this.layerId === layerInfo.Name[0]);
                    this.resourceUrl = layer.ResourceUrl;
                }
                if (!this.tileMatrix) {
                    const matrixSets = yield getMatrixSets(this.baseUrl, innerReqConfig);
                    const matrixSet = matrixSets.find(set => set.id === this.matrixSet);
                    if (!matrixSet) {
                        throw new Error(`No matrixSet found for: ${this.matrixSet}`);
                    }
                    this.tileMatrix = matrixSet.tileMatrices;
                }
            }), reqConfig);
        });
    }
    getMap(params, api, reqConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield ensureTimeout((innerReqConfig) => __awaiter(this, void 0, void 0, function* () {
                yield this.updateLayerFromServiceIfNeeded(reqConfig);
                const paramsWithoutEffects = Object.assign({}, params);
                delete paramsWithoutEffects.gain;
                delete paramsWithoutEffects.gamma;
                delete paramsWithoutEffects.effects;
                if (params.bbox && !params.tileCoord) {
                    return yield this.stitchGetMap(paramsWithoutEffects, api, innerReqConfig);
                }
                const url = this.getMapUrl(paramsWithoutEffects, api);
                const requestConfig = Object.assign({ 
                    // 'blob' responseType does not work with Node.js:
                    responseType: typeof window !== 'undefined' && window.Blob ? 'blob' : 'arraybuffer' }, getAxiosReqParams(innerReqConfig, CACHE_CONFIG_30MIN));
                const response = yield axios.get(url, requestConfig);
                let blob = response.data;
                // apply effects:
                // support deprecated GetMapParams.gain and .gamma parameters
                // but override them if they are also present in .effects
                const effects = Object.assign({ gain: params.gain, gamma: params.gamma }, params.effects);
                return yield runEffectFunctions(blob, effects);
            }), reqConfig);
        });
    }
    getMapUrl(params, api) {
        if (api !== exports.ApiType.WMTS) {
            throw new Error('Only WMTS is supported on this layer');
        }
        if (!params.bbox && !params.tileCoord) {
            throw new Error('No bbox or x,y,z coordinates provided');
        }
        if (!this.resourceUrl) {
            throw new Error('No resource URL provided');
        }
        if (params.gain) {
            throw new Error('Parameter gain is not supported in getMapUrl. Use getMap method instead.');
        }
        if (params.gamma) {
            throw new Error('Parameter gamma is not supported in getMapUrl. Use getMap method instead.');
        }
        if (params.effects) {
            throw new Error('Parameter effects is not supported in getMapUrl. Use getMap method instead.');
        }
        const xyz = {
            x: params.tileCoord.x,
            y: params.tileCoord.y,
            z: params.tileCoord.z,
        };
        const urlParams = {
            '{TileMatrix}': xyz.z,
            '{TileCol}': xyz.x,
            '{TileRow}': xyz.y,
        };
        return this.resourceUrl.replace(/\{ *([\w_ -]+) *\}/g, (m) => urlParams[m]);
    }
    stitchGetMap(params, api, reqConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield ensureTimeout((innerReqConfig) => __awaiter(this, void 0, void 0, function* () {
                const { width: requestedImageWidth, height: requestedImageHeight, bbox } = params;
                const { nativeHeight, nativeWidth, tiles } = bboxToXyzGrid(bbox, requestedImageWidth, requestedImageHeight, this.tileMatrix);
                const canvas = document.createElement('canvas');
                canvas.width = nativeWidth;
                canvas.height = nativeHeight;
                const ctx = canvas.getContext('2d');
                const isCanvasValid = yield validateCanvasDimensions(canvas);
                if (!isCanvasValid) {
                    throw new Error(`Image dimensions (${nativeWidth}x${nativeHeight}) exceed the canvas size limit for this browser.`);
                }
                for (let tile of tiles) {
                    const blob = yield this.getMap(Object.assign(Object.assign({}, params), { tileCoord: tile }), api, innerReqConfig);
                    yield drawBlobOnCanvas(ctx, blob, tile.imageOffsetX, tile.imageOffsetY);
                }
                const outputFormat = (params.format === MimeTypes.JPEG_OR_PNG
                    ? MimeTypes.PNG
                    : params.format);
                const requestedSizeCanvas = yield scaleCanvasImage(canvas, requestedImageWidth, requestedImageHeight);
                return yield canvasToBlob(requestedSizeCanvas, outputFormat);
            }), reqConfig);
        });
    }
    supportsApiType(api) {
        return api === exports.ApiType.WMTS;
    }
}

const YYYY_MM_REGEX = /\d{4}-\d{2}/g;
var NICFI_LAYER_TYPES;
(function (NICFI_LAYER_TYPES) {
    NICFI_LAYER_TYPES["ANALYTIC"] = "analytic";
    NICFI_LAYER_TYPES["VISUAL"] = "visual";
})(NICFI_LAYER_TYPES || (NICFI_LAYER_TYPES = {}));
class PlanetNicfiLayer extends WmtsLayer {
    constructor({ baseUrl, layerId, title = null, description = null, legendUrl = null, resourceUrl = null, }) {
        super({ title, description, legendUrl });
        this.baseUrl = baseUrl;
        this.layerId = layerId;
        this.resourceUrl = resourceUrl;
        this.matrixSet = 'GoogleMapsCompatible15'; //only matrixSet available for PlanetNicfi
    }
    findDatesUTC(bbox, fromTime, toTime, reqConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield ensureTimeout((innerReqConfig) => __awaiter(this, void 0, void 0, function* () {
                const parsedLayers = yield fetchLayersFromWmtsGetCapabilitiesXml(this.baseUrl, innerReqConfig);
                const applicableLayers = parsedLayers.filter(l => {
                    return this.getLayerType(this.layerId) === this.getLayerType(l.Name[0]);
                });
                const datesFromApplicableLayers = applicableLayers.map(l => {
                    const dateArray = l.Name[0].match(YYYY_MM_REGEX);
                    return moment.utc(dateArray[dateArray.length - 1]).endOf('month');
                });
                const availableDates = datesFromApplicableLayers.filter(d => d.isBetween(moment.utc(fromTime), moment.utc(toTime), null, '[]'));
                return availableDates.map(d => d.toDate());
            }), reqConfig);
        });
    }
    getLayerType(layerId) {
        return layerId.includes(NICFI_LAYER_TYPES.ANALYTIC)
            ? NICFI_LAYER_TYPES.ANALYTIC
            : NICFI_LAYER_TYPES.VISUAL;
    }
}

class HLSAWSLayer extends AbstractSentinelHubV3WithCCLayer {
    constructor(_a) {
        var { constellation = null } = _a, params = __rest(_a, ["constellation"]);
        super(params);
        this.dataset = DATASET_AWS_HLS;
        this.constellation = constellation;
    }
    createCatalogFilterQuery(maxCloudCoverPercent, datasetParameters) {
        let result = Object.assign({}, super.createCatalogFilterQuery(maxCloudCoverPercent, datasetParameters));
        let args = [];
        if (maxCloudCoverPercent !== null && maxCloudCoverPercent !== undefined) {
            args.push({
                op: '<=',
                args: [{ property: 'eo:cloud_cover' }, maxCloudCoverPercent],
            });
        }
        if (datasetParameters && datasetParameters.constellation) {
            args.push({
                op: '=',
                args: [{ property: 'constellation' }, datasetParameters.constellation],
            });
        }
        if (args.length > 0) {
            result.op = 'and';
            result.args = args;
        }
        return result && Object.keys(result).length > 0 ? result : null;
    }
    getFindTilesAdditionalParameters() {
        const findTilesDatasetParameters = {
            type: this.dataset.datasetParametersType,
            constellation: this.constellation,
        };
        return {
            maxCloudCoverPercent: this.maxCloudCoverPercent,
            datasetParameters: findTilesDatasetParameters,
        };
    }
    _updateProcessingGetMapPayload(payload, datasetSeqNo = 0) {
        const _super = Object.create(null, {
            _updateProcessingGetMapPayload: { get: () => super._updateProcessingGetMapPayload }
        });
        return __awaiter(this, void 0, void 0, function* () {
            payload = yield _super._updateProcessingGetMapPayload.call(this, payload);
            if (this.constellation !== null) {
                payload.input.data[datasetSeqNo].dataFilter.constellation = this.constellation;
            }
            return payload;
        });
    }
}

class S1GRDCDASLayer extends S1GRDAWSEULayer {
    constructor() {
        super(...arguments);
        this.dataset = DATASET_CDAS_S1GRD;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getStats(payload, reqConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('getStats() not implemented for this dataset');
        });
    }
}

class S2L2ACDASLayer extends S2L2ALayer {
    constructor() {
        super(...arguments);
        this.dataset = DATASET_CDAS_S2L2A;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getStats(payload, reqConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('getStats() not implemented for this dataset');
        });
    }
}

class S2L1CCDASLayer extends S2L1CLayer {
    constructor() {
        super(...arguments);
        this.dataset = DATASET_CDAS_S2L1C;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getStats(payload, reqConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('getStats() not implemented for this dataset');
        });
    }
}

class LayersFactory {
    static matchDatasetFromGetCapabilities(datasetId, baseUrl) {
        if (!datasetId) {
            return undefined;
        }
        const matchingDatasetIds = LayersFactory.DATASET_FROM_JSON_GETCAPAPABILITIES.filter((dataset) => dataset.shJsonGetCapabilitiesDataset === datasetId);
        if (matchingDatasetIds.length === 1) {
            return matchingDatasetIds[0];
        }
        return matchingDatasetIds.find((dataset) => {
            return dataset.shServiceHostname && baseUrl.includes(dataset.shServiceHostname);
        });
    }
    static makeLayer(baseUrl, layerId, overrideConstructorParams, reqConfig, preferGetCapabilities = true) {
        return __awaiter(this, void 0, void 0, function* () {
            const layer = yield ensureTimeout((innerReqConfig) => __awaiter(this, void 0, void 0, function* () {
                const layers = yield LayersFactory.makeLayers(baseUrl, (lId) => lId === layerId, overrideConstructorParams, innerReqConfig, preferGetCapabilities);
                if (layers.length === 0) {
                    return null;
                }
                return layers[0];
            }), reqConfig);
            return layer;
        });
    }
    static makeLayers(baseUrl, filterLayers = null, overrideConstructorParams, reqConfig, preferGetCapabilities = true) {
        return __awaiter(this, void 0, void 0, function* () {
            const returnValue = yield ensureTimeout((innerReqConfig) => __awaiter(this, void 0, void 0, function* () {
                for (let hostname of SH_SERVICE_HOSTNAMES_V3) {
                    if (baseUrl.startsWith(hostname)) {
                        return yield this.makeLayersSHv3(baseUrl, filterLayers, overrideConstructorParams, innerReqConfig, preferGetCapabilities);
                    }
                }
                for (let hostname of SH_SERVICE_HOSTNAMES_V1_OR_V2) {
                    if (baseUrl.startsWith(hostname)) {
                        return yield this.makeLayersSHv12(baseUrl, filterLayers, overrideConstructorParams, innerReqConfig);
                    }
                }
                if (baseUrl.includes('/wmts')) {
                    if (baseUrl.includes('api.planet.com/basemaps/')) {
                        return this.makePlanetBasemapLayers(baseUrl, filterLayers, overrideConstructorParams, innerReqConfig);
                    }
                    return yield this.makeLayersWmts(baseUrl, filterLayers, overrideConstructorParams, innerReqConfig);
                }
                else {
                    return yield this.makeLayersWms(baseUrl, filterLayers, overrideConstructorParams, innerReqConfig);
                }
            }), reqConfig);
            return returnValue;
        });
    }
    static makeLayersSHv3(baseUrl, filterLayers, overrideConstructorParams, reqConfig, preferGetCapabilities = true) {
        return __awaiter(this, void 0, void 0, function* () {
            const filteredLayersInfos = yield this.getSHv3LayersInfo(baseUrl, reqConfig, filterLayers, preferGetCapabilities);
            return filteredLayersInfos.map((_a) => {
                var { layerId, dataset, title, description, legendUrl, evalscript, dataProduct } = _a, rest = __rest(_a, ["layerId", "dataset", "title", "description", "legendUrl", "evalscript", "dataProduct"]);
                if (!dataset) {
                    return new WmsLayer({ baseUrl, layerId, title, description });
                }
                const SHLayerClass = LayersFactory.LAYER_FROM_DATASET_V3[dataset.id];
                if (!SHLayerClass) {
                    throw new Error(`Dataset ${dataset.id} is not defined in LayersFactory.LAYER_FROM_DATASET`);
                }
                return new SHLayerClass(Object.assign(Object.assign({ instanceId: parseSHInstanceId(baseUrl), layerId, evalscript: evalscript || null, evalscriptUrl: null, dataProduct: dataProduct || null, title,
                    description,
                    legendUrl }, rest), overrideConstructorParams));
            });
        });
    }
    static getSHv3LayersInfo(baseUrl, reqConfig, filterLayers, preferGetCapabilities = true) {
        return __awaiter(this, void 0, void 0, function* () {
            let layersInfos;
            //also check if auth token is present
            const authToken = reqConfig && reqConfig.authToken ? reqConfig.authToken : getAuthToken();
            let layersInfoFetched = false;
            // use configuration if possible
            if (authToken && preferGetCapabilities === false) {
                try {
                    const layers = yield fetchLayerParamsFromConfigurationService(parseSHInstanceId(baseUrl), reqConfig);
                    layersInfos = layers.map((l) => (Object.assign(Object.assign({}, l), { dataset: LayersFactory.matchDatasetFromGetCapabilities(l.type, baseUrl) })));
                    layersInfoFetched = true;
                }
                catch (e) {
                    console.error(e);
                    // fallback to getCapabilities
                }
            }
            if (!layersInfoFetched) {
                const getCapabilitiesJson = yield fetchGetCapabilitiesJson(baseUrl, reqConfig);
                layersInfos = getCapabilitiesJson.map(layerInfo => ({
                    layerId: layerInfo.id,
                    title: layerInfo.name,
                    description: layerInfo.description,
                    dataset: LayersFactory.matchDatasetFromGetCapabilities(layerInfo.dataset, baseUrl),
                    legendUrl: layerInfo.legendUrl,
                }));
            }
            const filteredLayersInfos = filterLayers === null ? layersInfos : layersInfos.filter(l => filterLayers(l.layerId, l.dataset));
            return filteredLayersInfos;
        });
    }
    static makeLayersSHv12(baseUrl, filterLayers, overrideConstructorParams, reqConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            const getCapabilitiesJsonV1 = yield fetchGetCapabilitiesJsonV1(baseUrl, reqConfig);
            const result = [];
            for (let layerInfo of getCapabilitiesJsonV1) {
                const layerId = layerInfo.name;
                const dataset = LayersFactory.DATASET_FROM_JSON_GETCAPABILITIES_V1[layerInfo.settings.datasourceName];
                if (!dataset) {
                    throw new Error(`Unknown dataset for layer ${layerId} (${layerInfo.settings.datasourceName})`);
                }
                if (filterLayers) {
                    const keepLayer = Boolean(filterLayers(layerId, dataset));
                    if (!keepLayer) {
                        continue;
                    }
                }
                const SH12LayerClass = LayersFactory.LAYER_FROM_DATASET_V12[dataset.id];
                if (!SH12LayerClass) {
                    throw new Error(`Dataset ${dataset.id} is not defined in LayersFactory.LAYER_FROM_DATASET_V12`);
                }
                // We must pass the maxCloudCoverPercent (S-2) or others (S-1) from legacyGetMapFromParams to the Layer
                // otherwise the default values from layer definition on the service will be used.
                if (overrideConstructorParams && overrideConstructorParams.maxCloudCoverPercent) {
                    layerInfo.settings.maxCC = overrideConstructorParams.maxCloudCoverPercent;
                }
                const layer = SH12LayerClass.makeLayer(layerInfo, parseSHInstanceId(baseUrl), layerId, layerInfo.settings.evalJSScript || null, null, layerInfo.settings.title, layerInfo.settings.description);
                result.push(layer);
            }
            return result;
        });
    }
    static makeLayersWms(baseUrl, filterLayers, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    overrideConstructorParams, reqConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            const parsedLayers = yield fetchLayersFromGetCapabilitiesXml(baseUrl, OgcServiceTypes.WMS, reqConfig);
            const layersInfos = parsedLayers.map(layerInfo => ({
                layerId: layerInfo.Name[0],
                title: layerInfo.Title[0],
                description: layerInfo.Abstract ? layerInfo.Abstract[0] : null,
                dataset: null,
                legendUrl: layerInfo.Style && layerInfo.Style[0].LegendURL
                    ? layerInfo.Style[0].LegendURL[0].OnlineResource[0]['$']['xlink:href']
                    : layerInfo.Layer && layerInfo.Layer[0].Style && layerInfo.Layer[0].Style[0].LegendURL
                        ? layerInfo.Layer[0].Style[0].LegendURL[0].OnlineResource[0]['$']['xlink:href']
                        : null,
            }));
            const filteredLayersInfos = filterLayers === null ? layersInfos : layersInfos.filter(l => filterLayers(l.layerId, l.dataset));
            return filteredLayersInfos.map(({ layerId, title, description, legendUrl }) => new WmsLayer({ baseUrl, layerId, title, description, legendUrl }));
        });
    }
    static makeLayersWmts(baseUrl, filterLayers, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    overrideConstructorParams, reqConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            const parsedLayers = yield fetchLayersFromWmtsGetCapabilitiesXml(baseUrl, reqConfig);
            const layersInfos = parsedLayers.map(layerInfo => ({
                layerId: layerInfo.Name[0],
                title: layerInfo.Title[0],
                description: layerInfo.Abstract ? layerInfo.Abstract[0] : null,
                dataset: null,
                legendUrl: layerInfo.Style[0].LegendURL,
                resourceUrl: layerInfo.ResourceUrl,
            }));
            const filteredLayersInfos = filterLayers === null ? layersInfos : layersInfos.filter(l => filterLayers(l.layerId, l.dataset));
            return filteredLayersInfos.map(({ layerId, title, description, legendUrl, resourceUrl }) => new WmtsLayer({ baseUrl, layerId, title, description, legendUrl, resourceUrl }));
        });
    }
    // Analytic layers accept a proc parameter to specify a dynamically-rendered false color visualization, for example NDVI.
    // Since proc is not a standard a WMTS parameter and there is a list of specified options at https://developers.planet.com/docs/basemaps/tile-services/indices/#remote-sensing-indices-legends
    // we can treat these as extra layers and add them to makeLayers response.
    static makePlanetBasemapLayers(baseUrl, filterLayers, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    overrideConstructorParams, reqConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            let newLayers = [];
            const parsedLayers = yield fetchLayersFromWmtsGetCapabilitiesXml(baseUrl, reqConfig);
            for (let layerInfo of parsedLayers) {
                const layer = {
                    layerId: layerInfo.Name[0],
                    title: layerInfo.Title[0],
                    description: layerInfo.Abstract ? layerInfo.Abstract[0] : null,
                    dataset: DATASET_PLANET_NICFI,
                    legendUrl: layerInfo.Style[0].LegendURL,
                    resourceUrl: layerInfo.Name[0].includes('analytic')
                        ? `${layerInfo.ResourceUrl}&proc=rgb`
                        : layerInfo.ResourceUrl,
                };
                newLayers.push(layer);
                if (layer.layerId.includes('analytic')) {
                    const parsedResourceUrl = queryString.parseUrl(layer.resourceUrl);
                    const falseColorLayers = PLANET_FALSE_COLOR_TEMPLATES.map(template => ({
                        layerId: `${layer.layerId}_${template.titleSuffix}`,
                        title: `${layer.title} ${template.titleSuffix}`,
                        description: template.description,
                        legendUrl: layer.legendUrl,
                        dataset: layer.dataset,
                        resourceUrl: queryString.stringifyUrl({
                            url: parsedResourceUrl.url,
                            query: Object.assign(Object.assign({}, parsedResourceUrl.query), template.resourceUrlParams),
                        }),
                    }));
                    newLayers.push(...falseColorLayers);
                }
            }
            const filteredLayersInfos = filterLayers === null ? newLayers : newLayers.filter(l => filterLayers(l.layerId, l.dataset));
            return filteredLayersInfos.map(({ layerId, title, description, legendUrl, resourceUrl }) => new PlanetNicfiLayer({ baseUrl, layerId, title, description, legendUrl, resourceUrl }));
        });
    }
}
/*
  This class is responsible for creating the Layer subclasses from the limited information (like
  baseUrl). It needs to be aware of various services so it can fetch information from them and
  instantiate appropriate layers.
*/
LayersFactory.DATASET_FROM_JSON_GETCAPAPABILITIES = [
    DATASET_AWSEU_S1GRD,
    DATASET_CDAS_S1GRD,
    DATASET_S2L2A,
    DATASET_S2L1C,
    DATASET_CDAS_S2L2A,
    DATASET_CDAS_S2L1C,
    DATASET_S3SLSTR,
    DATASET_S3OLCI,
    DATASET_S5PL2,
    DATASET_AWS_L8L1C,
    DATASET_AWS_LOTL1,
    DATASET_AWS_LOTL2,
    DATASET_AWS_LTML1,
    DATASET_AWS_LTML2,
    DATASET_AWS_LMSSL1,
    DATASET_AWS_LETML1,
    DATASET_AWS_LETML2,
    DATASET_AWS_HLS,
    DATASET_EOCLOUD_ENVISAT_MERIS,
    DATASET_MODIS,
    DATASET_AWS_DEM,
    DATASET_BYOC,
];
LayersFactory.DATASET_FROM_JSON_GETCAPABILITIES_V1 = {
    S1: DATASET_EOCLOUD_S1GRD,
    S1_EW: DATASET_EOCLOUD_S1GRD,
    S1_EW_SH: DATASET_EOCLOUD_S1GRD,
    L5: DATASET_EOCLOUD_LANDSAT5,
    L7: DATASET_EOCLOUD_LANDSAT7,
    L8: DATASET_EOCLOUD_LANDSAT8,
    ENV: DATASET_EOCLOUD_ENVISAT_MERIS,
};
LayersFactory.LAYER_FROM_DATASET_V3 = {
    [DATASET_AWSEU_S1GRD.id]: S1GRDAWSEULayer,
    [DATASET_CDAS_S1GRD.id]: S1GRDCDASLayer,
    [DATASET_S2L2A.id]: S2L2ALayer,
    [DATASET_S2L1C.id]: S2L1CLayer,
    [DATASET_CDAS_S2L2A.id]: S2L2ACDASLayer,
    [DATASET_CDAS_S2L1C.id]: S2L1CCDASLayer,
    [DATASET_S3SLSTR.id]: S3SLSTRLayer,
    [DATASET_S3OLCI.id]: S3OLCILayer,
    [DATASET_S5PL2.id]: S5PL2Layer,
    [DATASET_AWS_L8L1C.id]: Landsat8AWSLayer,
    [DATASET_AWS_LOTL1.id]: Landsat8AWSLOTL1Layer,
    [DATASET_AWS_LOTL2.id]: Landsat8AWSLOTL2Layer,
    [DATASET_AWS_LTML1.id]: Landsat45AWSLTML1Layer,
    [DATASET_AWS_LTML2.id]: Landsat45AWSLTML2Layer,
    [DATASET_AWS_LMSSL1.id]: Landsat15AWSLMSSL1Layer,
    [DATASET_AWS_LETML1.id]: Landsat7AWSLETML1Layer,
    [DATASET_AWS_LETML2.id]: Landsat7AWSLETML2Layer,
    [DATASET_AWS_HLS.id]: HLSAWSLayer,
    [DATASET_MODIS.id]: MODISLayer,
    [DATASET_AWS_DEM.id]: DEMLayer,
    [DATASET_AWSUS_DEM.id]: DEMAWSUSLayer,
    [DATASET_BYOC.id]: BYOCLayer,
};
LayersFactory.LAYER_FROM_DATASET_V12 = {
    [DATASET_EOCLOUD_S1GRD.id]: S1GRDEOCloudLayer,
    [DATASET_EOCLOUD_LANDSAT5.id]: Landsat5EOCloudLayer,
    [DATASET_EOCLOUD_LANDSAT7.id]: Landsat7EOCloudLayer,
    [DATASET_EOCLOUD_LANDSAT8.id]: Landsat8EOCloudLayer,
    [DATASET_EOCLOUD_ENVISAT_MERIS.id]: EnvisatMerisEOCloudLayer,
};

const DEFAULT_SH_SERVICE_HOSTNAME = 'https://services.sentinel-hub.com/';
class ProcessingDataFusionLayer extends AbstractSentinelHubV3Layer {
    constructor({ title = null, description = null, evalscript = null, evalscriptUrl = null, layers, }) {
        super({ title, description, evalscript, evalscriptUrl });
        this.layers = layers;
    }
    getMap(params, api, reqConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield ensureTimeout((innerReqConfig) => __awaiter(this, void 0, void 0, function* () {
                params = yield this.decideJpegOrPng(params, innerReqConfig);
                if (api !== exports.ApiType.PROCESSING) {
                    throw new Error(`Only API type "PROCESSING" is supported`);
                }
                yield this.fetchEvalscriptUrlIfNeeded(innerReqConfig);
                // when constructing the payload, we just take the first layer - we will rewrite its info later:
                const bogusFirstLayer = this.layers[0].layer;
                let payload = createProcessingPayload(bogusFirstLayer.dataset, params, this.evalscript);
                // replace payload.input.data with information from this.layers:
                payload.input.data = [];
                for (let i = 0; i < this.layers.length; i++) {
                    const layerInfo = this.layers[i];
                    let datasource = {
                        dataFilter: {
                            timeRange: {
                                from: layerInfo.fromTime ? layerInfo.fromTime.toISOString() : params.fromTime.toISOString(),
                                to: layerInfo.toTime ? layerInfo.toTime.toISOString() : params.toTime.toISOString(),
                            },
                            mosaickingOrder: exports.MosaickingOrder.MOST_RECENT,
                        },
                        processing: {},
                        type: layerInfo.layer.dataset.shProcessingApiDatasourceAbbreviation,
                    };
                    if (layerInfo.id !== undefined) {
                        datasource.id = layerInfo.id;
                    }
                    if (layerInfo.preview !== undefined) {
                        datasource.dataFilter.previewMode = convertPreviewToString(layerInfo.preview);
                    }
                    else if (params.preview !== undefined) {
                        datasource.dataFilter.previewMode = convertPreviewToString(params.preview);
                    }
                    if (layerInfo.layer.mosaickingOrder) {
                        datasource.dataFilter.mosaickingOrder = layerInfo.layer.mosaickingOrder;
                    }
                    if (layerInfo.layer.upsampling) {
                        datasource.processing.upsampling = layerInfo.layer.upsampling;
                    }
                    if (layerInfo.layer.downsampling) {
                        datasource.processing.downsampling = layerInfo.layer.downsampling;
                    }
                    payload.input.data.push(datasource);
                    // the layer should set its parameters for Process API:
                    yield layerInfo.layer._updateProcessingGetMapPayload(payload, payload.input.data.length - 1, reqConfig);
                }
                // If all layers share the common endpoint, it is used for the request.
                // However, data fusion only works reliably using services.sentinel-hub if data is deployed on different endpoints
                let shServiceHostname;
                if (this.layers.every(layer => layer.layer.dataset.shServiceHostname === bogusFirstLayer.dataset.shServiceHostname)) {
                    shServiceHostname = bogusFirstLayer.dataset.shServiceHostname;
                }
                else {
                    shServiceHostname = DEFAULT_SH_SERVICE_HOSTNAME;
                }
                let blob = yield processingGetMap(shServiceHostname, payload, innerReqConfig);
                // apply effects:
                // support deprecated GetMapParams.gain and .gamma parameters
                // but override them if they are also present in .effects
                const effects = Object.assign({ gain: params.gain, gamma: params.gamma }, params.effects);
                blob = yield runEffectFunctions(blob, effects);
                return blob;
            }), reqConfig);
        });
    }
    supportsApiType(api) {
        return api === exports.ApiType.PROCESSING;
    }
    findTiles(bbox, // eslint-disable-line @typescript-eslint/no-unused-vars
    fromTime, // eslint-disable-line @typescript-eslint/no-unused-vars
    toTime, // eslint-disable-line @typescript-eslint/no-unused-vars
    maxCount = null, // eslint-disable-line @typescript-eslint/no-unused-vars
    offset = null, // eslint-disable-line @typescript-eslint/no-unused-vars
    reqConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('Not supported - use individual layers when searching for tiles or flyovers');
        });
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    findDatesUTC(bbox, fromTime, toTime) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('Not supported - use individual layers when searching for available dates');
        });
    }
}

function legacyGetMapFromUrl(urlWithQueryParams, api = exports.ApiType.WMS, fallbackToWmsApi = false, overrideLayerConstructorParams, overrideGetMapParams) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = new URL(urlWithQueryParams);
        let params = {};
        url.searchParams.forEach((value, key) => {
            params[key] = value;
        });
        const baseUrl = `${url.origin}${url.pathname}`;
        return legacyGetMapFromParams(baseUrl, params, api, fallbackToWmsApi, overrideLayerConstructorParams, overrideGetMapParams);
    });
}
function legacyGetMapWmsUrlFromParams(baseUrl, wmsParams) {
    const { layers, getMapParams } = parseLegacyWmsGetMapParams(wmsParams);
    const layer = new WmsLayer({ baseUrl, layerId: layers });
    return layer.getMapUrl(getMapParams, exports.ApiType.WMS);
}
function legacyGetMapFromParams(baseUrl, wmsParams, api = exports.ApiType.WMS, fallbackToWmsApi = false, overrideLayerConstructorParams, overrideGetMapParams, requestConfig, preferGetCapabilities = true) {
    return __awaiter(this, void 0, void 0, function* () {
        const { layers, evalscript, evalscriptUrl, evalsource, getMapParams, otherLayerParams, } = parseLegacyWmsGetMapParams(wmsParams);
        let layer;
        // Layers parameter may contain list of layers which is at the moment supported only by WmsLayer.
        // In case there is more than one layer specified in layers parameter, WmsLayer will be used.
        if (layers && layers.split(',').length > 1) {
            layer = new WmsLayer({ baseUrl, layerId: layers });
        }
        else {
            const layerId = layers;
            const overrideConstructorParams = Object.assign(Object.assign({}, otherLayerParams), overrideLayerConstructorParams);
            // Warning: overrideConstructorParams override layer's params that are retrieved from service.
            layer = yield LayersFactory.makeLayer(baseUrl, layerId, overrideConstructorParams, requestConfig, preferGetCapabilities);
            if (!layer) {
                throw new Error(`Layer with id ${layerId} was not found on service endpoint ${baseUrl}`);
            }
            if (evalscript || evalscriptUrl) {
                // we assume that devs don't do things like setting evalsource on a layer to something
                // that doesn't match layer's dataset - but we check it nevertheless:
                const expectedEvalsource = layer.dataset.shWmsEvalsource;
                if (expectedEvalsource !== evalsource) {
                    console.warn(`Evalsource ${evalsource} is not valid on this layer, will use: ${expectedEvalsource}`);
                }
                if (evalscriptUrl) {
                    layer.setEvalscriptUrl(evalscriptUrl);
                }
                else {
                    layer.setEvalscript(evalscript);
                }
            }
        }
        const updatedGetMapParams = Object.assign(Object.assign({}, getMapParams), overrideGetMapParams);
        let combinedEffects = {};
        if (getMapParams.effects && Object.keys(getMapParams.effects).length > 0) {
            combinedEffects = Object.assign(Object.assign({}, combinedEffects), getMapParams.effects);
        }
        if (overrideGetMapParams &&
            overrideGetMapParams.effects &&
            Object.keys(overrideGetMapParams.effects).length > 0) {
            combinedEffects = Object.assign(Object.assign({}, combinedEffects), overrideGetMapParams.effects);
        }
        if (Object.keys(combinedEffects).length > 0) {
            updatedGetMapParams.effects = combinedEffects;
        }
        switch (api) {
            case exports.ApiType.WMS:
                return layer.getMap(updatedGetMapParams, api);
            case exports.ApiType.PROCESSING:
                try {
                    // We try to use Processing API, but we can't guarantee that we will be able to translate all of
                    // the parameters. If some of them are incompatible, we _don't_ render the possibly incorrect image,
                    // but instead throw an exception. In this case, parameter 'fallbackToWmsApi' allows rendering image
                    // using the regular WMS.
                    if (!(layer instanceof AbstractSentinelHubV3Layer)) {
                        throw new Error('Processing API is only possible with SH V3 layers');
                    }
                    return layer.getMap(updatedGetMapParams, api);
                }
                catch (ex) {
                    if (fallbackToWmsApi) {
                        //console.debug(`Processing API could not be used, will retry with WMS. Error was: [${ex.message}]`)
                        return legacyGetMapFromParams(baseUrl, wmsParams, exports.ApiType.WMS, fallbackToWmsApi, overrideLayerConstructorParams, overrideGetMapParams);
                    }
                    else {
                        throw ex;
                    }
                }
            default:
                throw new Error('Only WMS and Processing API are supported with legacy functions');
        }
    });
}
// *****************
const DEFAULT_OGC_VERSIONS = {
    WMS: '1.3.0',
    WCS: '1.1.2',
    WFS: '2.0.0',
};
function parseLegacyWmsGetMapParams(wmsParams) {
    const params = convertKeysToLowercase(wmsParams);
    const layers = params.layers;
    const service = serviceFromParams(params);
    const version = versionFromParams(service, params);
    let crs = crsFromParams(service, params);
    const bbox = bboxFromParams(service, version, crs, params);
    const [fromTime, toTime] = timeFromParams(params);
    const format = mimeTypeFromParams(params);
    let getMapParams = {
        bbox: bbox,
        fromTime: fromTime,
        toTime: toTime,
        format: format,
    };
    if (params.resx && params.resy) {
        const [resx, resy] = resXYFromParams(params);
        getMapParams.resx = resx;
        getMapParams.resy = resy;
    }
    else if (params.width && params.height) {
        const [width, height] = widthHeightFromParams(params);
        getMapParams.width = width;
        getMapParams.height = height;
    }
    // Use otherLayerParams when instantiating the layer(s).
    // Warning: otherLayerParams will override layer's params that are retrieved from service.
    const otherLayerParams = {};
    if (params.maxcc) {
        otherLayerParams.maxCloudCoverPercent = parseInt(params.maxcc);
    }
    if (params.preview) {
        getMapParams.preview = previewFromParams(params);
    }
    if (params.geometry) {
        getMapParams.geometry = WKT.parse(params.geometry);
    }
    if (params.quality) {
        getMapParams.quality = parseInt(params.quality);
    }
    if (params.gain !== undefined && params.gain !== null && params.gain !== '') {
        if (!getMapParams.effects) {
            getMapParams.effects = {};
        }
        getMapParams.effects.gain = parseFloat(params.gain);
    }
    if (params.gamma !== undefined && params.gamma !== null && params.gamma !== '') {
        if (!getMapParams.effects) {
            getMapParams.effects = {};
        }
        getMapParams.effects.gamma = parseFloat(params.gamma);
    }
    if (params.nicename) {
        getMapParams.nicename = params.nicename;
    }
    if (params.showlogo) {
        getMapParams.showlogo = !['false', '0', 'no'].includes(params.showlogo.toLowerCase());
    }
    if (params.bgcolor) {
        getMapParams.bgcolor = bgcolorFromParams(params);
    }
    if (params.transparent) {
        getMapParams.transparent = ['true', '1', 'yes'].includes(params.transparent.toLowerCase());
    }
    if (params.temporal) {
        getMapParams.temporal = ['true', '1', 'yes'].includes(params.temporal.toLowerCase());
    }
    if (params.upsampling) {
        getMapParams.upsampling = params.upsampling;
    }
    if (params.downsampling) {
        getMapParams.downsampling = params.downsampling;
    }
    // let all other params through without cleaning - we don't know about them, but we will
    // pass them to WMS unchanged:
    const IGNORE_KNOWN_PARAMS = [
        'request',
        'layers',
        'service',
        'version',
        'crs',
        'srs',
        'srsname',
        'time',
    ];
    const getMapParamsObjectKeys = Object.keys(getMapParams);
    let unknown = {};
    for (let [key, value] of Object.entries(params)) {
        if (getMapParamsObjectKeys.includes(key)) {
            // key is already taken care of, ignore it:
            continue;
        }
        if (IGNORE_KNOWN_PARAMS.includes(key)) {
            continue;
        }
        unknown[key] = value;
    }
    if (Object.keys(unknown).length > 0) {
        getMapParams.unknown = unknown;
    }
    let decodedEvalscript = null;
    if (params.evalscript) {
        if (typeof window !== 'undefined' && window.atob) {
            decodedEvalscript = atob(params.evalscript);
        }
        else {
            // node.js doesn't support atob:
            decodedEvalscript = Buffer.from(params.evalscript, 'base64').toString('utf8');
        }
    }
    return {
        layers: layers,
        evalscript: decodedEvalscript,
        evalscriptUrl: params.evalscripturl,
        evalsource: params.evalsource,
        getMapParams: getMapParams,
        otherLayerParams: otherLayerParams,
    };
}
function convertKeysToLowercase(o) {
    let result = {};
    for (let [key, value] of Object.entries(o)) {
        result[key.toLowerCase().trim()] = '' + value;
    }
    return result;
}
function serviceFromParams(params) {
    if (!params.service) {
        return ServiceType.WMS;
    }
    switch (params.service.toUpperCase()) {
        case ServiceType.WMS:
        case ServiceType.WCS:
        case ServiceType.WFS:
            return params.service.toUpperCase();
        default:
            throw new Error('Unknown service');
    }
}
function versionFromParams(service, params) {
    return params.version ? params.version : DEFAULT_OGC_VERSIONS[service];
}
function crsFromParams(ogcService, params) {
    let crs;
    switch (ogcService) {
        case ServiceType.WMS:
            // The standard: 'srs' if using WMS <= 1.1.1, 'crs' if using WMS >= 1.3.0
            // EOB is inconsistent and sometimes sets 'srs' and sometimes 'crs' when using WMS <= 1.1.1
            // so we check for crs instead of checking WMS version
            crs = params.crs ? params.crs : params.srs;
            break;
        case ServiceType.WCS:
            crs = params.srs;
            break;
        case ServiceType.WFS:
            crs = params.srsname;
            break;
    }
    if (!crs) {
        throw new Error('CRS not defined');
    }
    return crs;
}
function bboxFromParams(service, version, crsAuthId, params) {
    if (!params.bbox) {
        throw new Error('Parameter bbox is mandatory');
    }
    const bboxStr = params.bbox;
    const coords = params.bbox instanceof Array ? params.bbox : bboxStr.split(',').map(c => parseFloat(c));
    const crs = SUPPORTED_CRS_OBJ[crsAuthId];
    let minX, minY, maxX, maxY;
    switch (crs) {
        case CRS_EPSG3857:
            [minX, minY, maxX, maxY] = coords;
            break;
        case CRS_EPSG4326:
        case CRS_WGS84:
            // https://www.sentinel-hub.com/faq/why-result-different-when-i-am-using-wms-or-wcs-when-coordinate-system-epsg4326
            // - WMS:
            //    - version 1.1.1: longitude, latitude
            //    - version 1.3.0: latitude, longitude
            // - WFS:
            //    - version 1.0.0: longitude, latitude
            //    - version 2.0.0: latitude, longitude
            // - WCS:
            //    - version 1.0.0: longitude, latitude
            if ((service === 'WMS' && version === '1.1.1') ||
                (service === 'WFS' && version === '1.0.0') ||
                (service === 'WCS' && version === '1.0.0')) {
                [minX, minY, maxX, maxY] = coords;
            }
            else {
                [minY, minX, maxY, maxX] = coords;
            }
            break;
        default:
            throw new Error('Unsupported CRS - bbox could not be parsed');
    }
    // SH services support switched min & max X/Y, but we don't:
    [minX, maxX] = [Math.min(minX, maxX), Math.max(minX, maxX)];
    [minY, maxY] = [Math.min(minY, maxY), Math.max(minY, maxY)];
    return new BBox(crs, minX, minY, maxX, maxY);
}
function isTimeSpecifiedInDate(dateStr) {
    // It would be better if we could somehow tell Date to parse the object with default
    // values, but there doesn't seem to be a way. Still, this should cover most cases:
    return dateStr.length > 'YYYY-MM-DD '.length;
}
function timeFromParams(params) {
    // https://www.sentinel-hub.com/develop/documentation/api/ogc_api/wms-parameters
    // TIME: (when REQUEST = GetMap or GetFeatureInfo) The time or time range for which to
    // return the results, in ISO8601 format (year-month-date, for example: 2016-01-01). It is
    // advised to set time as a time range, e.g. 2016-01-01/2016-01-31 to select image from
    // January 2016 or 2016-01-01/2016-01-01 to select image on 1st of January 2016. When a
    // single time is specified the service will return data from beginning of satellite mission
    // until the specified time (e.g. 2015-01-01 to 2016-01-01). If a time range is specified
    // the result is based on all scenes between the specified dates conforming to the cloud
    // coverage criteria and stacked based on priority setting - e.g. most recent on top.
    // Optional, default: none (the last valid image is returned).
    // Examples: "TIME=2016-01-01/2016-02-01/P1D".
    if (!params.time) {
        // "Optional, default: none (the last valid image is returned)."
        // We ignore this - these functions deal with legacy code and there seems to be no code
        // that wouldn't specify time. Still, let's reject explicitly:
        throw new Error('Time not specified');
    }
    const timeParts = params.time.split('/');
    let fromTime, toTime;
    if (timeParts.length >= 2) {
        fromTime = new Date(timeParts[0]);
        toTime = new Date(timeParts[1]);
        if (!isTimeSpecifiedInDate(timeParts[1])) {
            toTime.setUTCHours(23, 59, 59, 999);
        }
    }
    else if (timeParts.length === 1) {
        // "When a single time is specified the service will return data from beginning of
        //  satellite mission until the specified time"
        fromTime = new Date('1970-01-01');
        toTime = new Date(timeParts[0]);
        if (!isTimeSpecifiedInDate(timeParts[0])) {
            toTime.setUTCHours(23, 59, 59, 999);
        }
    }
    return [new Date(fromTime), new Date(toTime)];
}
function mimeTypeFromParams(params) {
    return params.format ? params.format : 'image/png';
}
function resXYFromParams(params) {
    return [params.resx, params.resy];
}
function widthHeightFromParams(params) {
    return [Number.parseInt(params.width), Number.parseInt(params.height)];
}
function previewFromParams(params) {
    // WMS parameter description:
    //   https://www.sentinel-hub.com/develop/documentation/api/preview-modes
    // In the Processing API the values are enums:
    //   - 0 -> DETAIL
    //   - 1 -> PREVIEW
    //   - 2 -> EXTENDED_PREVIEW
    //   - 3 -> EXTENDED_PREVIEW (used, but not officially supported)
    if (params.preview === undefined || params.preview === null) {
        // this setting allows zoomed-out previews on Processing API, otherwise we get bounds-too-big errors
        // (this parameter was set directly on layers for the old instances)
        return 2;
    }
    return Math.min(Math.max(Number.parseInt(params.preview), 0), 2);
}
function bgcolorFromParams(params) {
    // WMS allows setting bgcolor, while Processing API doesn't; since the default for Processing is
    // black, we set it in WMS to black too
    if (!params.bgcolor) {
        return '000000';
    }
    return params.bgcolor;
}

const DEFAULT_RETRY_DELAY = 3000;
const DEFAULT_MAX_RETRIES = 2;
const registerInitialAxiosInterceptors = () => {
    deleteExpiredCachedItemsAtInterval();
    // - the interceptors are called in reverse order in which they are registered - last
    //   defined interceptor is called first
    // - some interceptors might also be added in other places (`registerHostnameReplacing()`)
    axios.interceptors.request.use(logCurl, error => Promise.reject(error));
    axios.interceptors.request.use(fetchCachedResponse, error => Promise.reject(error));
    axios.interceptors.request.use(rewriteUrl, error => Promise.reject(error));
    axios.interceptors.response.use(saveCacheResponse, error => retryRequests(error));
};
const rewriteUrl = (config) => __awaiter(void 0, void 0, void 0, function* () {
    if (config.rewriteUrlFunc) {
        config.url = config.rewriteUrlFunc(config.url);
    }
    return config;
});
const logCurl = (config) => __awaiter(void 0, void 0, void 0, function* () {
    if (isDebugEnabled()) {
        // Headers are not represented in a very straighforward way in axios, so we must transform
        // them. This is the contents of axios' config.headers:
        //   {
        //     common: { Accept: 'application/json, text/plain, */*' },
        //     delete: {},
        //     get: {},
        //     head: {},
        //     post: { 'Content-Type': 'application/x-www-form-urlencoded' },
        //     put: { 'Content-Type': 'application/x-www-form-urlencoded' },
        //     patch: { 'Content-Type': 'application/x-www-form-urlencoded' },
        //     Authorization: 'Bearer eyJra...'
        //   },
        let headers = Object.assign(Object.assign({}, config.headers.common), config.headers[config.method]);
        const addedHeadersKeys = Object.keys(config.headers).filter(k => typeof config.headers[k] === 'string');
        addedHeadersKeys.forEach(k => (headers[k] = config.headers[k]));
        // findDatesUTC on S1GRDAWSEULayer doesn't specify JSON Content-Type, but the request still works as if it was specified. On
        // the other hand, when requesting auth token, we use Content-Type 'application/x-www-form-urlencoded'. This hack updates a
        // Content-Type header to JSON whenever data is not a string:
        if (typeof config.data !== 'string') {
            headers['Content-Type'] = 'application/json';
        }
        // we sometimes get both 'Content-Type' and 'content-type', making /oauth/token/ endpoint complain
        let lowercaseHeaders = {};
        for (let k in headers) {
            lowercaseHeaders[k.toLowerCase()] = headers[k];
        }
        console.debug(`${'*'.repeat(30)}\n${curlify(config.url, config.method.toUpperCase(), config.data, lowercaseHeaders)}\n\n`);
    }
    return config;
});
function curlify(url, method, payload = null, headers = {}) {
    let curl = `curl -X ${method} '${url}'`;
    for (let h in headers) {
        curl += ` -H '${h}: ${headers[h]}'`;
    }
    if (payload) {
        curl += ` -d '${typeof payload === 'string' ? payload : JSON.stringify(payload)}'`;
    }
    return curl;
}
const retryRequests = (err) => {
    if (!err.config) {
        return Promise.reject(err);
    }
    if (err.config.cacheKey) {
        removeCacheableRequestsInProgress(err.config.cacheKey);
    }
    if (shouldRetry(err)) {
        err.config.retriesCount = err.config.retriesCount | 0;
        const maxRetries = err.config.retries === undefined || err.config.retries === null
            ? DEFAULT_MAX_RETRIES
            : err.config.retries;
        const shouldRetry = err.config.retriesCount < maxRetries;
        if (shouldRetry) {
            err.config.retriesCount += 1;
            return new Promise(resolve => setTimeout(() => resolve(axios(err.config)), DEFAULT_RETRY_DELAY));
        }
    }
    return Promise.reject(err);
};
const shouldRetry = (error) => {
    // error.response is not always defined, as the error could be thrown before we get a response from the server
    // https://github.com/axios/axios/issues/960#issuecomment-398269712
    if (!error.response || !error.response.status) {
        return false;
    }
    return error.response.status == 429 || (error.response.status >= 500 && error.response.status <= 599);
};
const addAxiosRequestInterceptor = (customInterceptor) => {
    axios.interceptors.request.use(customInterceptor, error => Promise.reject(error));
};
const addAxiosResponseInterceptor = (customInterceptor) => {
    axios.interceptors.response.use(customInterceptor, error => Promise.reject(error));
};

const replaceHostnames = {};
function registerHostnameReplacing(fromHostname, toHostname) {
    if (Object.keys(replaceHostnames).length === 0) {
        // the first time we are called we must also register an axios interceptor:
        axios.interceptors.request.use(replaceHostnamesInterceptor, error => Promise.reject(error));
    }
    replaceHostnames[fromHostname] = toHostname;
}
const replaceHostnamesInterceptor = (config) => __awaiter(void 0, void 0, void 0, function* () {
    const originalUrl = new URL(config.url);
    if (replaceHostnames[originalUrl.hostname] === undefined) {
        return config;
    }
    originalUrl.hostname = replaceHostnames[originalUrl.hostname];
    config.url = originalUrl.toString();
    return config;
});

const TPDI_SERVICE_URL = 'https://services.sentinel-hub.com/api/v1/dataimport';
(function (TPDICollections) {
    TPDICollections["AIRBUS_PLEIADES"] = "AIRBUS_PLEIADES";
    TPDICollections["AIRBUS_SPOT"] = "AIRBUS_SPOT";
    TPDICollections["PLANET_SCOPE"] = "PLANET_SCOPE";
    TPDICollections["MAXAR_WORLDVIEW"] = "MAXAR_WORLDVIEW";
    TPDICollections["PLANET_SKYSAT"] = "PLANET_SKYSAT";
})(exports.TPDICollections || (exports.TPDICollections = {}));
(function (TPDProvider) {
    TPDProvider["AIRBUS"] = "AIRBUS";
    TPDProvider["PLANET"] = "PLANET";
    TPDProvider["MAXAR"] = "MAXAR";
})(exports.TPDProvider || (exports.TPDProvider = {}));
(function (AirbusProcessingLevel) {
    AirbusProcessingLevel["SENSOR"] = "SENSOR";
    AirbusProcessingLevel["ALBUM"] = "ALBUM";
})(exports.AirbusProcessingLevel || (exports.AirbusProcessingLevel = {}));
(function (AirbusConstellation) {
    AirbusConstellation["PHR"] = "PHR";
    AirbusConstellation["SPOT"] = "SPOT";
})(exports.AirbusConstellation || (exports.AirbusConstellation = {}));
(function (MaxarSensor) {
    MaxarSensor["WV01"] = "WV01";
    MaxarSensor["WV02"] = "WV02";
    MaxarSensor["WV03"] = "WV03";
    MaxarSensor["WV04"] = "WV04";
    MaxarSensor["GE01"] = "GE01";
})(exports.MaxarSensor || (exports.MaxarSensor = {}));
(function (PlanetProductBundle) {
    PlanetProductBundle["ANALYTIC"] = "analytic";
    PlanetProductBundle["ANALYTIC_UDM2"] = "analytic_udm2";
    PlanetProductBundle["ANALYTIC_SR"] = "analytic_sr";
    PlanetProductBundle["ANALYTIC_SR_UDM2"] = "analytic_sr_udm2";
    PlanetProductBundle["ANALYTIC_8B_UDM2"] = "analytic_8b_udm2";
    PlanetProductBundle["ANALYTIC_8B_SR_UDM2"] = "analytic_8b_sr_udm2";
    PlanetProductBundle["PANCHROMATIC"] = "panchromatic";
})(exports.PlanetProductBundle || (exports.PlanetProductBundle = {}));
(function (PlanetItemType) {
    PlanetItemType["PSScene"] = "PSScene";
    PlanetItemType["PSScene4Band"] = "PSScene4Band";
    PlanetItemType["SkySatCollect"] = "SkySatCollect";
})(exports.PlanetItemType || (exports.PlanetItemType = {}));
const PlanetSupportedProductBundles = {
    [exports.PlanetItemType.PSScene4Band]: [
        exports.PlanetProductBundle.ANALYTIC,
        exports.PlanetProductBundle.ANALYTIC_UDM2,
        exports.PlanetProductBundle.ANALYTIC_SR,
        exports.PlanetProductBundle.ANALYTIC_SR_UDM2,
    ],
    [exports.PlanetItemType.PSScene]: [
        exports.PlanetProductBundle.ANALYTIC_UDM2,
        exports.PlanetProductBundle.ANALYTIC_8B_UDM2,
        exports.PlanetProductBundle.ANALYTIC_SR_UDM2,
        exports.PlanetProductBundle.ANALYTIC_8B_SR_UDM2,
    ],
    [exports.PlanetItemType.SkySatCollect]: [
        exports.PlanetProductBundle.ANALYTIC_UDM2,
        exports.PlanetProductBundle.ANALYTIC_SR_UDM2,
        exports.PlanetProductBundle.PANCHROMATIC,
    ],
};
const MaxarProductBands = '4BB';
(function (TPDITransactionStatus) {
    TPDITransactionStatus["CREATED"] = "CREATED";
    TPDITransactionStatus["CANCELLED"] = "CANCELLED";
    TPDITransactionStatus["RUNNING"] = "RUNNING";
    TPDITransactionStatus["DONE"] = "DONE";
    TPDITransactionStatus["PARTIAL"] = "PARTIAL";
    TPDITransactionStatus["FAILED"] = "FAILED";
    TPDITransactionStatus["COMPLETED"] = "COMPLETED";
})(exports.TPDITransactionStatus || (exports.TPDITransactionStatus = {}));
(function (PlanetScopeHarmonization) {
    PlanetScopeHarmonization["PS2"] = "PS2";
    PlanetScopeHarmonization["NONE"] = "NONE";
    PlanetScopeHarmonization["SENTINEL2"] = "Sentinel-2";
})(exports.PlanetScopeHarmonization || (exports.PlanetScopeHarmonization = {}));
(function (ResamplingKernel) {
    ResamplingKernel["CC"] = "CC";
    ResamplingKernel["NN"] = "NN";
    ResamplingKernel["MTF"] = "MTF";
})(exports.ResamplingKernel || (exports.ResamplingKernel = {}));
(function (HLSConstellation) {
    HLSConstellation["LANDSAT"] = "LANDSAT";
    HLSConstellation["SENTINEL"] = "SENTINEL";
})(exports.HLSConstellation || (exports.HLSConstellation = {}));

class AbstractTPDProvider {
    getProvider() {
        return this.provider;
    }
    addSearchPagination(requestConfig, count, viewtoken) {
        let queryParams = {};
        //set page size
        if (!isNaN(count)) {
            queryParams.count = count;
        }
        //set offset
        if (viewtoken) {
            queryParams.viewtoken = viewtoken;
        }
        requestConfig.params = queryParams;
    }
    getCommonSearchParams(params) {
        const payload = {};
        //provider
        payload['provider'] = this.provider;
        //bounds
        //Defines the request bounds by specifying the bounding box and/or geometry for the request.
        if (!params.bbox && !params.geometry) {
            throw new Error('Parameter bbox and/or geometry must be specified');
        }
        const bounds = {};
        if (!!params.bbox) {
            bounds.bbox = [params.bbox.minX, params.bbox.minY, params.bbox.maxX, params.bbox.maxY];
            bounds.properties = {
                crs: params.bbox.crs.opengisUrl,
            };
        }
        if (!!params.geometry) {
            if (!params.crs) {
                throw new Error('Parameter crs must be specified');
            }
            bounds.geometry = params.geometry;
            bounds.properties = {
                crs: params.crs.opengisUrl,
            };
        }
        payload.bounds = bounds;
        return payload;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getAdditionalSearchParams(params) {
        return {};
    }
    getSearchPayload(params) {
        const commonParams = this.getCommonSearchParams(params);
        const additionalParams = this.getAdditionalSearchParams(params);
        const payload = Object.assign(Object.assign({}, commonParams), additionalParams);
        return payload;
    }
    getAdditionalTransactionParams(items, // eslint-disable-line @typescript-eslint/no-unused-vars
    searchParams, // eslint-disable-line @typescript-eslint/no-unused-vars
    transactionParams) {
        return {};
    }
    getTransactionPayload(name, collectionId, items, searchParams, transactionParams = null) {
        const payload = {};
        if (!!name) {
            payload.name = name;
        }
        if (!!collectionId) {
            payload.collectionId = collectionId;
        }
        payload.input = this.getAdditionalTransactionParams(items, searchParams, transactionParams);
        return payload;
    }
    checkSubscriptionsSupported() {
        throw new Error('Subscriptions are not supported for selected provider');
    }
}

class AirbusDataProvider extends AbstractTPDProvider {
    constructor() {
        super();
        this.provider = exports.TPDProvider.AIRBUS;
    }
    getAdditionalSearchParams(params) {
        const data = {};
        //constellation is a required parameter
        if (!params.constellation) {
            throw new Error('Parameter constellation must be specified');
        }
        data.constellation = params.constellation;
        //datafilter
        const dataFilter = {};
        if (!params.fromTime) {
            throw new Error('Parameter fromTime must be specified');
        }
        if (!params.toTime) {
            throw new Error('Parameter toTime must be specified');
        }
        dataFilter.timeRange = {
            from: params.fromTime.toISOString(),
            to: params.toTime.toISOString(),
        };
        if (!isNaN(params.maxCloudCoverage)) {
            dataFilter.maxCloudCoverage = params.maxCloudCoverage;
        }
        if (!!params.processingLevel) {
            dataFilter.processingLevel = params.processingLevel;
        }
        if (!isNaN(params.maxSnowCoverage)) {
            dataFilter.maxSnowCoverage = params.maxSnowCoverage;
        }
        if (!isNaN(params.maxIncidenceAngle)) {
            dataFilter.maxIncidenceAngle = params.maxIncidenceAngle;
        }
        if (!!params.expiredFromTime && !!params.expiredToTime) {
            dataFilter.expirationDate = {
                from: params.expiredFromTime.toISOString(),
                to: params.expiredToTime.toISOString(),
            };
        }
        data.dataFilter = dataFilter;
        return { data: [data] };
    }
    getAdditionalTransactionParams(items, searchParams) {
        const input = this.getSearchPayload(searchParams);
        if (!!items && items.length) {
            const dataObject = input.data[0];
            dataObject.products = items.map(item => ({ id: item }));
            delete dataObject.dataFilter;
        }
        return input;
    }
}

class PlanetDataProvider extends AbstractTPDProvider {
    constructor() {
        super();
        this.provider = exports.TPDProvider.PLANET;
    }
    getAdditionalSearchParams(params) {
        const data = {};
        //itemType is a required parameter
        if (!params.itemType) {
            throw new Error('Parameter itemType must be specified');
        }
        data.itemType = params.itemType;
        //productBundle is a required parameter
        if (!params.productBundle) {
            throw new Error('Parameter productBundle must be specified');
        }
        data.productBundle = params.productBundle;
        //check if productBundle is supported for selected itemType
        if (PlanetSupportedProductBundles[params.itemType] &&
            !PlanetSupportedProductBundles[params.itemType].includes(params.productBundle)) {
            throw new Error(`Product bundle is not supported for selected item type`);
        }
        //datafilter
        const dataFilter = {};
        if (!params.fromTime) {
            throw new Error('Parameter fromTime must be specified');
        }
        if (!params.toTime) {
            throw new Error('Parameter toTime must be specified');
        }
        dataFilter.timeRange = {
            from: params.fromTime.toISOString(),
            to: params.toTime.toISOString(),
        };
        if (!isNaN(params.maxCloudCoverage)) {
            dataFilter.maxCloudCoverage = params.maxCloudCoverage;
        }
        if (!!params.nativeFilter) {
            dataFilter.nativeFilter = params.nativeFilter;
        }
        data.dataFilter = dataFilter;
        return {
            data: [data],
        };
    }
    getAdditionalTransactionParams(items, searchParams, transactionParams) {
        const input = this.getSearchPayload(searchParams);
        const dataObject = input.data[0];
        if (transactionParams === null || transactionParams === void 0 ? void 0 : transactionParams.harmonizeTo) {
            dataObject.harmonizeTo = transactionParams.harmonizeTo;
        }
        if (!(transactionParams === null || transactionParams === void 0 ? void 0 : transactionParams.planetApiKey)) {
            throw new Error('Parameter planetApiKey must be specified');
        }
        input.planetApiKey = transactionParams.planetApiKey;
        if (!!items && items.length) {
            dataObject.itemIds = items;
            delete dataObject.dataFilter;
        }
        return input;
    }
    checkSubscriptionsSupported() {
        return true;
    }
}

class MaxarDataProvider extends AbstractTPDProvider {
    constructor() {
        super();
        this.provider = exports.TPDProvider.MAXAR;
    }
    addSearchPagination() { }
    getAdditionalSearchParams(params) {
        const data = {};
        //productBands is a required parameter with value of MaxarProductBands
        data.productBands = MaxarProductBands;
        //datafilter
        const dataFilter = {};
        if (!params.fromTime) {
            throw new Error('Parameter fromTime must be specified');
        }
        if (!params.toTime) {
            throw new Error('Parameter toTime must be specified');
        }
        dataFilter.timeRange = {
            from: params.fromTime.toISOString(),
            to: params.toTime.toISOString(),
        };
        if (!isNaN(params.maxCloudCoverage)) {
            dataFilter.maxCloudCoverage = params.maxCloudCoverage;
        }
        if (!isNaN(params.minOffNadir)) {
            dataFilter.minOffNadir = params.minOffNadir;
        }
        if (!isNaN(params.maxOffNadir)) {
            dataFilter.maxOffNadir = params.maxOffNadir;
        }
        if (!isNaN(params.minSunElevation)) {
            dataFilter.minSunElevation = params.minSunElevation;
        }
        if (!isNaN(params.maxSunElevation)) {
            dataFilter.maxSunElevation = params.maxSunElevation;
        }
        if (!!params.sensor) {
            dataFilter.sensor = params.sensor;
        }
        data.dataFilter = dataFilter;
        return { data: [data] };
    }
    getAdditionalTransactionParams(items, searchParams, transactionParams) {
        const input = this.getSearchPayload(searchParams);
        const dataObject = input.data[0];
        if (transactionParams === null || transactionParams === void 0 ? void 0 : transactionParams.productKernel) {
            dataObject.productKernel = transactionParams.productKernel;
        }
        if (!!items && items.length) {
            dataObject.selectedImages = items;
            delete dataObject.dataFilter;
        }
        return input;
    }
}

const dataProviders = [new AirbusDataProvider(), new PlanetDataProvider(), new MaxarDataProvider()];
function getThirdPartyDataProvider(provider) {
    const tpdp = dataProviders.find(p => p.getProvider() === provider);
    if (!tpdp) {
        throw new Error(`Unknown data provider ${provider}`);
    }
    return tpdp;
}
function getQuotasInner(TDPICollectionId, reqConfig) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield ensureTimeout((innerReqConfig) => __awaiter(this, void 0, void 0, function* () {
            const requestConfig = createRequestConfig(innerReqConfig);
            if (!!TDPICollectionId) {
                requestConfig.params = { collectionId: TDPICollectionId };
            }
            const res = yield axios.get(`${TPDI_SERVICE_URL}/quotas`, requestConfig);
            return res.data.data;
        }), reqConfig);
    });
}
function createRequestConfig(innerReqConfig) {
    const authToken = innerReqConfig && innerReqConfig.authToken ? innerReqConfig.authToken : getAuthToken();
    if (!authToken) {
        throw new Error('Must be authenticated to perform request');
    }
    const headers = {
        Authorization: `Bearer ${authToken}`,
    };
    const requestConfig = Object.assign({ responseType: 'json', headers: headers }, getAxiosReqParams(innerReqConfig, CACHE_CONFIG_NOCACHE));
    return requestConfig;
}
function getTransactions(serviceEndpoint, params, reqConfig, count, viewtoken) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield ensureTimeout((innerReqConfig) => __awaiter(this, void 0, void 0, function* () {
            const requestConfig = createRequestConfig(innerReqConfig);
            let queryParams = {};
            if (params) {
                queryParams = Object.assign({}, params);
            }
            if (!isNaN(count) && count !== null) {
                //set page size
                queryParams.count = count;
            }
            //set offset
            if (viewtoken) {
                queryParams.viewtoken = viewtoken;
            }
            requestConfig.params = queryParams;
            //`${TPDI_SERVICE_URL}/orders`
            const { data } = yield axios.get(serviceEndpoint, requestConfig);
            return data;
        }), reqConfig);
    });
}
function getTransaction(serviceEndpoint, id, reqConfig) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield ensureTimeout((innerReqConfig) => __awaiter(this, void 0, void 0, function* () {
            const requestConfig = createRequestConfig(innerReqConfig);
            const { data } = yield axios.get(`${serviceEndpoint}/${id}`, requestConfig);
            return data;
        }), reqConfig);
    });
}
function deleteTransaction(serviceEndpoint, id, reqConfig) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield ensureTimeout((innerReqConfig) => __awaiter(this, void 0, void 0, function* () {
            const requestConfig = createRequestConfig(innerReqConfig);
            yield axios.delete(`${serviceEndpoint}/${id}`, requestConfig);
        }), reqConfig);
    });
}
function confirmTransaction(serviceEndpoint, id, reqConfig) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield ensureTimeout((innerReqConfig) => __awaiter(this, void 0, void 0, function* () {
            const requestConfig = createRequestConfig(innerReqConfig);
            const { data } = yield axios.post(`${serviceEndpoint}/${id}/confirm`, {}, requestConfig);
            return data;
        }), reqConfig);
    });
}
function cancelTransaction(serviceEndpoint, id, reqConfig) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield ensureTimeout((innerReqConfig) => __awaiter(this, void 0, void 0, function* () {
            const requestConfig = createRequestConfig(innerReqConfig);
            const { data } = yield axios.post(`${serviceEndpoint}/${id}/cancel`, {}, requestConfig);
            return data;
        }), reqConfig);
    });
}
function createTransaction(serviceEndpoint, tpdiProvider, name, collectionId, items, searchParams, transactionParams, reqConfig) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield ensureTimeout((innerReqConfig) => __awaiter(this, void 0, void 0, function* () {
            const requestConfig = createRequestConfig(innerReqConfig);
            const payload = tpdiProvider.getTransactionPayload(name, collectionId, items, searchParams, transactionParams);
            const { data } = yield axios.post(serviceEndpoint, payload, requestConfig);
            return data;
        }), reqConfig);
    });
}
class TPDI {
    static getQuota(TDPICollectionId, reqConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!TDPICollectionId) {
                throw new Error('TDPICollectionId must be provided');
            }
            const quotas = yield getQuotasInner(TDPICollectionId, reqConfig);
            return quotas.length ? quotas[0] : null;
        });
    }
    static getQuotas(reqConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield getQuotasInner(null, reqConfig);
        });
    }
    static search(provider, params, reqConfig, count = 10, viewtoken = null) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield ensureTimeout((innerReqConfig) => __awaiter(this, void 0, void 0, function* () {
                const requestConfig = createRequestConfig(innerReqConfig);
                const tpdp = getThirdPartyDataProvider(provider);
                tpdp.addSearchPagination(requestConfig, count, viewtoken);
                const payload = tpdp.getSearchPayload(params);
                const response = yield axios.post(`${TPDI_SERVICE_URL}/search`, payload, requestConfig);
                return response.data;
            }), reqConfig);
        });
    }
    static getThumbnail(collectionId, productId, reqConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!collectionId) {
                throw new Error('collectionId must be provided');
            }
            if (!productId) {
                throw new Error('productId must be provided');
            }
            return yield ensureTimeout((innerReqConfig) => __awaiter(this, void 0, void 0, function* () {
                const requestConfig = createRequestConfig(innerReqConfig);
                requestConfig.responseType = 'blob';
                const response = yield axios.get(`${TPDI_SERVICE_URL}/collections/${collectionId}/products/${productId}/thumbnail`, requestConfig);
                const thumbnail = response.data;
                return thumbnail;
            }), reqConfig);
        });
    }
    static createOrder(provider, name, collectionId, items, searchParams, orderParams, reqConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            const tpdiProvider = getThirdPartyDataProvider(provider);
            return yield createTransaction(`${TPDI_SERVICE_URL}/orders`, tpdiProvider, name, collectionId, items, searchParams, orderParams, reqConfig);
        });
    }
    static createSubscription(provider, name, collectionId, items, searchParams, subscriptionParams, reqConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            const tpdiProvider = getThirdPartyDataProvider(provider);
            tpdiProvider.checkSubscriptionsSupported();
            return yield createTransaction(`${TPDI_SERVICE_URL}/subscriptions`, tpdiProvider, name, collectionId, items, searchParams, subscriptionParams, reqConfig);
        });
    }
    static getOrders(params, reqConfig, count, viewtoken) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield getTransactions(`${TPDI_SERVICE_URL}/orders`, params, reqConfig, count, viewtoken);
        });
    }
    static getSubscriptions(params, reqConfig, count, viewtoken) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield getTransactions(`${TPDI_SERVICE_URL}/subscriptions`, params, reqConfig, count, viewtoken);
        });
    }
    static getOrder(orderId, reqConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield getTransaction(`${TPDI_SERVICE_URL}/orders`, orderId, reqConfig);
        });
    }
    static getSubscription(id, reqConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield getTransaction(`${TPDI_SERVICE_URL}/orders`, id, reqConfig);
        });
    }
    static deleteOrder(orderId, reqConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield deleteTransaction(`${TPDI_SERVICE_URL}/orders`, orderId, reqConfig);
        });
    }
    static deleteSubscription(id, reqConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield deleteTransaction(`${TPDI_SERVICE_URL}/subscriptions`, id, reqConfig);
        });
    }
    static confirmOrder(orderId, reqConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield confirmTransaction(`${TPDI_SERVICE_URL}/orders`, orderId, reqConfig);
        });
    }
    static confirmSubscription(id, reqConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield confirmTransaction(`${TPDI_SERVICE_URL}/subscriptions`, id, reqConfig);
        });
    }
    static cancelSubscription(id, reqConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield cancelTransaction(`${TPDI_SERVICE_URL}/subscriptions`, id, reqConfig);
        });
    }
    static getCompatibleCollections(provider, params, reqConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield ensureTimeout((innerReqConfig) => __awaiter(this, void 0, void 0, function* () {
                const requestConfig = createRequestConfig(innerReqConfig);
                const tpdp = getThirdPartyDataProvider(provider);
                const searchPayload = tpdp.getSearchPayload(params);
                const payload = { input: searchPayload };
                let compatibleCollections;
                const { data } = yield axios.post(`${TPDI_SERVICE_URL}/orders/searchcompatiblecollections/`, payload, requestConfig);
                if (data === null || data === void 0 ? void 0 : data.data) {
                    compatibleCollections = data.data.map((c) => ({ id: c.id, name: c.name }));
                }
                return compatibleCollections;
            }), reqConfig);
        });
    }
}

registerInitialAxiosInterceptors();

exports.LayersFactory = LayersFactory;
exports.DATASET_BYOC = DATASET_BYOC;
exports.DATASET_AWSEU_S1GRD = DATASET_AWSEU_S1GRD;
exports.DATASET_EOCLOUD_S1GRD = DATASET_EOCLOUD_S1GRD;
exports.DATASET_CDAS_S1GRD = DATASET_CDAS_S1GRD;
exports.DATASET_S2L2A = DATASET_S2L2A;
exports.DATASET_S2L1C = DATASET_S2L1C;
exports.DATASET_CDAS_S2L2A = DATASET_CDAS_S2L2A;
exports.DATASET_CDAS_S2L1C = DATASET_CDAS_S2L1C;
exports.DATASET_S3SLSTR = DATASET_S3SLSTR;
exports.DATASET_S3OLCI = DATASET_S3OLCI;
exports.DATASET_S5PL2 = DATASET_S5PL2;
exports.DATASET_AWS_L8L1C = DATASET_AWS_L8L1C;
exports.DATASET_AWS_LOTL1 = DATASET_AWS_LOTL1;
exports.DATASET_AWS_LOTL2 = DATASET_AWS_LOTL2;
exports.DATASET_AWS_LTML1 = DATASET_AWS_LTML1;
exports.DATASET_AWS_LTML2 = DATASET_AWS_LTML2;
exports.DATASET_AWS_LMSSL1 = DATASET_AWS_LMSSL1;
exports.DATASET_AWS_LETML1 = DATASET_AWS_LETML1;
exports.DATASET_AWS_LETML2 = DATASET_AWS_LETML2;
exports.DATASET_EOCLOUD_LANDSAT5 = DATASET_EOCLOUD_LANDSAT5;
exports.DATASET_EOCLOUD_LANDSAT7 = DATASET_EOCLOUD_LANDSAT7;
exports.DATASET_EOCLOUD_LANDSAT8 = DATASET_EOCLOUD_LANDSAT8;
exports.DATASET_AWS_HLS = DATASET_AWS_HLS;
exports.DATASET_EOCLOUD_ENVISAT_MERIS = DATASET_EOCLOUD_ENVISAT_MERIS;
exports.DATASET_MODIS = DATASET_MODIS;
exports.DATASET_AWS_DEM = DATASET_AWS_DEM;
exports.DATASET_AWSUS_DEM = DATASET_AWSUS_DEM;
exports.WmsLayer = WmsLayer;
exports.WmtsLayer = WmtsLayer;
exports.PlanetNicfiLayer = PlanetNicfiLayer;
exports.S1GRDAWSEULayer = S1GRDAWSEULayer;
exports.S1GRDEOCloudLayer = S1GRDEOCloudLayer;
exports.S1GRDCDASLayer = S1GRDCDASLayer;
exports.S2L2ALayer = S2L2ALayer;
exports.S2L1CLayer = S2L1CLayer;
exports.S2L2ACDASLayer = S2L2ACDASLayer;
exports.S2L1CCDASLayer = S2L1CCDASLayer;
exports.S3SLSTRLayer = S3SLSTRLayer;
exports.S3OLCILayer = S3OLCILayer;
exports.S5PL2Layer = S5PL2Layer;
exports.EnvisatMerisEOCloudLayer = EnvisatMerisEOCloudLayer;
exports.MODISLayer = MODISLayer;
exports.DEMAWSUSLayer = DEMAWSUSLayer;
exports.DEMLayer = DEMLayer;
exports.Landsat5EOCloudLayer = Landsat5EOCloudLayer;
exports.Landsat7EOCloudLayer = Landsat7EOCloudLayer;
exports.Landsat8EOCloudLayer = Landsat8EOCloudLayer;
exports.Landsat8AWSLayer = Landsat8AWSLayer;
exports.Landsat8AWSLOTL1Layer = Landsat8AWSLOTL1Layer;
exports.Landsat8AWSLOTL2Layer = Landsat8AWSLOTL2Layer;
exports.Landsat45AWSLTML1Layer = Landsat45AWSLTML1Layer;
exports.Landsat45AWSLTML2Layer = Landsat45AWSLTML2Layer;
exports.Landsat15AWSLMSSL1Layer = Landsat15AWSLMSSL1Layer;
exports.Landsat7AWSLETML1Layer = Landsat7AWSLETML1Layer;
exports.Landsat7AWSLETML2Layer = Landsat7AWSLETML2Layer;
exports.HLSAWSLayer = HLSAWSLayer;
exports.BYOCLayer = BYOCLayer;
exports.ProcessingDataFusionLayer = ProcessingDataFusionLayer;
exports.setAuthToken = setAuthToken;
exports.isAuthTokenSet = isAuthTokenSet;
exports.requestAuthToken = requestAuthToken;
exports.SUPPORTED_CRS_OBJ = SUPPORTED_CRS_OBJ;
exports.CRS_EPSG4326 = CRS_EPSG4326;
exports.CRS_EPSG3857 = CRS_EPSG3857;
exports.CRS_WGS84 = CRS_WGS84;
exports.MimeTypes = MimeTypes;
exports.BBox = BBox;
exports.setDebugEnabled = setDebugEnabled;
exports.CancelToken = CancelToken;
exports.isCancelled = isCancelled;
exports.invalidateCaches = invalidateCaches;
exports.registerHostnameReplacing = registerHostnameReplacing;
exports.setDefaultRequestsConfig = setDefaultRequestsConfig;
exports.drawBlobOnCanvas = drawBlobOnCanvas;
exports.canvasToBlob = canvasToBlob;
exports.SHV3_LOCATIONS_ROOT_URL = SHV3_LOCATIONS_ROOT_URL;
exports.legacyGetMapFromUrl = legacyGetMapFromUrl;
exports.legacyGetMapWmsUrlFromParams = legacyGetMapWmsUrlFromParams;
exports.legacyGetMapFromParams = legacyGetMapFromParams;
exports.parseLegacyWmsGetMapParams = parseLegacyWmsGetMapParams;
exports._wmsGetMapUrl = wmsGetMapUrl;
exports.StatisticsUtils = StatisticsUtils;
exports.TPDI = TPDI;
exports.PlanetSupportedProductBundles = PlanetSupportedProductBundles;
exports.addAxiosRequestInterceptor = addAxiosRequestInterceptor;
exports.addAxiosResponseInterceptor = addAxiosResponseInterceptor;
