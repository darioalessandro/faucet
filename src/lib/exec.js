'use strict';
const execa = require('execa');

module.exports = function exec(command, ...args) {
  return execa(command, [...args]);
};
