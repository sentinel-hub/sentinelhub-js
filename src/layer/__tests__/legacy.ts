import moment from 'moment';
import '../../../jest-setup';

import { parseLegacyWmsGetMapParams, BBox, CRS_EPSG3857, GetMapParams, PreviewMode } from '../../index';

test('parseLegacyWmsGetMapParams with evalscripturl', () => {
  const evalscriptUrlOriginal =
    'https://gist.githubusercontent.com/sinergise-anze/33fe78d9b1fd24d656882d7916a83d4d/raw/295b9d9f033c7e3f1e533363322d84846808564c/data-fusion-evalscript.js';
  const wmsParams = {
    service: 'WMS',
    request: 'GetMap',
    showlogo: 'false',
    maxcc: '70',
    time: '2019-12-22/2019-12-22',
    crs: 'EPSG:3857',
    format: 'image/jpeg',
    bbox: [1282655, 5053636, 1500575, 5238596],
    evalscripturl: evalscriptUrlOriginal,
    evalsource: 'S2',
    layers: '1_TRUE_COLOR',
    width: 1700,
    height: 605,
    nicename: 'Sentinel-2+L1C+from+2019-12-22.jpg',
    transparent: '1',
    bgcolor: '00000000',
    preview: 3,
    gain: 0.7,
    gamma: 0.9,
  };
  const { layers, evalscript, evalscriptUrl, evalsource, getMapParams, otherLayerParams } =
    parseLegacyWmsGetMapParams(wmsParams);

  expect(evalscript).toEqual(null);
  expect(evalscriptUrl).toEqual(evalscriptUrlOriginal);
  expect(evalsource).toEqual('S2');
  expect(layers).toEqual('1_TRUE_COLOR');

  const expectedGetMapParams: GetMapParams = {
    bbox: new BBox(CRS_EPSG3857, 1282655, 5053636, 1500575, 5238596),
    fromTime: moment.utc('2019-12-22').startOf('day').toDate(),
    toTime: moment.utc('2019-12-22').endOf('day').toDate(),
    format: 'image/jpeg',
    width: 1700,
    height: 605,
    preview: PreviewMode.EXTENDED_PREVIEW,
    nicename: 'Sentinel-2+L1C+from+2019-12-22.jpg',
    showlogo: false,
    bgcolor: '00000000',
    transparent: true,
    effects: {
      gain: 0.7,
      gamma: 0.9,
    },
    // we are not testing unknown params field:
    unknown: getMapParams.unknown,
  };
  expect(getMapParams).toStrictEqual(expectedGetMapParams);
  expect(otherLayerParams).toStrictEqual({
    maxCloudCoverPercent: 70,
  });
});
