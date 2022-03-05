import { OgcServiceTypes } from '../const';
import { createGetCapabilitiesXmlUrl } from '../utils';

const cases = [
  {
    input: 'https://some-place/sub/wmts?api_key=notAKey',
    ogcServiceType: OgcServiceTypes.WMTS,
    expected:
      'https://some-place/sub/wmts?service=wmts&request=GetCapabilities&format=text%2Fxml&api_key=notAKey',
  },
  {
    input: 'https://some-place/sub/wmts',
    ogcServiceType: OgcServiceTypes.WMTS,
    expected: 'https://some-place/sub/wmts?service=wmts&request=GetCapabilities&format=text%2Fxml',
  },
  {
    input: 'https://some-place/sub/someKey',
    ogcServiceType: OgcServiceTypes.WMS,
    expected: 'https://some-place/sub/someKey?service=wms&request=GetCapabilities&format=text%2Fxml',
  },
];

describe("'add' utility", () => {
  test.each(cases)('build getCapabilities url', ({ input, ogcServiceType, expected }) => {
    const url = createGetCapabilitiesXmlUrl(input, ogcServiceType);
    expect(url).toStrictEqual(expected);
  });
});
