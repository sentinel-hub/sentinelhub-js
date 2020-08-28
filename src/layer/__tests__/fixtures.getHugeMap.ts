import { S2L2ALayer, BBox, CRS_EPSG4326 } from '../../index';

export function constructFixtureGetMapTiff(): Record<any, any> {
  const layer = new S2L2ALayer({
    evalscript: '//VERSION=3\nreturn [B02, B02, B02];',
    maxCloudCoverPercent: 100,
  });
  const getMapParams = {
    bbox: new BBox(CRS_EPSG4326, 18, 20, 20, 22),
    fromTime: new Date(Date.UTC(2019, 11 - 1, 22, 0, 0, 0)),
    toTime: new Date(Date.UTC(2019, 12 - 1, 22, 23, 59, 59)),
    width: 2501,
    height: 2501,
    format: 'image/tiff',
  };

  return {
    layer: layer,
    getMapParams: getMapParams,
  };
}
