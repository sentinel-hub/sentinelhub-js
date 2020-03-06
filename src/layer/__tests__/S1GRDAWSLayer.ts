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
  // run these tests in UTC timezone. Jest global setup should take care of that, but we
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
    const layer = new S1GRDAWSEULayer(
      'INSTANCE_ID',
      'LAYER_ID',
      null,
      null,
      null,
      null,
      null,
      AcquisitionMode.IW,
      Polarization.DV,
      Resolution.HIGH,
    );

    // mock a single-tile response:
    axios.post.mockReset();
    axios.post.mockImplementation(() =>
      Promise.resolve({
        data: {
          tiles: [
            {
              type: 'S1',
              id: 1293846,
              originalId: 'S1A_EW_GRDM_1SDH_20200202T180532_20200202T180632_031077_03921C_E6C8',
              dataUri:
                's3://sentinel-s1-l1c/GRD/2020/2/2/EW/DH/S1A_EW_GRDM_1SDH_20200202T180532_20200202T180632_031077_03921C_E6C8',
              dataGeometry: {
                type: 'MultiPolygon',
                crs: {
                  type: 'name',
                  properties: {
                    name: 'urn:ogc:def:crs:EPSG::4326',
                  },
                },
                coordinates: [
                  [
                    [
                      [-28.958387727765576, 77.22089053106154],
                      [-28.454271377131395, 77.28385150034897],
                      [-27.718918346651687, 77.37243188785827],
                      [-26.974008583323926, 77.45890918854761],
                      [-26.217031402559755, 77.54352656462356],
                      [-25.447186512415197, 77.62630504330521],
                      [-24.667542862300945, 77.7068623880844],
                      [-28.958387727765576, 77.22089053106154],
                    ],
                  ],
                ],
              },
              sensingTime: sensingTimeFixture,
              rasterWidth: 10459,
              rasterHeight: 9992,
              polarization: 'DV',
              resolution: 'HIGH',
              orbitDirection: 'ASCENDING',
              acquisitionMode: 'IW',
              timeliness: 'NRT3h',
              additionalData: {},
              missionDatatakeId: 234012,
              sliceNumber: 5,
            },
          ],
          hasMore: hasMoreFixture,
          maxOrderKey: '2020-02-02T08:17:57Z;1295159',
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
          crs: {
            type: 'name',
            properties: {
              name: 'urn:ogc:def:crs:EPSG::4326',
            },
          },
          coordinates: [
            [
              [
                [-28.958387727765576, 77.22089053106154],
                [-28.454271377131395, 77.28385150034897],
                [-27.718918346651687, 77.37243188785827],
                [-26.974008583323926, 77.45890918854761],
                [-26.217031402559755, 77.54352656462356],
                [-25.447186512415197, 77.62630504330521],
                [-24.667542862300945, 77.7068623880844],
                [-28.958387727765576, 77.22089053106154],
              ],
            ],
          ],
        },
        sensingTime: expectedSensingTimeFixture,
        meta: {
          acquisitionMode: AcquisitionMode.IW,
          polarization: Polarization.DV,
          resolution: Resolution.HIGH,
          orbitDirection: OrbitDirection.ASCENDING,
        },
      },
    ]);
  },
);
