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

export function assertUrlIncludesParams(url: string, requestedParams: Record<string, string>): void {
  const { baseUrl, params } = breakUrl(url);

  for (let k in requestedParams) {
    if (String(params[k]) !== String(requestedParams[k])) {
      throw `URL query parameter [${k}] should have value [${requestedParams[k]}], instead it has value [${
        params[k]
      }]`;
    }
  }
}
