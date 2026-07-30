import * as path from "node:path";
import * as vscode from "vscode";

/**
 * Converts a file URI into a path safe to log, store, and eventually
 * transmit to the backend/public API.
 *
 * Workspace-relative when the file is inside an open workspace folder.
 * Falls back to a basename-only tag when it isn't.
 */
export function toTrackedPath(uri: vscode.Uri): string {
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);

    if (!workspaceFolder) {
        return `external:${path.basename(uri.fsPath)}`;
    }

    return vscode.workspace
        .asRelativePath(uri, false)
        .replace(/\\/g, "/");
}

/**
 * Returns the workspace/project name for the given file.
 * This is used to populate SessionPayload.project.
 *
 * Returns undefined for files that are not part of a workspace.
 */
export function getProjectName(uri: vscode.Uri): string | undefined {
    return vscode.workspace.getWorkspaceFolder(uri)?.name;
}

/**
 * Returns the workspace folder itself when additional metadata
 * (URI, path, index, etc.) is needed by callers.
 */
export function getWorkspaceFolder(
    uri: vscode.Uri,
): vscode.WorkspaceFolder | undefined {
    return vscode.workspace.getWorkspaceFolder(uri);
}