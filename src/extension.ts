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

    disposable = vscode.window.registerWebviewViewProvider('myext_myView', new MyWebviewViewProvider(context.extensionUri));
    context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}

class MyWebviewViewProvider implements vscode.WebviewViewProvider {
    constructor(private readonly _extensionUri: vscode.Uri) {
	}

    resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext<unknown>,
        token: vscode.CancellationToken
    ): void | Thenable<void> {
        webviewView.webview.options = {
            // Allow scripts in the webview
            enableScripts: true,

            localResourceRoots: [this._extensionUri]
        };

        webviewView.webview.html = this.getHtmlForWebview();
    }

    private getHtmlForWebview() {
        return `<script>
        function myHandler() {
          let counter = 0;
          let setting = window.sessionStorage.getItem('counter');
          if (setting) {
            counter = Number(setting);
          }
          counter++;
          window.sessionStorage.setItem('counter', counter);
          console.log(\`session counter = \${String(counter)}\`);
          document.getElementById("session").textContent=\`sessionStorage counter=\${counter}\`;

          counter = 0;
          setting = window.localStorage.getItem('counter');
          if (setting) {
            counter = Number(setting);
          }
          counter++;
          window.localStorage.setItem('counter', counter);
          console.log(\`local counter = \${String(counter)}\`);
          document.getElementById("local").textContent=\`localStorage counter=\${counter}\`;

        }
        </script>

        <button onClick="myHandler()">
        Increment Counters
        </button>
        <p id="session"/>
        <p id="local"/>
        `;
    }
}
