'use strict';
const execa = require('../execa/index');

module.exports = function sudo(command, ...args) {
  console.log('Sending command', [command, ...args]);
  return execa(command, [...args]);
};
