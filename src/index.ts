import * as ReactObj from 'react';
import * as ReactDOMObj from 'react-dom';

export * from './utils';
export * from './stores';
export * from './models';
export * from './components';

declare global {
  const React: typeof ReactObj;
  const ReactDOM: typeof ReactDOMObj;
}
