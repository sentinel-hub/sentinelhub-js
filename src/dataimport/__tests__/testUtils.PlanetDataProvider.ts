import { TPDISearchParams, TPDProvider } from '../const';

export function checkSearchPayload(requestData: any, params: TPDISearchParams): void {
  expect(requestData.provider).toStrictEqual(TPDProvider.PLANET);

  if (!!params.bbox) {
    expect(requestData.bounds.bbox).toStrictEqual([
      params.bbox.minX,
      params.bbox.minY,
      params.bbox.maxX,
      params.bbox.maxY,
    ]);
  }
  if (!!params.geometry) {
    expect(requestData.bounds.geometry).toStrictEqual(params.geometry);
  }
  expect(requestData.bounds.properties.crs).toStrictEqual(params.bbox.crs.opengisUrl);
  const dataObject = requestData.data[0];

  expect(dataObject.itemType).toStrictEqual('PSScene4Band');

  const { dataFilter } = dataObject;
  expect(dataFilter.timeRange.from).toStrictEqual(params.fromTime.toISOString());
  expect(dataFilter.timeRange.to).toStrictEqual(params.toTime.toISOString());

  if (!isNaN(params.maxCloudCoverage)) {
    expect(dataFilter.maxCloudCoverage).toBeDefined();
    expect(dataFilter.maxCloudCoverage).toStrictEqual(params.maxCloudCoverage);
  } else {
    expect(dataFilter.maxCloudCoverage).toBeUndefined();
  }

  if (!!params.nativeFilter) {
    expect(dataFilter.nativeFilter).toBeDefined();
    expect(dataFilter.nativeFilter).toStrictEqual(params.nativeFilter);
  } else {
    expect(dataFilter.nativeFilter).toBeUndefined();
  }
}
