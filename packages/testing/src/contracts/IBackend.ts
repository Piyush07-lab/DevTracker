export interface IBackend {
    start(): Promise<void>;
    stop(): Promise<void>;
    waitUntilReady(): Promise<void>;

    getUrl(): URL;

    isRunning(): boolean;
}
