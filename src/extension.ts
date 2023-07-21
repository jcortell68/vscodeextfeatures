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

		// Show some initial conent
		panel.webview.html = getWebviewContent("Hi!", imgWebviewUri);

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

}

// This method is called when your extension is deactivated
export function deactivate() {}

function getWebviewContent(msg: string, img: vscode.Uri) {
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
			const counter = document.getElementById('lines-of-code-counter');
			let count = 0;
			setInterval(() => {
				counter.textContent = "This line is being updated by javascript in the Webview HTML: " + count++;
			}, 100);
    	</script>
	  </div>
	</body>
	</html>`;
}
