module.exports = function () {
  return {
    name: 'Anux',
    files: [
      '!src/**/*.tests.ts?(x)',
      { pattern: 'test-utils/**/*.ts?(x)', load: false },
      { pattern: 'src/**/*.ts?(x)', load: false },
    ],
    tests: [
      { pattern: 'src/**/*.tests.ts?(x)' },
    ],
    testFramework: 'mocha',
    env: {
      type: 'node',
    },
    workers: {
      initial: 6,
      regular: 3,
    },
    setup() {
      const chai = require('chai');
      const spies = require('chai-spies');
      const fuzzy = require('chai-fuzzy');

      const jsdom = require('jsdom');
      const dom = new jsdom.JSDOM('<!doctype html><html><body></body></html>');
      const enzyme = require('enzyme');
      const React = require('react');
      const enzymeAdapter = require('enzyme-adapter-react-16');

      chai.use(spies);
      chai.use(fuzzy);

      global['chai'] = chai;
      global['expect'] = chai.expect;
      global['React'] = React;
      global['document'] = dom.window.document;
      global['window'] = dom.window;
      global.navigator = {
        userAgent: 'node.js',
      };

      enzyme.configure({ adapter: new enzymeAdapter() });
    }
  };
}
