import moment from 'moment';

import {
  LinkType,
  S1GRDAWSEULayer,
  BBox,
  CRS_EPSG4326,
  AcquisitionMode,
  Polarization,
  Resolution,
  OrbitDirection,
} from '../../index';

export function constructFixtureFindTilesCatalog({
  sensingTime = '2020-04-27T16:57:29Z',
  hasMore = false,
  fromTime = new Date(Date.UTC(2020, 4 - 1, 1, 0, 0, 0, 0)),
  toTime = new Date(Date.UTC(2020, 5 - 1, 1, 23, 59, 59, 0)),
  bbox = new BBox(CRS_EPSG4326, 19, 20, 20, 21),
  acquisitionMode = AcquisitionMode.IW,
  polarization = Polarization.DV,
  resolution = Resolution.HIGH,
  orbitDirection = OrbitDirection.ASCENDING,
}): Record<any, any> {
  const layer = new S1GRDAWSEULayer({
    instanceId: 'INSTANCE_ID',
    layerId: 'LAYER_ID',
    acquisitionMode: acquisitionMode,
    polarization: polarization,
    resolution: resolution,
    orbitDirection: orbitDirection,
  });

  const expectedRequest: { [key: string]: any } = {
    bbox: [bbox.minX, bbox.minY, bbox.maxX, bbox.maxY],
    datetime: `${fromTime.toISOString()}/${toTime.toISOString()}`,
    collections: ['sentinel-1-grd'],
    limit: 5,
  };

  let args = [];
  if (acquisitionMode) {
    args.push({ op: '=', args: [{ property: 'sar:instrument_mode' }, acquisitionMode] });
  }

  if (polarization) {
    args.push({ op: '=', args: [{ property: 's1:polarization' }, polarization] });
  }

  if (resolution) {
    args.push({ op: '=', args: [{ property: 's1:resolution' }, resolution] });
  }

  if (orbitDirection) {
    args.push({ op: '=', args: [{ property: 'sat:orbit_state' }, orbitDirection] });
  }

  if (args) {
    expectedRequest['filter'] = { op: 'and', args: args };
    expectedRequest['filter-lang'] = 'cql2-json';
  }

  /* eslint-disable */
  const mockedResponse = {
    type: 'FeatureCollection',
    features: [
      {
        stac_version: '0.9.0',
        id: 'S1A_IW_GRDH_1SDV_20200427T165729_20200427T165754_032316_03BD58_7BA8',
        geometry: {
          type: 'MultiPolygon',
          crs: { type: 'name', properties: { name: 'urn:ogc:def:crs:OGC::CRS84' } },
          coordinates: [
            [
              [
                [13.244148485697472, 40.727978937583835],
                [13.665130955713822, 40.7887080080302],
                [13.96883196519702, 40.83148641241739],
                [14.427787275368955, 40.894514849407045],
                [14.743235009183755, 40.93670012931676],
                [15.041280914581412, 40.9757382388334],
                [15.501180093324484, 41.034364584113554],
                [15.802122514327156, 41.0716897173304],
                [16.180695129845954, 41.117435028171066],
                [16.138804800255237, 41.29699717296195],
                [16.100155728943736, 41.47703317060471],
                [16.06443532301079, 41.65741086345029],
                [16.031720247363854, 41.83813747031465],
                [15.990893023821858, 42.01791706562311],
                [15.953915811908542, 42.198141717667795],
                [15.874375511513158, 42.55793916374937],
                [15.862263336458655, 42.61760785070261],
                [15.475062481943887, 42.57224602159183],
                [15.161388040260345, 42.53446837015743],
                [14.848044918446945, 42.49582850512836],
                [14.378651678478029, 42.43625369222487],
                [14.068680537607882, 42.395794574064126],
                [13.613875065133012, 42.33481090349227],
                [13.306280454938168, 42.29248330605636],
                [12.863290469314197, 42.229968128908546],
                [12.886340007453795, 42.17140915132595],
                [12.927219211307504, 41.99039759381334],
                [12.970641849762204, 41.80975492934773],
                [13.025015928403883, 41.630687345589905],
                [13.059133307843451, 41.448720236051386],
                [13.244148485697472, 40.727978937583835],
              ],
            ],
          ],
        },
        bbox: [12.863290469314197, 40.727978937583835, 16.180695129845954, 42.61760785070261],
        stac_extensions: ['sar', 'sat', 'sar', 'sat'],
        type: 'Feature',
        properties: {
          datetime: '2020-04-27T16:57:29Z',
          'sar:frequency_band': 'C',
          'sar:instrument_mode': 'IW',
          instruments: ['c-sar'],
          constellation: 'sentinel-1',
          'sar:center_frequency': 5.405,
          timeliness: 'NRT3h',
          'sar:product_type': 'GRD',
          'sat:orbit_state': 'ascending',
          polarization: 'DV',
          resolution: 'HIGH',
          platform: 'sentinel-1a',
          'sar:polarizations': ['VV', 'VH'],
        },
        links: [
          {
            href: 'https://services.sentinel-hub.com/api/v1/catalog/collections/sentinel-1-grd/items/S1A_IW_GRDH_1SDV_20200427T165729_20200427T165754_032316_03BD58_7BA8',
            rel: 'self',
            type: 'application/json',
          },
          {
            href: 'https://services.sentinel-hub.com/api/v1/catalog/collections/sentinel-1-grd',
            rel: 'parent',
          },
        ],
        assets: {
          s3: {
            href: 's3://sentinel-s1-l1c/GRD/2020/4/27/IW/DV/S1A_IW_GRDH_1SDV_20200427T165729_20200427T165754_032316_03BD58_7BA8/',
            title: 's3',
            type: 'inode/directory',
          },
        },
      },
    ],
    links: [
      {
        href: 'https://services.sentinel-hub.com/api/v1/catalog/search',
        rel: 'self',
        type: 'application/json',
      },
    ],
    context: { limit: 50, returned: 3 },
  };

  /* eslint-enable */
  const expectedResultTiles = [
    {
      geometry: {
        type: 'MultiPolygon',
        crs: {
          type: 'name',
          properties: {
            name: 'urn:ogc:def:crs:OGC::CRS84',
          },
        },
        coordinates: [
          [
            [
              [13.244148485697472, 40.727978937583835],
              [13.665130955713822, 40.7887080080302],
              [13.96883196519702, 40.83148641241739],
              [14.427787275368955, 40.894514849407045],
              [14.743235009183755, 40.93670012931676],
              [15.041280914581412, 40.9757382388334],
              [15.501180093324484, 41.034364584113554],
              [15.802122514327156, 41.0716897173304],
              [16.180695129845954, 41.117435028171066],
              [16.138804800255237, 41.29699717296195],
              [16.100155728943736, 41.47703317060471],
              [16.06443532301079, 41.65741086345029],
              [16.031720247363854, 41.83813747031465],
              [15.990893023821858, 42.01791706562311],
              [15.953915811908542, 42.198141717667795],
              [15.874375511513158, 42.55793916374937],
              [15.862263336458655, 42.61760785070261],
              [15.475062481943887, 42.57224602159183],
              [15.161388040260345, 42.53446837015743],
              [14.848044918446945, 42.49582850512836],
              [14.378651678478029, 42.43625369222487],
              [14.068680537607882, 42.395794574064126],
              [13.613875065133012, 42.33481090349227],
              [13.306280454938168, 42.29248330605636],
              [12.863290469314197, 42.229968128908546],
              [12.886340007453795, 42.17140915132595],
              [12.927219211307504, 41.99039759381334],
              [12.970641849762204, 41.80975492934773],
              [13.025015928403883, 41.630687345589905],
              [13.059133307843451, 41.448720236051386],
              [13.244148485697472, 40.727978937583835],
            ],
          ],
        ],
      },
      sensingTime: moment.utc(sensingTime).toDate(),
      meta: {
        acquisitionMode: acquisitionMode,
        polarization: polarization,
        resolution: resolution,
        orbitDirection: orbitDirection,
      },
      links: [
        {
          target:
            's3://sentinel-s1-l1c/GRD/2020/4/27/IW/DV/S1A_IW_GRDH_1SDV_20200427T165729_20200427T165754_032316_03BD58_7BA8/',
          type: LinkType.AWS,
        },
      ],
    },
  ];
  return {
    fromTime: fromTime,
    toTime: toTime,
    bbox: bbox,
    layer: layer,
    mockedResponse: mockedResponse,
    expectedRequest: expectedRequest,
    expectedResultTiles: expectedResultTiles,
    expectedResultHasMore: hasMore,
  };
}
