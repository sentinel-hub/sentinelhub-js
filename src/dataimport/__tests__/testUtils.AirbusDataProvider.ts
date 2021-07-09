import { TPDISearchParams, TPDProvider } from '../const';

export function checkSearchPayload(requestData: any, params: TPDISearchParams): void {
  expect(requestData.provider).toStrictEqual(TPDProvider.AIRBUS);
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
  const { dataFilter } = dataObject;
  expect(dataObject.constellation).toStrictEqual(params.constellation);
  expect(dataFilter.timeRange.from).toStrictEqual(params.fromTime.toISOString());
  expect(dataFilter.timeRange.to).toStrictEqual(params.toTime.toISOString());

  if (!isNaN(params.maxCloudCoverage)) {
    expect(dataFilter.maxCloudCoverage).toBeDefined();
    expect(dataFilter.maxCloudCoverage).toStrictEqual(params.maxCloudCoverage);
  } else {
    expect(dataFilter.maxCloudCoverage).toBeUndefined();
  }

  if (!!params.processingLevel) {
    expect(dataFilter.processingLevel).toBeDefined();
    expect(dataFilter.processingLevel).toStrictEqual(params.processingLevel);
  } else {
    expect(dataFilter.processingLevel).toBeUndefined();
  }

  if (!isNaN(params.maxSnowCoverage)) {
    expect(dataFilter.maxSnowCoverage).toBeDefined();
    expect(dataFilter.maxSnowCoverage).toStrictEqual(params.maxSnowCoverage);
  } else {
    expect(dataFilter.maxSnowCoverage).toBeUndefined();
  }

  if (!isNaN(params.maxIncidenceAngle)) {
    expect(dataFilter.maxIncidenceAngle).toBeDefined();
    expect(dataFilter.maxIncidenceAngle).toStrictEqual(params.maxIncidenceAngle);
  } else {
    expect(dataFilter.maxIncidenceAngle).toBeUndefined();
  }

  if (!!params.expiredFromTime && !!params.expiredToTime) {
    expect(dataFilter.expirationDate).toBeDefined();
    expect(dataFilter.expirationDate.from).toStrictEqual(params.expiredFromTime.toISOString());
    expect(dataFilter.expirationDate.to).toStrictEqual(params.expiredToTime.toISOString());
  } else {
    expect(dataFilter.expirationDate).toBeUndefined();
  }
}
