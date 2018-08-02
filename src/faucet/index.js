'use strict';

const tc = require('./tc');

/**
 * Faucet is a nodejs utility to control the Network Configuration.
 * @type {{start, stop}|*}
 */

function verifyCommandParameters(options) {
  if (options.localhost) {
    if (!Number.isInteger(options.rtt)) {
      throw new Error('You need to set rtt as an integer for localhost');
    }
  } else if (
    !Number.isInteger(options.up) ||
    // !Number.isInteger(options.down) ||
    !Number.isInteger(options.rtt)
  ) {
    throw new Error('Input values needs to be integers');
  }
}

module.exports = {
  async start(options) {
    verifyCommandParameters(options);
    console.log('faucet :', 'setting network parameters to',
        `up= ${options.up}Kbps`, /*`down= ${options.down}Kbps`,*/ `rtt= ${options.rtt}mS`);
    return tc.start(options.up, /*options.down,*/ options.rtt);
  },
  async stop() {
      return tc.stop();
  }
};
