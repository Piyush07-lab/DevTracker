import * as vscode from "vscode";
import { EventDispatcher } from "../dispatcher";
import { toTrackedPath } from "../paths";

/**
 * `file` is workspace-relative (e.g. "src/index.ts"), or
 * "external:<basename>" for files outside any open workspace folder.
 * NEVER populate this with an absolute filesystem path — see DC-3.
 */

export function registerDocumentOpenListener(
    context: vscode.ExtensionContext,
    dispatcher: EventDispatcher
): void {

    const disposable = vscode.workspace.onDidOpenTextDocument((document) => {
        dispatcher.dispatch({
            type: "document.open",
            timestamp: Date.now(),
            file: toTrackedPath(document.uri)
        });
    });

    context.subscriptions.push(disposable);
}