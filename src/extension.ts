// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import { readFileSync, createWriteStream } from 'fs';
import { get } from 'http';

let serializedCount : undefined | number;

// A webview panel serializer comes into play only when VS Code is opened
// after it was closed while a webview panel was open (i.e., not disposed).
// I.e., if at the moment VS Code is closed, there is a webview open, then
// any state the webview has stored away via vscode.setState() ends up
// getting persisted to disk. Upon relaunching VS Code, VS Code tries to
// automatically recreate and open the webview...but it doesn't know how
// to recreate the content. That logic is within the VS Code extension that
// contributes the webview. That's where a WebviewPanelSerializer comes in.
// VS Code creates the webview panel object, then calls the serializer
// giving it any saved state the webview had (again, from setState()). The
// The serializer is responsible for creating the webview's HTML content
// from that state.
//
// Note that the deserializer only comes into play if the webview is open
// when VS Code closes. If you explicitly clos the webview (i.e., dispose
// it) then close VS Code, this serialization mechanism does not come into
// play at all.
//
// Also note that the VS Code extension must register for an activationEvent
// such that the extension is activated if a webview panel needs to be restored
// on launch of VS Code. See
// https://code.visualstudio.com/api/references/activation-events#onWebviewPanel
class MyWebviewSerializer implements vscode.WebviewPanelSerializer {

	constructor(private context: vscode.ExtensionContext) {
	}

	async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel, state: any) {
		// `state` is the state persisted using `setState` inside the webview
		console.log(`MyWebviewSerializer.deserializeWebviewPanel() called. state = ${state}`);
		console.log(`state.count = ${state.count}`);
		if (state.count) {
			serializedCount = state.count;
		}

		// This is copied from the code that creates the webview initially (see below)
		const imgLocalUri = vscode.Uri.joinPath(this.context.extensionUri, 'resources', 'bnb.png');
		const imgWebviewUri = webviewPanel.webview.asWebviewUri(imgLocalUri);
		const workerLocalUri = vscode.Uri.joinPath(this.context.extensionUri, 'src', 'webworker.js');
		const workerWebviewUri = webviewPanel.webview.asWebviewUri(workerLocalUri);

		webviewPanel.webview.html = getWebviewContent("Hi!", imgWebviewUri, workerWebviewUri, serializedCount);
	}
};

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
		panel.webview.html = getWebviewContent("Hi!", imgWebviewUri, workerWebviewUri, serializedCount);

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
			console.log("extension received message from webview panel");
			switch (message.command) {
				case 'alert':
					vscode.window.showInformationMessage('Rounds = ' + message.roundVal);
					break;
				case 'saveCount':
					vscode.window.showInformationMessage('Asked to save count');
					break;

			}
		});

	});

	// And make sure we register a serializer for our webview type
	vscode.window.registerWebviewPanelSerializer('myextWebviewPanelType', new MyWebviewSerializer(context));

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

function getWebviewContent(msg: string, img: vscode.Uri, workerUri: vscode.Uri, serializedCount: number | undefined) {
	if (!serializedCount) {
		serializedCount = 0;
	}
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
		<script>
			const vscode = acquireVsCodeApi();

			const prevState = vscode.getState();
			console.log("prevState = " + prevState);
			let count = 0;
			if (prevState) {
				count = prevState.count;
				console.log("setting count from prevState to " + prevState);
			}
			else {
				count = ${serializedCount};
				console.log("setting count to " + ${serializedCount});
			}

			const counter = document.getElementById('lines-of-code-counter');
			let rounds = ~~(count/10); // A round is a sequence of 10

			setInterval(() => {
				counter.textContent = "This line is being updated by javascript in the Webview HTML: " + count;
				// Somehow we can use bit inversion (~) to strip the decimal part of the number. Not sure how but it seems to work.
				if ((~~(count/10)) != rounds) {
					rounds = ~~(count/10);
					vscode.postMessage({command: 'alert', roundVal: rounds});
				}
				count++;
				vscode.setState({count});
			}, 100);
			window.addEventListener('message', event => {
				const message = event.data;  // The JSON data our extension sent
				switch (message.command) {
					case 'doReset':
						count *= 2;
						break;
				}
			});
    	</script>
	  </div>
	</body>
	</html>`;
}
