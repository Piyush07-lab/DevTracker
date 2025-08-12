import * as vscode from 'vscode';
import * as https from 'https';
import * as http from 'http';


function sendCodingActivity(data: object) {
	const postData = JSON.stringify(data);

	const options: http.RequestOptions = {
		hostname: 'localhost',
		port: 5000,
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
		console.error(`[OCDbug Logger] failed to send data: ${err.message}`);
	});

	req.write(postData);
	req.end();
}

export function activate(context: vscode.ExtensionContext) {
	console.log('[OCDbug Logger] Activated');

	const disposable = vscode.workspace.onDidSaveTextDocument((document) => {
		const language = document.languageId;
		const fileName = document.fileName;
		const time = new Date().toISOString();

		const payload = {
			fileName,
			language,
			time
		};

		sendCodingActivity(payload);
		console.log(`[OCDbug Logger] Logged ativity:`, payload);
	});

	context.subscriptions.push(disposable);

}

export function deactivate() {
	console.log('[OCDbug Logger] Deactivated');
}
