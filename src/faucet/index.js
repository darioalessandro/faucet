'use strict';

/*
Copyright [2018] [Dario Alessandro Lencina Talarico]

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
limitations under the License.
*/

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
