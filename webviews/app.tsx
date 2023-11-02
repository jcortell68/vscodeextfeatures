import { render } from 'react-dom';
import React, { KeyboardEvent, useState, useEffect, useRef } from 'react';
import {QueryResult} from '../src/extension';

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

const qrNull: QueryResult = {
  data: [],
  error: undefined
};

function useCounter() : [number, React.Dispatch<React.SetStateAction<number>>, QueryResult, React.Dispatch<React.SetStateAction<QueryResult>>] {
  const [counter, setCounter] = useState(getCounter()); // jjjjjjjjjjjjj
  const [queryResults, setQueryResults] = useState(qrNull); // jjjjjjjjjjjjj

  useEffect(() => {
    const listener = event => {
      const message = event.data; // The JSON data our extension sent
      switch (message.command) {
          case 'queryResult':
            console.log(`Webview received message from extension}`);
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
  return [counter, setCounter, queryResults, setQueryResults];
}

function TableResults(props: {tableResults: QueryResult}) {
  const items: React.JSX.Element[] = [];
  const firstResult :any = props.tableResults[0];
  const ths: React.JSX.Element[] = [];
  for (let prop in firstResult) {
    if (Object.prototype.hasOwnProperty.call(firstResult, prop)) {
        ths.push(<th>{prop}</th>);
    }
  }
  items.push(<tr>{ths}</tr>);

  props.tableResults.data.forEach(element => {
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

function QueryList(props: {queries: never[]}) {
  const items: React.JSX.Element[] = [];
  props.queries.forEach(element => {
    items.push(<div className='history-item'><pre>{element}</pre></div>);
  });
  return(<div>{items}</div>);
}

function QueryResults(props: {queryStr: string | undefined, result: QueryResult, onClickClose: ()=>void}) {
  let rowsLine = !props.result.error ? `${props.result.data.length} rows` : 'error';

  const queryStr = props.queryStr?? '';

  return(<div>

    {(
      <section>
        <header className='sql-header-bar'>
          <h1 className='sql-header-title'>Query result ({rowsLine}) - 123ms</h1>
          <span className='sql-header-description'>{queryStr}</span>
          <span className="sql-header-buttons">
            <button className="sql-header-button">Copy Query</button>
            {props.result.data.length !== 0 && <button className="sql-header-button">Copy Result (.tsv)</button>}
            <button className="sql-header-button" onClick={props.onClickClose}>Close</button>
          </span>
        </header>
        {!props.result.error && <TableResults tableResults={props.result}/>}
        {!!props.result.error && <article><div className='sql-error'>{props.result.error}</div></article>}

      </section>)}

  </div>);
}

export default function MyComponent() {
    const myref = useRef<HTMLTextAreaElement>(null);
    const [counter, setCounter, queryResult, setQueryResults] = useCounter();
    const [clear, setClear] = useState(true);
    const [queryHistory, setQueryHistory] = useState([]);

    console.log('MyComponent created');
    console.log(`query results= ${JSON.stringify(queryResult)}`);

    function keyDown(event: KeyboardEvent) {
      if (event.ctrlKey && event.key === 'Enter') {
        console.log(`Textarea text is: ${myref.current?.value}`);
        if (myref.current) {
          setClear(false);
          runQuery(myref.current.value);
          setQueryHistory([myref.current.value as never, ...Array.from(queryHistory).reverse()]);
        }
      }
    }

    function onClickClose() {
      setQueryResults(qrNull);
      setClear(true);
    }


   const haveData = queryResult.data.length !== 0;

    return (
      <div>
        <textarea className="sql-enter-query" placeholder="Enter query and press Cmd/Ctrl + Enter" rows={5} onKeyDown={keyDown} ref={myref}></textarea>
        {!clear && <QueryResults queryStr={myref.current?.value} result={queryResult} onClickClose={onClickClose}/>}
        <header className='history'>Query History ({counter} queries)</header>
        {queryHistory.length !== 0 && <div><QueryList queries={queryHistory}/></div>}
      </div>
    );
  }
