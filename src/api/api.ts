import axios from "axios";

import { API_BASE_URL } from "../common/constants";
import { getExtensionVersion } from "../common/utils";

const extensionVersion = getExtensionVersion();

const Api = axios.create({ baseURL: API_BASE_URL, headers: { "X-Extension-Version": extensionVersion } });
const PublicApi = axios.create({ baseURL: API_BASE_URL, headers: { "X-Extension-Version": extensionVersion } });

class ApiProviderClass {
  responseInterceptor: any = null;

  addResponseInterceptor(interceptor: any, errorHandler: (err: any) => Promise<void>): void {
    if (this.responseInterceptor !== null) {
      this.removeResponseInterceptor();
    }

    this.responseInterceptor = Api.interceptors.response.use(interceptor, errorHandler);
  }

  removeResponseInterceptor(): void {
    Api.interceptors.response.eject(this.responseInterceptor);
    this.responseInterceptor = null;
  }

  setHeader(key: string, value?: string | null): void {
    Api.defaults.headers.common[key] = value;
  }

  addHeaderTokenInterceptor(errorHandler: (err: any) => Promise<void>): void {
    this.addResponseInterceptor((response: any) => {
      const newAuthHeader = response.headers["x-new-token"];
      if (newAuthHeader) {
        this.setHeader("Authorization", `Bearer ${newAuthHeader}`);
      }

      return response;
    }, errorHandler);
  }
}

const ApiProvider = new ApiProviderClass();

export { Api, PublicApi, ApiProvider };
