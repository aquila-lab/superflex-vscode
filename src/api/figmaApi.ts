import axios from 'axios'

const FigmaApi = axios.create({
  baseURL: 'https://api.figma.com/v1',
  headers: {
    'Content-Type': 'application/json'
  }
})

class FigmaApiProviderClass {
  responseInterceptor: any = null

  addResponseInterceptor(
    interceptor: any,

    errorHandler: (err: any) => Promise<any>
  ): void {
    if (this.responseInterceptor !== null) {
      this.removeResponseInterceptor()
    }

    this.responseInterceptor = FigmaApi.interceptors.response.use(
      interceptor,
      errorHandler
    )
  }

  removeResponseInterceptor(): void {
    FigmaApi.interceptors.response.eject(this.responseInterceptor)
    this.responseInterceptor = null
  }

  setHeader(key: string, value?: string | null): void {
    FigmaApi.defaults.headers.common[key] = value
  }

  addRefreshTokenInterceptor(errorHandler: (err: any) => Promise<any>): void {
    this.addResponseInterceptor((response: any) => {
      return response
    }, errorHandler)
  }
}

const FigmaApiProvider = new FigmaApiProviderClass()

export { FigmaApi, FigmaApiProvider }
