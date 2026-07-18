import * as vscode from "vscode";
import { EventDispatcher } from "../dispatcher";

export function registerDocumentCloseListener(
    context: vscode.ExtensionContext,
    dispatcher: EventDispatcher
): void {

    const disposable = vscode.workspace.onDidCloseTextDocument((document) => {
        dispatcher.dispatch({
            type: "document.close",
            timestamp: Date.now(),
            file: document.uri.fsPath
        });
    });

    context.subscriptions.push(disposable);
}