// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

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

    disposable = vscode.window.registerWebviewViewProvider('myext_myView', new MyWebviewViewProvider(context.extensionUri, context.subscriptions));
    context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}

export interface QueryResult {
    data: {}[],
    error: undefined | string
}

class MyWebviewViewProvider implements vscode.WebviewViewProvider {
    constructor(private readonly _extensionUri: vscode.Uri,
        private readonly disposables: vscode.Disposable[]) {
	}

    resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext<unknown>,
        token: vscode.CancellationToken
    ): void | Thenable<void> {
        const webview = webviewView.webview;
        webview.options = {
            // Allow scripts in the webview
            enableScripts: true,

            localResourceRoots: [this._extensionUri]
        };

        // Handle messages from the webview
        webview.onDidReceiveMessage(
            message => {
                let data: {}[] = [];
                let result: QueryResult = {
                    data,
                    error: undefined
                };
                switch (message.command) {
                case 'runQuery':
                  console.log(`Extension received runQuery request from webview: ${message.query}`);

                  console.log(`jjj message.query=${message.query}`);
                  // pretend we ran the query
                  if (message.query === 'yankees') {
                    data[0] = {player: 'Aaron Judge', position: 'RF', games: 106, atBats: 367};
                    data[1] = {player: 'Gleyber Torres', position: '2B', games: 158, atBats: 596};
                    data[2] = {player: 'Giancarlo Stanton', position: 'DH', games: 101, atBats: 371};
                  }
                  else if (message.query === 'mets') {
                    data[0] = {player: 'Pete Alonso', position: '1B', games: 154, atBats: 568};
                    data[1] = {player: 'Franciscon Lindor', position: 'SS', games: 160, atBats: 602};
                    data[2] = {player: 'Francisco Alvaraz', position: 'C', games: 123, atBats: 382};
                  }
                  else {
                    result.error = 'Invalid query';
                    webview.postMessage({command: 'queryResult', result});
                    return;
                  }

                  webview.postMessage({command: 'queryResult', result});
                  return;
              }
            },
            undefined,
            this.disposables
          );

          webview.html = this.getHtmlForWebview(webview);
    }

    private getHtmlForWebview(webview: vscode.Webview) {
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'dist', 'webview.js'));
        const cssUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'src', 'styles.css'));
        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <link rel="stylesheet" href="${cssUri}"/>
            </head>
            <body>
                <div id="app"></div>
                <script src="${scriptUri}"/>
            </body>
            </html>`;
    }
}
