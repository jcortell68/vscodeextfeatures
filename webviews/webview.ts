// This script will be run within the webview itself. It cannot access the main
// VS Code APIs directly. It does have access to an alternate and very limited
// vscode API object that it can get by calling the global function
// acquireVsCodeApi(). The returned object has but three functions in it.
// See https://www.npmjs.com/package/@types/vscode-webview

// TODO: how to get and use the @types above for type checking and code completion.
// For now, use this hack
declare var acquireVsCodeApi: any;
const vscode = acquireVsCodeApi();
import {main} from './app';

(function () {
    const elem = document.getElementById('my_button');
    if (elem) {
        elem.textContent = "This button's label set by a JavaScript file (*.js) produced by transpiling a TypeScript file (*.ts)";
    }

    //addEventListener('load', main);
    addEventListener('load', () => {
        main(vscode);
    });
}());
