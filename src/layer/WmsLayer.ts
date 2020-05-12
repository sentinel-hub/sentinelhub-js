import moment, { Moment } from 'moment';

import { BBox } from 'src/bbox';
import { GetMapParams, ApiType } from 'src/layer/const';
import { wmsGetMapUrl } from 'src/layer/wms';
import { AbstractLayer } from 'src/layer/AbstractLayer';
import { fetchGetCapabilitiesXml } from './utils';

interface ConstructorParameters {
  baseUrl?: string;
  layerId?: string;
  title?: string | null;
  description?: string | null;
  legendUrl?: string | null;
}

export class WmsLayer extends AbstractLayer {
  // The URL of the WMS service, for example: "https://services.sentinel-hub.com/ogc/wms/<instance-id>/"
  protected baseUrl: string;
  protected layerId: string;

  public constructor({
    baseUrl,
    layerId,
    title = null,
    description = null,
    legendUrl = null,
  }: ConstructorParameters) {
    super({ title, description, legendUrl });
    this.baseUrl = baseUrl;
    this.layerId = layerId;
  }

  public getMapUrl(params: GetMapParams, api: ApiType): string {
    if (api !== ApiType.WMS) {
      throw new Error('Only WMS is supported on this layer');
    }
    return wmsGetMapUrl(this.baseUrl, this.layerId, params);
  }

  public async findDatesUTC(
    bbox: BBox, // eslint-disable-line @typescript-eslint/no-unused-vars
    fromTime: Date,
    toTime: Date,
  ): Promise<Date[]> {
    // http://cite.opengeospatial.org/OGCTestData/wms/1.1.1/spec/wms1.1.1.html#dims
    const capabilities = await fetchGetCapabilitiesXml(this.baseUrl);
    const layer = capabilities.WMS_Capabilities.Capability[0].Layer[0].Layer.find(
      layerInfo => this.layerId === layerInfo.Name[0],
    );
    if (!layer) {
      throw new Error('Layer not found');
    }
    if (!layer.Dimension) {
      throw new Error('Layer does not supply time information (no Dimension field)');
    }
    const timeDimension = layer.Dimension.find(d => d['$'].name === 'time');
    if (!timeDimension) {
      throw new Error("Layer does not supply time information (no Dimension field with name === 'time')");
    }
    // http://cite.opengeospatial.org/OGCTestData/wms/1.1.1/spec/wms1.1.1.html#date_time
    if (timeDimension['$'].units !== 'ISO8601') {
      throw new Error('Layer time information is not in ISO8601 format, parsing not supported');
    }

    let allTimesMomentUTC = [];
    const times = timeDimension['_'].split(',');
    for (let i = 0; i < times.length; i++) {
      const timeParts = times[i].split('/');
      switch (timeParts.length) {
        case 1:
          allTimesMomentUTC.push(moment.utc(timeParts[0]));
          break;
        case 3:
          const [intervalFromTime, intervalToTime, intervalDuration] = timeParts;
          const intervalFromTimeMoment = moment.utc(intervalFromTime);
          const intervalToTimeMoment = moment.utc(intervalToTime);
          const intervalDurationMoment = moment.duration(intervalDuration);
          for (
            let t = intervalFromTimeMoment;
            t.isSameOrBefore(intervalToTimeMoment);
            t.add(intervalDurationMoment)
          ) {
            allTimesMomentUTC.push(t.clone());
          }
          break;
        default:
          throw new Error('Unable to parse time information');
      }
    }

    const found: Moment[] = allTimesMomentUTC.filter(t =>
      t.isBetween(moment.utc(fromTime), moment.utc(toTime), null, '[]'),
    );
    found.sort((a, b) => b.unix() - a.unix());
    return found.map(m => m.toDate());
  }

  public async updateLayerFromServiceIfNeeded(): Promise<void> {
    if (this.legendUrl) {
      return;
    }
    if (this.baseUrl === null || this.layerId === null) {
      throw new Error(
        "Additional data can't be fetched from service because baseUrl and layerId are not defined",
      );
    }
    const capabilities = await fetchGetCapabilitiesXml(this.baseUrl);
    const layer = capabilities.WMS_Capabilities.Capability[0].Layer[0].Layer.find(
      layer => this.layerId === layer.Name[0],
    );
    if (!layer) {
      throw new Error('Layer not found');
    }
    const legendUrl =
      layer.Style && layer.Style[0].LegendURL
        ? layer.Style[0].LegendURL[0].OnlineResource[0]['$']['xlink:href']
        : layer.Layer && layer.Layer[0].Style && layer.Layer[0].Style[0].LegendURL
        ? layer.Layer[0].Style[0].LegendURL[0].OnlineResource[0]['$']['xlink:href']
        : null;
    this.legendUrl = legendUrl;
  }
}
