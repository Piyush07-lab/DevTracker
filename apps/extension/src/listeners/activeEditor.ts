import * as vscode from "vscode";
import { EventDispatcher } from "../dispatcher";
import { toTrackedPath } from "../paths";

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
            file: toTrackedPath(editor.document.uri)
        });
    });

    context.subscriptions.push(disposable);
}