import { render } from 'react-dom';
import React, { useState } from 'react';

export function main() {
    render(<MyList/>, document.getElementById('app'));
}


export default function MyList() {
    function handleClick() {
      setIsShown(current => !current);
    }

    const [isShown, setIsShown] = useState(true);

    return (
      <div>
        <textarea className="query-input" placeholder="Enter query and press Cmd/Ctrl + Enter" rows={5}></textarea>
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
        <button onClick={handleClick}>Press me</button>
      </div>
    );
  }
