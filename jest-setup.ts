declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveQueryParams(expectedParamsKeys: Array<string>): R;
      toHaveQueryParamsValues(expectedParams: Record<string, string>): R;
      toHaveOrigin(expectedOrigin: string): R;
    }
  }
}

expect.extend({
  toHaveQueryParams(received, expectedParamsKeys) {
    const { params } = parseUrl(received);
    for (let k of expectedParamsKeys) {
      if (params[k] === undefined) {
        return {
          message: () => `URL query parameter [${k}] should exist, but it doesn't`,
          pass: false,
        };
      }
    }
    return {
      message: () =>
        `URL [${received}] should not include all of the parameters ${JSON.stringify(expectedParamsKeys)}, but it does`,
      pass: true,
    };
  },

  toHaveQueryParamsValues(received, expectedParams) {
    const { params } = parseUrl(received);
    for (let k in expectedParams) {
      if (String(params[k]) !== String(expectedParams[k])) {
        return {
          message: () => `URL query parameter [${k}] should have value [${expectedParams[k]}], instead it has value [${params[k]}]`,
          pass: false,
        };
      }
    }
    return {
      message: () =>
        `URL [${received}] should not include all of the values [${JSON.stringify(expectedParams)}], but it does`,
      pass: true,
    };
  },

  toHaveOrigin(received, expectedOrigin) {
    const { origin } = parseUrl(received);
    if (origin !== expectedOrigin) {
      return {
        message: () => `URL hostname should have value [${expectedOrigin}], instead it has value [${origin}]`,
        pass: false,
      };
    }
    return {
      message: () => `URL hostname should not have value [${expectedOrigin}], but it does`, // if .not is used
      pass: true,
    };
  },
});

/* ************************ */

function parseUrl(urlWithQueryParams: string) {
  const url = new URL(urlWithQueryParams);
  let params: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    params[key] = value;
  });
  const baseUrl = `${url.origin}${url.pathname}`;
  return {
    origin: url.origin,
    baseUrl: baseUrl,
    params: params,
  };
}

export default undefined;