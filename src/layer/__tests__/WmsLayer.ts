import { BBox, CRS_EPSG4326, ApiType, MimeTypes, WmsLayer } from 'src';
import { assertUrlIncludesParams } from 'src/testutils';

expect.extend({
  toIncludeQueryParam(received, requestedParams) {
    try {
      assertUrlIncludesParams(received, requestedParams);
      return {
        message: () =>
          `URL [${received}] should not include all of the values [${String(requestedParams)}], but it does`, // this is printed out if we use .not
        pass: true,
      };
    } catch (errMsg) {
      return {
        message: () => errMsg,
        pass: false,
      };
    }
  },
});

declare global {
  namespace jest {
    interface Matchers<R> {
      toIncludeQueryParam(requestedParams: Record<string, string>): R;
    }
  }
}

test('WmsLayer.getMapUrl returns an URL', () => {
  const bbox = new BBox(CRS_EPSG4326, 19, 20, 20, 21);
  const layer = new WmsLayer(
    'https://proba-v-mep.esa.int/applications/geo-viewer/app/geoserver/ows',
    'PROBAV_S1_TOA_333M',
  );

  const getMapParams = {
    bbox: bbox,
    fromTime: new Date(Date.UTC(2020, 1 - 1, 10, 0, 0, 0)), // 2020-01-10/2020-01-10
    toTime: new Date(Date.UTC(2020, 1 - 1, 10, 23, 59, 59)),
    width: 512,
    height: 512,
    format: MimeTypes.JPEG,
  };
  const imageUrl = layer.getMapUrl(getMapParams, ApiType.WMS);
  expect(imageUrl).toBe(
    'https://proba-v-mep.esa.int/applications/geo-viewer/app/geoserver/ows?version=1.1.1&service=WMS&request=GetMap&format=image%2Fjpeg&crs=EPSG%3A4326&layers=PROBAV_S1_TOA_333M&bbox=19%2C20%2C20%2C21&time=2020-01-10T00%3A00%3A00.000Z%2F2020-01-10T23%3A59%3A59.000Z&width=512&height=512&showlogo=false&transparent=true&',
  );
  expect(imageUrl).toIncludeQueryParam({ request: 'GetMap', crs: 'EPSG:4326' });
});
