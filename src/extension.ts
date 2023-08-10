// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import { readFileSync, createWriteStream } from 'fs';
import { get } from 'http';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "myext" is now active. VS Code version = ' + vscode.version);

	let panel: vscode.WebviewPanel | undefined = undefined;

	let workerWebviewUri : vscode.Uri;

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('myext.webview', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user


		const editorColumn = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;

		if (panel) {
			panel.reveal(editorColumn);
		} else {
			panel = vscode.window.createWebviewPanel(
				'myextWebviewPanelType', // Identifies the type of the webview. Used internally
				'My Webview Panel', // Title of the panel displayed to the user
				editorColumn ? editorColumn : vscode.ViewColumn.One,
				{
					enableScripts: true  // we want javascript in our webview
				}
			);
		}

		// We want our webview to show an image that's distributed in the extension. We need
		// to create a special webview URI for that
		const imgLocalUri = vscode.Uri.joinPath(context.extensionUri, 'resources', 'bnb.png');
		const imgWebviewUri = panel.webview.asWebviewUri(imgLocalUri);

		// We want our webview to launch a webworker, the code for which is a javascript
		// file distributed in the extension. So same process as above.
		const workerLocalUri = vscode.Uri.joinPath(context.extensionUri, 'src', 'webworker.js');
		workerWebviewUri = panel.webview.asWebviewUri(workerLocalUri);

		// Show some initial conent
		panel.webview.html = getWebviewContent("Hi!", imgWebviewUri, workerWebviewUri);

		// Stop updating the  webview content if the panel is closed. Otherwise
		// the code will experience an exception every second until the app
		// is closed
		panel.onDidDispose(
			() => {
				panel = undefined;
			},
			null,
			context.subscriptions
		);

		panel.webview.onDidReceiveMessage(message => {
			switch (message.command) {
				case 'alert':
					vscode.window.showInformationMessage('Rounds = ' + message.roundVal);
			}
		});

	});

	context.subscriptions.push(disposable);

	disposable = vscode.commands.registerCommand('myext.helloWorld', () => {
		vscode.window.showInformationMessage("Hello World from VS Code extension");
	});
	context.subscriptions.push(disposable);

	disposable = vscode.commands.registerCommand('myext.laugh', () => {
		vscode.window.showInformationMessage("Laughing from VS Code extension");
	});
	context.subscriptions.push(disposable);

	disposable = vscode.commands.registerCommand('myext.cry', () => {
		vscode.window.showInformationMessage("Crying from VS Code extension");
	});
	context.subscriptions.push(disposable);

	disposable = vscode.commands.registerCommand('myext.doublecount', () => {
		if (panel) {
			// Send a message to our webview.
			// You can send any JSON serializable data.
			panel.webview.postMessage({ command: 'doReset' });
		}
	});
	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}

function getWebviewContent(msg: string, img: vscode.Uri, workerUri: vscode.Uri) {
	return `
	<!DOCTYPE html>
	<html lang="en">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>Some Title</title>
		<style>
		body.vscode-light {
			color: red;
		}

		body.vscode-dark {
			color: yellow;
		}

		body.vscode-high-contrast {
			color: blue;
		}
		</style>
	</head>
	<body>
		<h1>${msg}</h1>
		<img src="${img}"/>
		<p>The webview HTML content includes internal CSS that will set the text color as follows:
		<ul>
		<li>light-theme: red</li>
		<li>dark-theme: yellow</li>
		<li>high-contrast: blue</li>
		</ul>
		Hit CTRL-K + CTRL-T to change the theme
		</p>

		<div class="main" data-vscode-context='{"webviewSection": "this", "mouseCount": 4}'>
		<h1>ABC</h1>

		<textarea data-vscode-context='{"webviewSection": "that", "preventDefaultContextMenuItems": true}'></textarea>

		<h1 id="lines-of-code-counter">0</h1>
		<p id="somemessage">placeholder</p>
		<script>
			const counter = document.getElementById('lines-of-code-counter');
			const somemessage = document.getElementById('somemessage');
			const vscode = acquireVsCodeApi();
			let count = 0;
			let rounds = 0; // A round is a sequence of 10
			setInterval(() => {
				counter.textContent = "This line is being updated by javascript in the Webview HTML: " + count;
				// Somehow we can use bit inversion (~) to strip the decimal part of the number. Not sure how but it seems to work.
				if ((~~(count/10)) != rounds) {
					rounds = ~~(count/10);
					vscode.postMessage({command: 'alert', roundVal: rounds});
				}
				count++;
			}, 100);
			window.addEventListener('message', event => {
				const message = event.data;  // The JSON data our extension sent
				switch (message.command) {
					case 'doReset':
						count *= 2;
						break;
				}
			});
			console.log("This message is generated by the JavaScript running in the HTML, but not the Web Worker it launches.");
			const workerSource = "${workerUri}";  // This is something like: https://file%2B.vscode-resource.vscode-cdn.net/c%3A/j.cortell/git/vscodeextfeatures/src/webworker.js
			fetch(workerSource)
				.then(result => result.blob())
				.then(blob => {
					somemessage.textContent = 'Going to try to cretate Web Worker';
					const blobUrl = URL.createObjectURL(blob);
					const worker = new Worker(blobUrl);
					somemessage.textContent = 'Created Web Worker!';

					setInterval(() => {
						const msg = 'How are you holding up?';
						console.log("Sending message to Web Worker: " + msg);
						worker.postMessage([msg]);
					}, 1000);

					worker.onmessage = (e) => {
						console.log("Received message back from Web Worker: " + e.data[0]);
					}
				})
				.catch(error => {somemessage.textContent = 'did not get it! ' + error});
    	</script>
	  </div>
	</body>
	</html>`;
}
