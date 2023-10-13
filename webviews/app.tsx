import { render } from 'react-dom';
import React from 'react';

export function main() {
    render(<MyList/>, document.getElementById('app'));
}


export default function MyList() {
    const items : React.JSX.Element[] = [];

    for (let i = 0; i < 100; i++) {
      items.push(<tr>
          <td key={i}>{`Item ${i}`}</td>
          </tr>
      );
    }

    return (
      <table>
        {items}
      </table>
    );
  }
