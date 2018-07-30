'use strict';

const os = require('os');
const pfctl = require('./pfctl');
const tc = require('./tc');

function verify(options) {
  if (options.localhost) {
    if (!Number.isInteger(options.rtt)) {
      throw new Error('You need to set rtt as an integer for localhost');
    }
  } else if (
    !Number.isInteger(options.up) ||
    !Number.isInteger(options.down) ||
    !Number.isInteger(options.rtt)
  ) {
    throw new Error('Input values needs to be integers');
  }
}

module.exports = {
  async start(options) {
    verify(options);

    switch (os.platform()) {
      case 'darwin': {
        return pfctl.start(options.up, options.down, options.rtt);
      }

      case 'linux': {
          return tc.start(options.up, options.down, options.rtt);
      }

      default:
        throw new Error('Platform ' + os.platform() + ' not supported');
    }
  },
  async stop() {
    switch (os.platform()) {
      case 'darwin': {
        return pfctl.stop();
      }

      case 'linux': {
        return tc.stop();
      }

      default:
        throw new Error('Platform ' + os.platform() + ' not supported');
    }
  }
};
