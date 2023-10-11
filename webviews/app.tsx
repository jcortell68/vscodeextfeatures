import { render } from 'react-dom';
import React from 'react';

export function main() {
    render(<Hello />, document.getElementById('app'));
}

function Hello(props) {
    return <h1>This text added by a React file (tsx/jsx)!</h1>;
}