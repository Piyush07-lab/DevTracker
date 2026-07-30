import * as vscode from "vscode";
import { EventDispatcher } from "../dispatcher";
import { getProjectName, toTrackedPath } from "../paths";
import type { DevTrackerEvent } from "../dispatcher";

/**
 * `file` is workspace-relative (e.g. "src/index.ts"), or
 * "external:<basename>" for files outside any open workspace folder.
 * NEVER populate this with an absolute filesystem path — see DC-3.
 */

export function registerDocumentCloseListener(
    context: vscode.ExtensionContext,
    dispatcher: EventDispatcher
): void {

    const disposable = vscode.workspace.onDidCloseTextDocument((document) => {

        const project = getProjectName(document.uri);

        const event: DevTrackerEvent = {
            type: "document.close",
            timestamp: Date.now(),
            file: toTrackedPath(document.uri),
            ...(project !== undefined ? { project } : {}),
        };

        dispatcher.dispatch(event);
    });

    context.subscriptions.push(disposable);
}