import { render } from 'react-dom';
import React, { useState } from 'react';

export function main() {
    render(<MyComponent />, document.getElementById('app'));
}

export default function MyComponent() {
  const [stateCount, setStateCount] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  let sessionStorageCount = 0;
  let countStr = sessionStorage.getItem('scount');
  if (countStr) {
      sessionStorageCount = Number(countStr);
  }

  let localStorageCount = 0;
  countStr = localStorage.getItem('lcount');
  if (countStr) {
      localStorageCount = Number(countStr);
  }

  function insreaseStateCount() {
      setStateCount(stateCount + 1);
  }

  function insreaseSessionStorageCount() {
      sessionStorageCount++;
      sessionStorage.setItem('scount', `${sessionStorageCount}`);
      setRefreshTrigger(refreshTrigger+1);
  }

  function insreaseLocalStorageCount() {
    localStorageCount++;
    localStorage.setItem('lcount', `${localStorageCount}`);
    setRefreshTrigger(refreshTrigger+1);
}

  return (
      <div>
      <h1>Hello World from a React component in a webview!
      </h1>
      <button onClick={insreaseStateCount}>Increase count in state</button>
      <button onClick={insreaseSessionStorageCount}>Increase count in session storage</button>
      <button onClick={insreaseLocalStorageCount}>Increase count in local storage</button>
      <p>Count in state = {stateCount}</p>
      <p>Count in session storage = {sessionStorageCount}</p>
      <p>Count in local storage = {localStorageCount}</p>
      </div>
  );
}