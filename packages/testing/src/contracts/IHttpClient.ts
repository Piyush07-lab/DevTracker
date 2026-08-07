export interface IHttpClient {
    get(path: string): Promise<Response>;
    post(path: string, body: unknown): Promise<Response>;
}
