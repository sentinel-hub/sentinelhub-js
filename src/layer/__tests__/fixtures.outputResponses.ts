import { S2L2ALayer, BBox, CRS_EPSG4326, MimeTypes } from '../../index';

export function constructFixtureGetMapOutputResponses(): Record<any, any> {
  const layer = new S2L2ALayer({
    evalscript: `//VERSION=3
      function setup() {
        return {
          input: ["B02", "B03", "B04"],
          output: [{ id: "default", bands: 4 }, { id: "index", bands: 2 }]
        };
      }

      function evaluatePixel(sample) {
        return {
            default: [4 * sample.B04, 4 * sample.B03, 4 * sample.B02, sample.dataMask],
            index: [sample.B04, sample.dataMask] 
          };
      }`,
    maxCloudCoverPercent: 100,
  });

  const getMapParams = {
    bbox: new BBox(CRS_EPSG4326, 18, 20, 20, 22),
    fromTime: new Date(Date.UTC(2019, 11 - 1, 22, 0, 0, 0)),
    toTime: new Date(Date.UTC(2019, 12 - 1, 22, 23, 59, 59)),
    width: 512,
    height: 512,
    format: MimeTypes.JPEG,
  };

  const getMapParamsDefaultResponseId = { ...getMapParams, outputResponseId: 'default' };
  const getMapParamsEmptyOutputResponseId = { ...getMapParams, outputResponseId: '' };

  const buffer = new ArrayBuffer(8);
  const mockedResponse = (config: any): any => {
    if (config.responseType === 'arraybuffer') {
      return [200, buffer];
    }
  };

  return {
    layer: layer,
    getMapParams: getMapParams,
    getMapParamsDefaultResponseId: getMapParamsDefaultResponseId,
    getMapParamsEmptyOutputResponseId: getMapParamsEmptyOutputResponseId,
    mockedResponse: mockedResponse,
  };
}
