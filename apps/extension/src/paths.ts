import * as path from "node:path";
import * as vscode from "vscode";

/**
 * Converts a file URI into a path safe to log, store, and eventually
 * transmit to the backend/public API.
 *
 * Workspace-relative when the file is inside an open workspace folder.
 * Falls back to a basename-only tag when it isn't — vscode.workspace
 * .asRelativePath() silently returns the absolute path in that case,
 * which is exactly the leak this function exists to prevent, so we
 * check membership explicitly before calling it.
 *
 * This runs at the point of capture (inside each listener), not at the
 * dispatcher or backend — once a raw absolute path leaves this function,
 * it's already been dispatched, logged, and possibly cached locally.
 */
export function toTrackedPath(uri: vscode.Uri): string {

    const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);

    if (!workspaceFolder) {
        return `external:${path.basename(uri.fsPath)}`;
    }

    return vscode.workspace
        .asRelativePath(uri, false)
        .replace(/\\/g, "/"); // normalize separators so Windows/macOS/Linux emit identical shapes
}