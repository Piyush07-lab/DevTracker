import * as vscode from "vscode";
import { EventDispatcher } from "./dispatcher";
import { 
    registerActiveEditorListener,
    registerDocumentOpenListener,
    registerDocumentCloseListener,
    registerDocumentSaveListener
} from "./listeners";
import {
    LoggerProcessor,
    SessionProcessor
} from "./processors";

export function activate(context: vscode.ExtensionContext): void {
    console.log("DevTracker activated.");

    const dispatcher = new EventDispatcher();

    const sessionProcessor = new SessionProcessor();

    dispatcher.register(new LoggerProcessor());
    dispatcher.register(sessionProcessor);

    const command = vscode.commands.registerCommand(
        "devtracker.start",
        () => {
            console.log(sessionProcessor.getCurrentSession());
            vscode.window.showInformationMessage("DevTracker started.");
        }
    );

    const statusBar = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Left,
        100
    );

    statusBar.text = "$(pulse) DevTracker";
    statusBar.tooltip = "DevTracker is running";
    statusBar.command = "devtracker.start";
    statusBar.show();

    context.subscriptions.push(command, statusBar);

    registerActiveEditorListener(context, dispatcher);
    registerDocumentOpenListener(context, dispatcher);
    registerDocumentSaveListener(context, dispatcher);
    registerDocumentCloseListener(context, dispatcher);
}

export function deactivate(): void { }