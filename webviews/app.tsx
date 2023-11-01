import { render } from 'react-dom';
import React, { KeyboardEvent, useState, useEffect, useRef } from 'react';

let vscode: any;

export function main(_vscode: any) {
  vscode = _vscode;

  // // Handle the message inside the webview
  // window.addEventListener('message', event => {
  //   const message = event.data; // The JSON data our extension sent
  //   switch (message.command) {
  //       case 'queryResult':
  //         console.log(`Webview received message from extension: ${message.result}`);
  //         break;
  //   }
  // });

  render(<MyComponent/>, document.getElementById('app'));
}

async function runQuery(query: string) {
  vscode.postMessage(
    {
      command: 'runQuery',
      query
    }
  );
}

// Investigate further. This is needed because moving the view
// to the background seems to reset the view and all its state.
// This will ensure the counter value survives that activity.
// But two oddities:
//   1. it survives a browser/electron reload, which we don't want
//   2. what do other views do? Something tells me it's not this
export function bumpCounter() {
  let counter = 0;
  if (localStorage.getItem('mycounter')) {
      counter = Number(localStorage.getItem('mycounter'));
  }
  counter++;
  localStorage.setItem('mycounter', counter.toString());
}

export function getCounter(): number {
  if (localStorage.getItem('mycounter')) {
      return Number(localStorage.getItem('mycounter'));
  }
  localStorage.setItem('mycounter', '0');
  return 0;
}

function useCounter() : [number, never[]] {
  const [counter, setCounter] = useState(getCounter()); // jjjjjjjjjjjjj
  const [queryResults, setQueryResults] = useState([]); // jjjjjjjjjjjjj

  useEffect(() => {
    const listener = event => {
      const message = event.data; // The JSON data our extension sent
      switch (message.command) {
          case 'queryResult':
            console.log(`Webview received message from extension: ${JSON.stringify(message.result)}. counter = ${getCounter()}`);
            bumpCounter();
            setCounter(getCounter());
            setQueryResults(message.result);
            break;
      }
    };

    window.addEventListener('message', listener);
    return () => {
      window.removeEventListener('message', listener);
    };
  }, []);
  return [counter, queryResults];
}

function TableResults(props: {tableResults: never[]}) {
  const items: React.JSX.Element[] = [];
  const firstResult :any = props.tableResults[0];
  const ths: React.JSX.Element[] = [];
  for (let prop in firstResult) {
    if (Object.prototype.hasOwnProperty.call(firstResult, prop)) {
        ths.push(<th>{prop}</th>);
    }
  }
  items.push(<tr>{ths}</tr>);

  props.tableResults.forEach(element => {
    const tds: React.JSX.Element[] = [];
    let obj : any = element;
    for (let prop in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, prop)) {
        if (typeof element[prop] === 'string') {
          tds.push(<td>{element[prop]}</td>);
        } else if (typeof element[prop] === 'number') {
          let n :number = element[prop];
          tds.push(<td>{n.toString()}</td>);
        }
      }
    }
    if (element['player'] && element['position']) {
      items.push(<tr>{tds}</tr>);
    }
  });
  return (<table>
    {items}
  </table>);
}

export default function MyComponent() {
    const myref = useRef<HTMLTextAreaElement>(null);
    const [counter, queryResults] = useCounter();

    console.log('MyComponent created');
    console.log(`query results= ${JSON.stringify(queryResults)}`);

    function keyDown(event: KeyboardEvent) {
      if (event.ctrlKey && event.key === 'Enter') {
        console.log(`Textarea text is: ${myref.current?.value}`);
        if (myref.current) {
          runQuery(myref.current.value);
        }
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
        <span>Query History ({counter} queries)</span>
        {!!queryResults && <TableResults tableResults={queryResults}/>}
        {!queryResults && <h1>No results</h1>}
      </div>
    );
  }
