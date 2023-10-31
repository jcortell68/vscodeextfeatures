import { render } from 'react-dom';
import React, { KeyboardEvent, useState, useEffect, useRef } from 'react';

let vscode: any;

export function main(_vscode: any) {
  vscode = _vscode;

  // Handle the message inside the webview
  window.addEventListener('message', event => {
    const message = event.data; // The JSON data our extension sent
    switch (message.command) {
        case 'goodbye':
          console.log('Webview received message from extension');
          break;
    }
  });

  render(<MyComponent/>, document.getElementById('app'));
}

async function runQuery(query: string) {

}

export default function MyComponent() {
    const myref = useRef<HTMLTextAreaElement>(null);
    function keyDown(event: KeyboardEvent) {
      if (event.ctrlKey && event.key === 'Enter') {
        console.log(`Textarea text is: ${myref.current?.value}`);
        vscode.postMessage({command: 'hello'});
      }
    }

   const [isShown, setIsShown] = useState(false);

    return (
      <div>
        <textarea className="query-input" placeholder="Enter query and press Cmd/Ctrl + Enter" rows={5} onKeyDown={keyDown} ref={myref}></textarea>
        <div style={{display: isShown ? 'flex' : 'none'}} className="query-result-header">
          <span id="msg"></span>
          <span id="result-header" className="query-result-header-buttons">
            <button className="query-result-header-button">Copy Query</button>
            <button className="query-result-header-button">Copy Result (.tsv)</button>
            <button className="query-result-header-button">Close</button>
          </span>
        </div>
        <span>Query History (0 queries)</span>
        <table id="results">
        </table>
      </div>
    );
  }
