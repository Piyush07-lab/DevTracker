export interface Session {
    startTime: number;
    lastActivity: number;
    files: Set<string>;
}