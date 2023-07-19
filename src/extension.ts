// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// Decoration stuff inspired by https://vscode.rocks/decorations/
const decorationType = vscode.window.createTextEditorDecorationType({
	backgroundColor: new vscode.ThemeColor('myext.mybluecolor'),
	border: '2px solid white',
});

function decorate(editor: vscode.TextEditor) {
	const sourceCode = editor.document.getText();
	const regex = /(console\.log)/;
	const decorations: vscode.DecorationOptions[] = [];
	const lines = sourceCode.split('\n');
	for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
	  const match = lines[lineIndex].match(regex);
	  if (match !== null && match.index !== undefined) {
		const range = new vscode.Range(
		  new vscode.Position(lineIndex, match.index),
		  new vscode.Position(lineIndex, match.index + match[1].length)
		);

		decorations.push({range});
	  }
	}
	editor.setDecorations(decorationType, decorations);
}

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

	vscode.workspace.onWillSaveTextDocument(event => {
		const openEditor = vscode.window.visibleTextEditors.filter(
		  editor => editor.document.uri === event.document.uri
		)[0];
		decorate(openEditor);
	});
}

// This method is called when your extension is deactivated
export function deactivate() {}
