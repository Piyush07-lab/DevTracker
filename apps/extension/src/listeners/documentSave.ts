import * as vscode from "vscode";
import { EventDispatcher } from "../dispatcher";

export function registerDocumentSaveListener(
    context: vscode.ExtensionContext,
    dispatcher: EventDispatcher
): void {

    const disposable = vscode.workspace.onDidSaveTextDocument((document) => {
        dispatcher.dispatch({
            type: "document.save",
            timestamp: Date.now(),
            file: document.uri.fsPath
        });
    });

    context.subscriptions.push(disposable);
}