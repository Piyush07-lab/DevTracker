import * as vscode from 'vscode';
import * as https from 'https';
import * as http from 'http';

let lastActivityTime = Date.now();
let activeDocument: vscode.TextDocument | null = null;

function getServerUrl(): URL {

	const config = vscode.workspace.getConfiguration("devtacker");
	const serverUrl = config.get<string>("serverUrl") || "http://localhost:5000";

	return new URL(serverUrl);
}


function sendCodingActivity(document: vscode.TextDocument) {
	
	const payload = {
		fileName: document.fileName,
		language: document.languageId,
		time: new Date().toISOString()
	};

	const postData = JSON.stringify(payload);

	const server = getServerUrl();

	const options: http.RequestOptions = {
		hostname: server.hostname,
		port: server.port || 80,
		path: '/api/coding.js',
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Content-Length': Buffer.byteLength(postData),
		},
	};

	const req = http.request(options, res => {
		res.on('data', () => {});
	});

	req.on('error', err => {
		console.error(`[Dev Tracker] failed to send data: ${err.message}`);
	});

	req.write(postData);
	req.end();

	console.log('[Dev Tracker] Activity sent:', payload);

}

export function activate(context: vscode.ExtensionContext) {

	console.log('[Dev Tracker] Activated');

	const changeListener = vscode.workspace.onDidChangeTextDocument(event => {

		lastActivityTime = Date.now();
		activeDocument = event.document;

	});

	context.subscriptions.push(changeListener);
	
	const editorListener = vscode.window.onDidChangeActiveTextEditor(editor => {

		if (editor) {
			activeDocument = editor.document;
			lastActivityTime = Date.now();
		}

	});

	context.subscriptions.push(editorListener);

	const heartbeat = setInterval(() => {

		const idleTime = Date.now() - lastActivityTime;

		if (idleTime < 120000 && activeDocument) {

			sendCodingActivity(activeDocument);
		}

	}, 6000);

	context.subscriptions.push({
		dispose: () => clearInterval(heartbeat)
	});
}

export function deactivate() {
	console.log('[Dev Tracker] Deactivated');
}
