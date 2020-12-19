import axios from 'axios';

const replaceHostnames: Record<string, string> = {};

export function registerHostnameReplacing(fromHostname: string, toHostname: string): void {
  if (Object.keys(replaceHostnames).length === 0) {
    // the first time we are called we must also register an axios interceptor:
    axios.interceptors.request.use(replaceHostnamesInterceptor, error => Promise.reject(error));
  }

  replaceHostnames[fromHostname] = toHostname;
}

const replaceHostnamesInterceptor = async (config: any): Promise<any> => {
  const originalUrl = new URL(config.url);
  if (replaceHostnames[originalUrl.hostname] === undefined) {
    return config;
  }

  originalUrl.hostname = replaceHostnames[originalUrl.hostname];
  config.url = originalUrl.toString();
  return config;
};
