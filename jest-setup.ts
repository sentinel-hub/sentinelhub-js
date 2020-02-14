
expect.extend({
  toIncludeQueryParam(received, requestedParams) {
    try {
      assertUrlIncludesParams(received, requestedParams);
      return {
        message: () =>
          `URL [${received}] should not include all of the values [${String(requestedParams)}], but it does`, // this is printed out if we use .not
        pass: true,
      };
    } catch (errMsg) {
      return {
        message: () => errMsg,
        pass: false,
      };
    }
  },
});

declare namespace jest {
  interface Matchers<R> {
    toIncludeQueryParam(requestedParams: Record<string, string>): R;
  }
}

/* ************************ */

function breakUrl(urlWithQueryParams: string) {
  const url = new URL(urlWithQueryParams);
  let params: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    params[key] = value;
  });
  const baseUrl = `${url.origin}${url.pathname}`;
  return {
    baseUrl: baseUrl,
    params: params,
  };
}

function assertUrlIncludesParams(url: string, requestedParams: Record<string, string>): void {
  const { baseUrl, params } = breakUrl(url);

  for (let k in requestedParams) {
    if (String(params[k]) !== String(requestedParams[k])) {
      throw `URL query parameter [${k}] should have value [${requestedParams[k]}], instead it has value [${
        params[k]
      }]`;
    }
  }
}
