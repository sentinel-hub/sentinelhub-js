import { OgcServiceTypes, SH_SERVICE_ROOT_URL } from '../const';
import { createGetCapabilitiesXmlUrl, getSHServiceRootUrlFromBaseUrl } from '../utils';

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
