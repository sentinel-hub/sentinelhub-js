import { GetMapParams } from './../const';
import { HLSAWSLayer } from './../HLSAWSLayer';
import { ApiType, HLSConstellation, setAuthToken } from '../../index';
import { BBox, CRS_EPSG4326 } from '../../index';

import { AUTH_TOKEN, mockNetwork } from './testUtils.findTiles';

const getMapParams: GetMapParams = {
  fromTime: new Date(Date.UTC(2020, 4 - 1, 1, 0, 0, 0, 0)),
  toTime: new Date(Date.UTC(2020, 5 - 1, 1, 23, 59, 59, 999)),
  bbox: new BBox(CRS_EPSG4326, 19, 20, 20, 21),
  width: 256,
  height: 256,
  format: 'image/png',
};

describe('Check constellation param is set correctly', () => {
  beforeEach(async () => {
    setAuthToken(AUTH_TOKEN);
    mockNetwork.reset();
  });

  test.each([[null], [undefined], [HLSConstellation.LANDSAT], [HLSConstellation.SENTINEL]])(
    'processing payload has constellation param',
    async (constellation) => {
      const layer = new HLSAWSLayer({
        evalscript: '//',
        constellation: constellation,
      });
      mockNetwork.onAny().reply(200);
      try {
        await layer.getMap(getMapParams, ApiType.PROCESSING, {
          cache: { expiresIn: 0 },
        });
      } catch (err) {}
      const request = mockNetwork.history.post[0];
      const data = JSON.parse(request.data);
      expect(data.input.data[0].type).toBe('HLS');
      const requestConstellation = data.input.data[0].dataFilter.constellation;
      if (constellation) {
        expect(requestConstellation).toEqual(constellation);
      } else {
        expect(requestConstellation).toBeUndefined();
      }
    },
  );
});
