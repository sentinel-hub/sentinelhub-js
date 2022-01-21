import { WmtsLayer, BBox, MimeTypes, ApiType, CRS_EPSG4326, S2L1CLayer } from '../dist/sentinelHub.esm';

const notExactTileBbox = new BBox(
  CRS_EPSG4326,
  9.546533077955246,
  -2.7491153895984772,
  9.940667599439623,
  -2.3553726144954044,
);

const rectangularBbox = new BBox(
  CRS_EPSG4326,
  21.649502366781235,
  -33.649031907049206,
  21.735161393880848,
  -33.5284837550155,
);

const instanceId = process.env.INSTANCE_ID;
const s2LayerId = process.env.S2L1C_LAYER_ID;

export default {
  title: 'WMTS',
};

export const getMapBbox = () => {
  const img = document.createElement('img');
  img.width = '512';
  img.height = '512';

  const s2Img = document.createElement('img');
  s2Img.width = '512';
  s2Img.height = '512';

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>GetMap with bbox(WMTS)</h2>';
  wrapperEl.insertAdjacentElement('beforeend', img);
  wrapperEl.insertAdjacentElement('beforeend', s2Img);
  const perform = async () => {
    const layer = new WmtsLayer({
      baseUrl: `https://services.sentinel-hub.com/ogc/wmts/${instanceId}`,
      layerId: s2LayerId,
      resourceUrl: `https://services.sentinel-hub.com/ogc/wmts/${instanceId}?REQUEST=GetTile&&showlogo=false&TILEMATRIXSET=PopularWebMercator256&LAYER=${s2LayerId}&TILEMATRIX={TileMatrix}&TILEROW={TileRow}&TILECOL={TileCol}&TIME=2019-04-17/2019-04-17&&format=image%2Fpng`,
    });
    const layerS2L1C = new S2L1CLayer({ instanceId, layerId: s2LayerId });

    const getMapParams = {
      bbox: notExactTileBbox,
      fromTime: new Date(Date.UTC(2018, 11 - 1, 22, 0, 0, 0)),
      toTime: new Date(Date.UTC(2018, 12 - 1, 22, 23, 59, 59)),
      width: 512,
      height: 512,
      format: MimeTypes.PNG,
    };
    const imageBlob = await layer.getMap(getMapParams, ApiType.WMTS);
    img.src = URL.createObjectURL(imageBlob);

    const getMapParamsS2 = {
      bbox: notExactTileBbox,
      fromTime: new Date(Date.UTC(2019, 4 - 1, 17, 0, 0, 0)),
      toTime: new Date(Date.UTC(2019, 4 - 1, 17, 23, 59, 59)),
      width: 512,
      height: 512,
      format: MimeTypes.PNG,
      showlogo: false,
      preview: 2,
    };
    const s2ImageBlob = await layerS2L1C.getMap(getMapParamsS2, ApiType.WMS);
    s2Img.src = URL.createObjectURL(s2ImageBlob);
  };
  perform().then(() => {});
  return wrapperEl;
};

export const getMapBboxRectangular = () => {
  const width = 474;
  const height = 802;
  const img = document.createElement('img');
  img.width = width;
  img.height = height;

  const s2Img = document.createElement('img');
  s2Img.width = width;
  s2Img.height = height;

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>GetMap bbox(WMTS) with different width and height</h2>';
  wrapperEl.insertAdjacentElement('beforeend', img);
  wrapperEl.insertAdjacentElement('beforeend', s2Img);
  const perform = async () => {
    const layer = new WmtsLayer({
      baseUrl: `https://services.sentinel-hub.com/ogc/wmts/${instanceId}`,
      layerId: s2LayerId,
      resourceUrl: `https://services.sentinel-hub.com/ogc/wmts/${instanceId}?REQUEST=GetTile&&showlogo=false&TILEMATRIXSET=PopularWebMercator256&LAYER=${s2LayerId}&TILEMATRIX={TileMatrix}&TILEROW={TileRow}&TILECOL={TileCol}&TIME=2019-04-18/2019-04-18&&format=image%2Fpng`,
    });
    const layerS2L1C = new S2L1CLayer({ instanceId, layerId: s2LayerId });

    const getMapParams = {
      bbox: rectangularBbox,
      fromTime: new Date(Date.UTC(2018, 11 - 1, 22, 0, 0, 0)),
      toTime: new Date(Date.UTC(2018, 12 - 1, 22, 23, 59, 59)),
      width: width,
      height: height,
      format: MimeTypes.PNG,
    };
    const imageBlob = await layer.getMap(getMapParams, ApiType.WMTS);
    img.src = URL.createObjectURL(imageBlob);

    const getMapParamsS2 = {
      bbox: rectangularBbox,
      fromTime: new Date(Date.UTC(2019, 4 - 1, 18, 0, 0, 0)),
      toTime: new Date(Date.UTC(2019, 4 - 1, 18, 23, 59, 59)),
      width: width,
      height: height,
      format: MimeTypes.PNG,
      showlogo: false,
    };
    const s2ImageBlob = await layerS2L1C.getMap(getMapParamsS2, ApiType.WMS);

    s2Img.src = URL.createObjectURL(s2ImageBlob);
  };
  perform().then(() => {});
  return wrapperEl;
};
