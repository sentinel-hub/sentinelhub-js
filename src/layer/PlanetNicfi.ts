import { RequestConfiguration } from '../utils/cancelRequests';
import { ensureTimeout } from '../utils/ensureTimeout';

import { WmtsLayer } from './WmtsLayer';
import { BBox } from '../bbox';
import moment from 'moment';
import { fetchLayersFromWmtsGetCapabilitiesXml } from './wmts.utils';

const YYYY_MM_REGEX = /\d{4}-\d{2}/g;

enum NICFI_LAYER_TYPES {
  ANALYTIC = 'analytic',
  VISUAL = 'visual',
}

interface ConstructorParameters {
  baseUrl?: string;
  layerId?: string;
  title?: string | null;
  description?: string | null;
  legendUrl?: string | null;
  resourceUrl?: string | null;
}

export class PlanetNicfiLayer extends WmtsLayer {
  protected baseUrl: string;
  protected layerId: string;
  protected resourceUrl: string;
  protected matrixSet: string;

  public constructor({
    baseUrl,
    layerId,
    title = null,
    description = null,
    legendUrl = null,
    resourceUrl = null,
  }: ConstructorParameters) {
    super({ title, description, legendUrl });
    this.baseUrl = baseUrl;
    this.layerId = layerId;
    this.resourceUrl = resourceUrl;
    this.matrixSet = 'GoogleMapsCompatible15'; //only matrixSet available for PlanetNicfi
  }

  public async findDatesUTC(
    bbox: BBox,
    fromTime: Date,
    toTime: Date,
    reqConfig?: RequestConfiguration, // eslint-disable-line @typescript-eslint/no-unused-vars
  ): Promise<Date[]> {
    return await ensureTimeout(async innerReqConfig => {
      const parsedLayers = await fetchLayersFromWmtsGetCapabilitiesXml(this.baseUrl, innerReqConfig);
      const applicableLayers = parsedLayers.filter(l => {
        return this.getLayerType(this.layerId) === this.getLayerType(l.Name[0]);
      });
      const datesFromApplicableLayers = applicableLayers.map(l => {
        const dateArray = l.Name[0].match(YYYY_MM_REGEX);
        return moment.utc(dateArray[dateArray.length - 1]).endOf('month');
      });
      const availableDates = datesFromApplicableLayers.filter(d =>
        d.isBetween(moment.utc(fromTime), moment.utc(toTime), null, '[]'),
      );
      return availableDates.map(d => d.toDate());
    }, reqConfig);
  }

  private getLayerType(layerId: string): NICFI_LAYER_TYPES {
    return layerId.includes(NICFI_LAYER_TYPES.ANALYTIC)
      ? NICFI_LAYER_TYPES.ANALYTIC
      : NICFI_LAYER_TYPES.VISUAL;
  }
}
