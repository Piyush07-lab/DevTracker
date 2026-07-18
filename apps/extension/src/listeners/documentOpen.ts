import * as vscode from "vscode";
import { EventDispatcher } from "../dispatcher";

export function registerDocumentOpenListener(
    context: vscode.ExtensionContext,
    dispatcher: EventDispatcher
): void {

    const disposable = vscode.workspace.onDidOpenTextDocument((document) => {
        dispatcher.dispatch({
            type: "document.open",
            timestamp: Date.now(),
            file: document.uri.fsPath
        });
    });

    context.subscriptions.push(disposable);
}