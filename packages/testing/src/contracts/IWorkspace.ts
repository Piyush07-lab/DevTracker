export interface IWorkspace {
    create(): Promise<void>;
    dispose(): Promise<void>;

    createDirectory(relativePath: string): Promise<void>;

    createFile(
        relativePath: string,
        contents?: string
    ): Promise<void>;

    root(): string;
}