// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { CustomTextEditorProvider } from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "myext" is now active. VS Code version = ' + vscode.version);

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('myext.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from myext!');
	});

	context.subscriptions.push(disposable);

	class MyCustomTextEditorProvider implements CustomTextEditorProvider {

		resolveCustomTextEditor(document: vscode.TextDocument, webviewPanel: vscode.WebviewPanel, token: vscode.CancellationToken): void | Thenable<void> {
			webviewPanel.webview.options = {
				enableScripts: true,
			};
			webviewPanel.webview.html = getWebviewContent(document.getText());
			webviewPanel.webview.onDidReceiveMessage(message => {
				switch(message.cmd) {
					case 'addText':
						const lastLine = document.lineAt(document.lineCount-1);
						const range = new vscode.Range(lastLine.range.start, lastLine.range.end)
						let edit = new vscode.WorkspaceEdit();
						edit.insert(document.uri, range.end, "\nsome-new-text");
						vscode.workspace.applyEdit(edit);
				}
			});
		}
	};

	let editorProvider : MyCustomTextEditorProvider = new MyCustomTextEditorProvider();

	vscode.window.registerCustomEditorProvider('myext.myeditor', editorProvider);
}

function getWebviewContent(docContent: string): string {
	return `
	<!DOCTYPE html>
	<html lang="en">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>Some Title</title>
	</head>
	<body>
		<h1>My Custom Editor</h1>
		<p>${docContent}</p>
	<button type="button" onclick="addText()">Add text</button>
	</body>
	<script>
	const vscode = acquireVsCodeApi()
	function addText() {
		vscode.postMessage({cmd: 'addText'});
	}
	</script>
	</html>`;
}

// This method is called when your extension is deactivated
export function deactivate() {}
