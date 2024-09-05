import axios, { Axios, AxiosError, HttpStatusCode } from "axios";
import { injectable } from "inversify";

const isClient = typeof window != "undefined";

export interface IAxiosInstance {
  instance: Axios;
}

@injectable()
export class AxiosInstance implements IAxiosInstance {
  constructor() {
    this.setupInterceptors();
  }

  instance = axios.create({
    baseURL: "http://localhost:3000/api",
    timeout: 10000,
    headers: {
      "Content-Type": "application/json",
    },
  });

  setupInterceptors() {
    // リクエストインターセプターを設定します。
    this.instance.interceptors.request.use(
      async (config) => {
        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );

    // レスポンスインターセプターを設定します。
    this.instance.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        this.handleError(error);
      },
    );
  }

  private handleError(error: AxiosError) {
    const status = error.response?.status;

    switch (status) {
      case HttpStatusCode.Unauthorized: // 401
        // 認証エラーを適切に処理する（例：ログインページにリダイレクト）
        break;
      case HttpStatusCode.Forbidden: // 403
        // アクセス拒否エラーを適切に処理する（例：エラーページにリダイレクト）
        break;
      case HttpStatusCode.NotFound: // 404
        // リソースが見つからないエラーを適切に処理する（例：エラーページにリダイレクト）
        break;
      case HttpStatusCode.InternalServerError: // 500
      default:
        // その他のエラーを適切に処理する（例：エラーページにリダイレクト）
        throw error;
    }
  }
}
