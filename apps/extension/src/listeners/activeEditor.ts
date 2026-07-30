import * as vscode from "vscode";
import { EventDispatcher } from "../dispatcher";
import { getProjectName, toTrackedPath } from "../paths";
import type { DevTrackerEvent } from "../dispatcher";

export function registerActiveEditorListener(
    context: vscode.ExtensionContext,
    dispatcher: EventDispatcher
): void {

    const disposable = vscode.window.onDidChangeActiveTextEditor((editor) => {
        if (!editor) {
            return;
        }

        const project = getProjectName(editor.document.uri);

        const event: DevTrackerEvent = {
            type: "editor.active",
            timestamp: Date.now(),
            file: toTrackedPath(editor.document.uri),
            ...(project !== undefined ? { project } : {}),
        };

        dispatcher.dispatch(event);
    });

    context.subscriptions.push(disposable);
}