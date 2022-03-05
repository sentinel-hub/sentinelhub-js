import { TPDISearchParams, TPDProvider } from '../const';

export function checkSearchPayload(requestData: any, params: TPDISearchParams): void {
  expect(requestData.provider).toStrictEqual(TPDProvider.MAXAR);
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
  expect(dataFilter.timeRange.from).toStrictEqual(params.fromTime.toISOString());
  expect(dataFilter.timeRange.to).toStrictEqual(params.toTime.toISOString());

  if (!isNaN(params.maxCloudCoverage)) {
    expect(dataFilter.maxCloudCoverage).toBeDefined();
    expect(dataFilter.maxCloudCoverage).toStrictEqual(params.maxCloudCoverage);
  } else {
    expect(dataFilter.maxCloudCoverage).toBeUndefined();
  }

  if (!isNaN(params.minOffNadir)) {
    expect(dataFilter.minOffNadir).toBeDefined();
    expect(dataFilter.minOffNadir).toStrictEqual(params.minOffNadir);
  } else {
    expect(dataFilter.minOffNadir).toBeUndefined();
  }

  if (!isNaN(params.maxOffNadir)) {
    expect(dataFilter.maxOffNadir).toBeDefined();
    expect(dataFilter.maxOffNadir).toStrictEqual(params.maxOffNadir);
  } else {
    expect(dataFilter.maxOffNadir).toBeUndefined();
  }

  if (!isNaN(params.minSunElevation)) {
    expect(dataFilter.minSunElevation).toBeDefined();
    expect(dataFilter.minSunElevation).toStrictEqual(params.minSunElevation);
  } else {
    expect(dataFilter.minSunElevation).toBeUndefined();
  }

  if (!isNaN(params.maxSunElevation)) {
    expect(dataFilter.maxSunElevation).toBeDefined();
    expect(dataFilter.maxSunElevation).toStrictEqual(params.maxSunElevation);
  } else {
    expect(dataFilter.maxSunElevation).toBeUndefined();
  }

  if (!!params.sensor) {
    expect(dataFilter.sensor).toBeDefined();
    expect(dataFilter.sensor).toStrictEqual(params.sensor);
  } else {
    expect(dataFilter.sensor).toBeUndefined();
  }
}
