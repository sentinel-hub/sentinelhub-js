import 'jest-setup';
import axios from 'src/layer/__mocks__/axios';

import {
  BBox,
  CRS_EPSG4326,
  S1GRDAWSEULayer,
  AcquisitionMode,
  Polarization,
  Resolution,
  OrbitDirection,
} from 'src';

test('timezone should NOT be UTC', () => {
  // We are testing correctness in case of local timezones, so it doesn't make sense to
  // run these tests in UTC timezone. Env var in package.json should take care of that, but we
  // check here just to be sure.
  expect(new Date().getTimezoneOffset()).not.toBe(0);
});

test.each([
  [true, '2018-11-28T11:12:13Z', new Date(Date.UTC(2018, 11 - 1, 28, 11, 12, 13))],
  [false, '2018-11-28T11:12:13Z', new Date(Date.UTC(2018, 11 - 1, 28, 11, 12, 13))],
  [false, '2018-11-11T00:01:02Z', new Date(Date.UTC(2018, 11 - 1, 11, 0, 1, 2))],
])(
  'S1GRDLayer.findTiles returns correct data (%p, %p, %p)',
  async (hasMoreFixture, sensingTimeFixture, expectedSensingTimeFixture) => {
    const fromTime = new Date(Date.UTC(2018, 11 - 1, 22, 0, 0, 0));
    const toTime = new Date(Date.UTC(2018, 12 - 1, 22, 23, 59, 59));
    const bbox = new BBox(CRS_EPSG4326, 19, 20, 20, 21);
    const layer = new S1GRDAWSEULayer({
      instanceId: 'INSTANCE_ID',
      layerId: 'LAYER_ID',
      acquisitionMode: AcquisitionMode.IW,
      polarization: Polarization.DV,
      resolution: Resolution.HIGH,
    });

    // mock a single-tile response:
    axios.post.mockReset();
    axios.post.mockImplementation(() =>
      Promise.resolve({
        data: {
          type: 'FeatureCollection',
          features: [
            {
              stac_version: '0.9.0', // eslint-disable-line @typescript-eslint/camelcase
              id: 'S1A_IW_GRDH_1SDV_20200115T170610_20200115T170635_030814_0388F3_11A7',
              geometry: {
                type: 'MultiPolygon',
                crs: { type: 'name', properties: { name: 'urn:ogc:def:crs:OGC::CRS84' } },
                coordinates: [
                  [
                    [
                      [10.747405608925893, 42.43932544098019],
                      [11.174559661855323, 42.49948950981189],
                      [11.48636468315132, 42.542316684293304],
                      [11.954861073590815, 42.60496680037157],
                      [12.267707233856488, 42.64566963277932],
                      [10.747405608925893, 42.43932544098019],
                    ],
                  ],
                ],
              },
              bbox: [10.35502790347227, 42.43932544098019, 13.762200171216843, 44.327853749919164],
              stac_extensions: ['sar'], // eslint-disable-line @typescript-eslint/camelcase
              type: 'Feature',
              properties: {
                datetime: sensingTimeFixture,
                'sar:frequency_band': 'C',
                'sar:instrument_mode': 'IW',
                's1:polarization': 'DV',
                'sar:center_frequency': 5.405,
                'sar:product_type': 'GRD',
                'sat:orbit_state': 'ascending',
                'sar:polarizations': ['VV', 'VH'],
              },
              links: [
                {
                  href:
                    'https://test.sentinel-hub.com/catalog/v1/collections/sentinel-1-grd/items/S1A_IW_GRDH_1SDV_20200115T170610_20200115T170635_030814_0388F3_11A7',
                  rel: 'self',
                  type: 'application/json',
                },
                {
                  href: 'https://test.sentinel-hub.com/catalog/v1/collections/sentinel-1-grd',
                  rel: 'parent',
                },
              ],
              assets: {},
            },
          ],
          links: [
            {
              href: 'https://demo.sentinel-hub.com/catalog/v1/search',
              rel: 'self',
              type: 'application/json',
            },
            {
              href: 'https://test.sentinel-hub.com/catalog/v1/search',
              rel: 'next',
              type: 'application/json',
              title: 'Next set of results',
              method: 'POST',
              body: { next: 5 },
              merge: true,
            },
          ],
          'search:metadata': { next: hasMoreFixture ? '1' : undefined, limit: 1, returned: 1 },
        },
      }),
    );

    const { tiles, hasMore } = await layer.findTiles(bbox, fromTime, toTime, 5, 0);

    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(hasMore).toBe(hasMoreFixture);
    expect(tiles).toStrictEqual([
      {
        geometry: {
          type: 'MultiPolygon',
          crs: { type: 'name', properties: { name: 'urn:ogc:def:crs:OGC::CRS84' } },
          coordinates: [
            [
              [
                [10.747405608925893, 42.43932544098019],
                [11.174559661855323, 42.49948950981189],
                [11.48636468315132, 42.542316684293304],
                [11.954861073590815, 42.60496680037157],
                [12.267707233856488, 42.64566963277932],
                [10.747405608925893, 42.43932544098019],
              ],
            ],
          ],
        },
        sensingTime: expectedSensingTimeFixture,
        meta: {
          acquisitionMode: AcquisitionMode.IW,
          polarization: Polarization.DV,
          //resolution: Resolution.HIGH, // TODO - resolution is missing in service
          orbitDirection: OrbitDirection.ASCENDING,
        },
      },
    ]);
  },
);
