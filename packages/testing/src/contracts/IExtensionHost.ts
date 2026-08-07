export interface IExtensionHost {
    start(): Promise<void>;
    stop(): Promise<void>;

    isRunning(): boolean;

    stdout(): string;
    stderr(): string;
}