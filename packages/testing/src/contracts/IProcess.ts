export interface IProcess {
    start(): Promise<void>;
    stop(): Promise<void>;
    
    isRunning(): boolean;
}
