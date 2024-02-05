import { BBox } from '../../bbox';
import { CRS_EPSG3857, CRS_EPSG4326 } from '../../crs';
import { OgcServiceTypes, SH_SERVICE_ROOT_URL } from '../const';
import {
  createGetCapabilitiesXmlUrl,
  ensureMercatorBBox,
  getSHServiceRootUrlFromBaseUrl,
  metersPerPixel,
} from '../utils';

const cases = [
  {
    input: 'https://some-place/sub/wmts?api_key=notAKey',
    ogcServiceType: OgcServiceTypes.WMTS,
    expected:
      'https://some-place/sub/wmts?service=wmts&request=GetCapabilities&format=text%2Fxml&api_key=notAKey',
  },
  {
    input: 'https://some-place/sub/wmts',
    ogcServiceType: OgcServiceTypes.WMTS,
    expected: 'https://some-place/sub/wmts?service=wmts&request=GetCapabilities&format=text%2Fxml',
  },
  {
    input: 'https://some-place/sub/someKey',
    ogcServiceType: OgcServiceTypes.WMS,
    expected: 'https://some-place/sub/someKey?service=wms&request=GetCapabilities&format=text%2Fxml',
  },
];

describe("'add' utility", () => {
  test.each(cases)('build getCapabilities url', ({ input, ogcServiceType, expected }) => {
    const url = createGetCapabilitiesXmlUrl(input, ogcServiceType);
    expect(url).toStrictEqual(expected);
  });
});

describe('getSHServiceRootUrlFromBaseUrl', () => {
  test.each([
    ['https://services.sentinel-hub.com/ogc/wms/instanceId', SH_SERVICE_ROOT_URL.default],
    ['https://services-uswest2.sentinel-hub.com/ogc/wms/instanceId', SH_SERVICE_ROOT_URL.default],
    ['https://creodias.sentinel-hub.com/ogc/wms/instanceId', SH_SERVICE_ROOT_URL.default],
    ['https://shservices.mundiwebservices.com/ogc/1wms/instanceId', SH_SERVICE_ROOT_URL.default],
    ['https://sh.dataspace.copernicus.eu/wms/instance', SH_SERVICE_ROOT_URL.cdse],
    ['', SH_SERVICE_ROOT_URL.default],
    [null, SH_SERVICE_ROOT_URL.default],
    [undefined, SH_SERVICE_ROOT_URL.default],
    ['not url', SH_SERVICE_ROOT_URL.default],
  ])('getSHServiceRootUrlFromBaseUrl %p', async (baseUrl, expected) => {
    expect(getSHServiceRootUrlFromBaseUrl(baseUrl)).toBe(expected);
  });
});

describe('ensureMercatorBBox', () => {
  test.each([
    {
      bbox: new BBox(
        CRS_EPSG3857,
        112.81332057952881,
        63.97041521013803,
        119.85694837570192,
        65.98227733565385,
      ),
      expected: new BBox(
        CRS_EPSG3857,
        112.81332057952881,
        63.97041521013803,
        119.85694837570192,
        65.98227733565385,
      ),
    },
    {
      bbox: new BBox(
        CRS_EPSG4326,
        -114.27429199218751,
        45.85176048817254,
        -112.17864990234376,
        48.21003212234042,
      ),
      expected: new BBox(
        CRS_EPSG3857,
        -12720955.995332174,
        5756625.474213193,
        -12487670.185005816,
        6141868.096770483,
      ),
    },
  ])('ensureMercatorBBox %p', ({ bbox, expected }) => {
    expect(ensureMercatorBBox(bbox)).toMatchObject(expected);
  });
});

describe('metersPerPixel', () => {
  test.each([
    {
      bbox: new BBox(
        CRS_EPSG3857,
        112.81332057952881,
        63.97041521013803,
        119.85694837570192,
        65.98227733565385,
      ),
      width: 512,
      expected: 0.01375708553868674,
    },
    {
      bbox: new BBox(
        CRS_EPSG3857,
        -15028131.257091936,
        2504688.542848655,
        -12523442.714243278,
        5009377.085697314,
      ),
      width: 512,
      expected: 4150.788658570558,
    },
    {
      bbox: new BBox(
        CRS_EPSG3857,
        -12601714.2312073,
        5870363.772301538,
        -12523442.714243278,
        5948635.289265559,
      ),
      width: 512,
      expected: 104.64937737265413,
    },
    {
      bbox: new BBox(
        CRS_EPSG4326,
        -114.27429199218751,
        45.85176048817254,
        -112.17864990234376,
        48.21003212234042,
      ),
      width: 512,
      expected: 310.4876808881625,
    },
  ])('metersPerPixel %p', ({ bbox, width, expected }) => {
    expect(metersPerPixel(bbox, width)).toEqual(expected);
  });
});
