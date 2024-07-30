import { BBox, CRS_EPSG3857, CRS_EPSG4326 } from '../..';
import { bboxToXyzGrid } from '../wmts.utils';

const tileMatrices256 = [...Array(20).keys()].map((zoom) => ({
  zoom: zoom,
  tileWidth: 256,
  tileHeight: 256,
  matrixWidth: Math.pow(2, zoom),
  matrixHeight: Math.pow(2, zoom),
}));

const tileMatrices512 = [...Array(19).keys()].map((zoom) => ({
  zoom: zoom + 1,
  tileWidth: 512,
  tileHeight: 512,
  matrixWidth: Math.pow(2, zoom),
  matrixHeight: Math.pow(2, zoom),
}));

const singleTile512Bbox = new BBox(
  CRS_EPSG3857,
  1487158.8223163893,
  5009377.085697314,
  1565430.3392804097,
  5087648.602661333,
);

const rectangularBbox = new BBox(
  CRS_EPSG4326,
  11.7938232421875,
  41.21998578493921,
  13.150634765625002,
  42.431565872579185,
);

const singleTile512Fixture = {
  description: 'Test extact 512 tile bbox, should return single xyz tile',
  bbox: singleTile512Bbox,
  tileMatrices: tileMatrices512,
  imageWidth: 512,
  imageHeight: 512,
  expectedResult: {
    nativeHeight: 512,
    nativeWidth: 512,
    tiles: [
      {
        imageOffsetX: 0,
        imageOffsetY: 0,
        x: 275,
        y: 191,
        z: 10,
      },
    ],
  },
};

const singleTile512Fixture256Tiles = {
  description: 'Test extact 512 tile bbox, stitched with multpile 256 tiles',
  bbox: singleTile512Bbox,
  tileMatrices: tileMatrices256,
  imageWidth: 512,
  imageHeight: 512,
  expectedResult: {
    nativeHeight: 512,
    nativeWidth: 512,
    tiles: [
      {
        imageOffsetX: 0,
        imageOffsetY: 0,
        x: 550,
        y: 382,
        z: 10,
      },
      {
        imageOffsetX: 0,
        imageOffsetY: 256,
        x: 550,
        y: 383,
        z: 10,
      },
      {
        imageOffsetX: 256,
        imageOffsetY: 0,
        x: 551,
        y: 382,
        z: 10,
      },
      {
        imageOffsetX: 256,
        imageOffsetY: 256,
        x: 551,
        y: 383,
        z: 10,
      },
    ],
  },
};

const rectangularBboxFixture = {
  description: 'Test rectangular bbox, should return multiple xyz tiles',
  bbox: rectangularBbox,
  tileMatrices: tileMatrices256,
  imageWidth: 244,
  imageHeight: 293,
  expectedResult: {
    nativeWidth: 247,
    nativeHeight: 296.6024590163934,
    tiles: [
      { x: 136, y: 94, z: 8, imageOffsetX: -99, imageOffsetY: -158 },
      { x: 136, y: 95, z: 8, imageOffsetX: -99, imageOffsetY: 98 },
      { x: 137, y: 94, z: 8, imageOffsetX: 157, imageOffsetY: -158 },
      { x: 137, y: 95, z: 8, imageOffsetX: 157, imageOffsetY: 98 },
    ],
  },
};

const cases = [
  [singleTile512Fixture.description, singleTile512Fixture],
  [singleTile512Fixture256Tiles.description, singleTile512Fixture256Tiles],
  [rectangularBboxFixture.description, rectangularBboxFixture],
];

describe('test bboxToXyzGrid', () => {
  test.each(cases)(
    '%s',
    (testDescription: string, { bbox, tileMatrices, imageWidth, imageHeight, expectedResult }: any) => {
      const result = bboxToXyzGrid(bbox, imageWidth, imageHeight, tileMatrices);
      expect(result).toEqual(expectedResult);
    },
  );
});
