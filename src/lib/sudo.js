'use strict';
const execa = require('execa');

module.exports = function sudo(command, ...args) {
  return execa( [command, ...args]);
};
