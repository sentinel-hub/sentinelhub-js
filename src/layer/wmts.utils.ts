import { RequestConfiguration } from '..';
import { BBox } from '../bbox';
import { CRS_EPSG3857, CRS_EPSG4326 } from '../crs';
import { OgcServiceTypes } from './const';
import { fetchGetCapabilitiesXml, GetCapabilitiesXmlLayer } from './utils';

const DEGREE_TO_RADIAN = Math.PI / 180;
const RADIAN_TO_DEGREE = 180 / Math.PI;
const EQUATOR_RADIUS = 6378137.0;

export type GetCapabilitiesWmtsXml = {
  Capabilities: {
    'ows:ServiceIdentification': any[][];
    'ows:ServiceProvider': any[][];
    'ows:OperationsMetadata': any[][];
    Contents: [{ Layer: GetCapabilitiesXmlWmtsLayer[] }];
    ServiceMetadataURL: any[][];
  };
};

export type GetCapabilitiesXmlWmtsLayer = {
  'ows:Title': string[];
  'ows:Abstract': string[];
  'ows:WGS84BoundingBox': {}[][];
  'ows:Identifier': string[];
  Style: any[];
  Format: string[];
  TileMatrixSetLink: any[];
  ResourceURL: any[];
};

type BBOX_TO_XYZ_IMAGE_GRID = {
  nativeWidth: number;
  nativeHeight: number;
  tiles: { x: number; y: number; z: number; imageOffsetX: number; imageOffsetY: number }[];
};

function toWgs84(xy: number[]): number[] {
  return [
    (xy[0] * RADIAN_TO_DEGREE) / EQUATOR_RADIUS,
    (Math.PI * 0.5 - 2.0 * Math.atan(Math.exp(-xy[1] / EQUATOR_RADIUS))) * RADIAN_TO_DEGREE,
  ];
}

// Find the first zoom level where the requested imageWidth is lower than the pixel width of the bbox
function bboxToWidthAndZoom(
  bbox: BBox,
  requestedImageWidth: number,
  tileSize: number,
): { zoom: number; mapWidth: number; bboxPixelWidth: number } {
  if (bbox.crs === CRS_EPSG3857) {
    const topLeft = toWgs84([bbox.minX, bbox.minY]);
    const bottomRight = toWgs84([bbox.maxX, bbox.maxY]);
    bbox = new BBox(CRS_EPSG4326, topLeft[0], topLeft[1], bottomRight[0], bottomRight[1]);
  }
  const degreeDiff = Math.abs(bbox.maxX - bbox.minX);
  const pixelsPerDegree = tileSize / 360;

  // Pixel width for the bbox at each zoom level between 0 and 19
  let imageDimensionsAtZoom = [];
  for (let z = 0; z < 20; z++) {
    const mapWidth = tileSize * Math.pow(2, z);
    imageDimensionsAtZoom.push({
      zoom: z,
      mapWidth,
      bboxPixelWidth: Math.floor(((pixelsPerDegree * mapWidth) / tileSize) * degreeDiff),
    });
  }
  return imageDimensionsAtZoom.find(dim => requestedImageWidth <= dim.bboxPixelWidth);
}

export function bboxToXyzGrid(
  bbox: BBox,
  imageWidth: number,
  imageHeight: number,
  tileSize: number,
): BBOX_TO_XYZ_IMAGE_GRID {
  if (bbox.crs === CRS_EPSG3857) {
    const topLeft = toWgs84([bbox.minX, bbox.minY]);
    const bottomRight = toWgs84([bbox.maxX, bbox.maxY]);
    bbox = new BBox(CRS_EPSG4326, topLeft[0], topLeft[1], bottomRight[0], bottomRight[1]);
  }
  const { zoom, bboxPixelWidth } = bboxToWidthAndZoom(bbox, imageWidth, tileSize);

  const topLeft = [bbox.minX, bbox.maxY];
  const bottomRight = [bbox.maxX, bbox.minY];
  const { pixelX: topLeftPixelX, pixelY: topLeftpixelY } = toPixel(topLeft, tileSize, zoom);
  const { pixelX: bottomRightPixelX, pixelY: bottomRightPixelY } = toPixel(bottomRight, tileSize, zoom);

  const xTiles = [Math.floor(topLeftPixelX / tileSize), Math.floor((bottomRightPixelX - 1) / tileSize)].sort(
    (a, b) => a - b,
  );
  const yTiles = [Math.floor(topLeftpixelY / tileSize), Math.floor((bottomRightPixelY - 1) / tileSize)].sort(
    (a, b) => a - b,
  );
  const tileTopLeftX = xTiles[0] * tileSize;
  const tileTopLeftY = yTiles[0] * tileSize;
  const tiles = [];
  let xIndex = 0;
  let yIndex = 0;
  for (let x = xTiles[0]; x <= xTiles[xTiles.length - 1]; x++) {
    for (let y = yTiles[0]; y <= yTiles[yTiles.length - 1]; y++) {
      const tile = {
        x: x,
        y: y,
        z: zoom,
        imageOffsetX: xIndex * tileSize - (topLeftPixelX - tileTopLeftX),
        imageOffsetY: yIndex * tileSize - (topLeftpixelY - tileTopLeftY),
      };
      tiles.push(tile);
      yIndex++;
    }
    xIndex++;
    yIndex = 0;
  }

  return {
    nativeWidth: bboxPixelWidth,
    nativeHeight: bboxPixelWidth * (imageHeight / imageWidth),
    tiles: tiles,
  };
}

export function toPixel(coord: number[], tileSize: number, zoom: number): { pixelX: number; pixelY: number } {
  const [longitude, latitude] = coord;
  const mapWidth = tileSize * Math.pow(2, zoom);
  const sinLatitude = Math.min(Math.max(Math.sin(DEGREE_TO_RADIAN * latitude), -0.9999), 0.9999);
  const pixelX = Math.round(((longitude + 180) / 360) * mapWidth);
  const pixelY = Math.round(
    (0.5 - Math.log((1 + sinLatitude) / (1 - sinLatitude)) / (4 * Math.PI)) * mapWidth,
  );
  return { pixelX, pixelY };
}

function parseXmlWmtsLayers(parsedXml: GetCapabilitiesWmtsXml): GetCapabilitiesXmlLayer[] {
  return parsedXml.Capabilities.Contents[0].Layer.map(l => {
    return {
      Name: l['ows:Identifier'],
      Title: l['ows:Title'],
      Abstract: l['ows:Abstract'],
      Style: l.Style,
      ResourceUrl: getResourceUrl(l),
    };
  });
}
export async function fetchLayersFromWmtsGetCapabilitiesXml(
  baseUrl: string,
  reqConfig: RequestConfiguration,
): Promise<GetCapabilitiesXmlLayer[]> {
  const parsedXml = ((await fetchGetCapabilitiesXml(
    baseUrl,
    OgcServiceTypes.WMTS,
    reqConfig,
  )) as unknown) as GetCapabilitiesWmtsXml;
  const layers = parseXmlWmtsLayers(parsedXml);
  return layers;
}

export function getResourceUrl(xmlLayer: GetCapabilitiesXmlWmtsLayer): string | null {
  if (xmlLayer.ResourceURL[0] && xmlLayer.ResourceURL[0].$) {
    const resource = xmlLayer.ResourceURL[0].$;
    if (resource.resourceType === 'tile') {
      return resource.template;
    }
  }
  return null;
}
