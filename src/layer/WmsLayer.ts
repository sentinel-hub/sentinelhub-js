import moment from 'moment';

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
}

export class WmsLayer extends AbstractLayer {
  // The URL of the WMS service, for example: "https://services.sentinel-hub.com/ogc/wms/<instance-id>/"
  protected baseUrl: string;
  protected layerId: string;

  public constructor({ baseUrl, layerId, title = null, description = null }: ConstructorParameters) {
    super({ title, description });
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

    let allTimesUTC = [];
    const times = timeDimension['_'].split(',');
    for (let i = 0; i < times.length; i++) {
      const timeParts = times[i].split('/');
      switch (timeParts.length) {
        case 1:
          allTimesUTC.push(moment.utc(timeParts[0]));
          break;
        case 3:
          const [timePartFromTime, timePartToTime, timePartInterval] = timeParts;
          const fromTimeMoment = moment.utc(timePartFromTime);
          const toTimeMoment = moment.utc(timePartToTime);
          const intervalDuration = moment.duration(timePartInterval);
          for (let t = fromTimeMoment; t.isSameOrBefore(toTimeMoment); t.add(intervalDuration)) {
            allTimesUTC.push(t.clone());
          }
          break;
        default:
          throw new Error('Unable to parse time information');
      }
    }

    return allTimesUTC
      .filter(t => t.isBetween(moment.utc(fromTime), moment.utc(toTime), null, '[]'))
      .map(t => t.toDate());
  }
}
