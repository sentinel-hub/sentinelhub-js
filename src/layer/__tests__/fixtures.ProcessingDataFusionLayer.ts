import { BBox, CRS_EPSG4326, MimeTypes } from '../../index';

export function constructFixtureGetMapRequest({
  bbox = new BBox(CRS_EPSG4326, 18, 20, 20, 22),
  width = 512,
  height = 512,
  format = MimeTypes.JPEG,
  evalscript = '',
  data = [] as any[],
}): Record<any, any> {
  const expectedRequest = {
    evalscript: evalscript,
    input: {
      bounds: {
        bbox: [bbox.minX, bbox.minY, bbox.maxX, bbox.maxY],
        properties: { crs: bbox.crs.opengisUrl },
      },
      data: data,
    },
    output: {
      width: width,
      height: height,
      responses: [
        {
          format: {
            type: format,
          },
          identifier: 'default',
        },
      ],
    },
  };

  return {
    expectedRequest: expectedRequest,
  };
}
