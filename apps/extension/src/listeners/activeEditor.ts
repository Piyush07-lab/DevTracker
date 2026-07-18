import * as vscode from "vscode";
import { EventDispatcher } from "../dispatcher";

export function registerActiveEditorListener(
    context: vscode.ExtensionContext,
    dispatcher: EventDispatcher
): void {

    const disposable = vscode.window.onDidChangeActiveTextEditor((editor) => {
        if (!editor) {
            return;
        }

        dispatcher.dispatch({
            type: "editor.active",
            timestamp: Date.now(),
            file: editor.document.uri.fsPath
        });
    });

    context.subscriptions.push(disposable);
}