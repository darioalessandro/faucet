'use strict';
const exec = require('./exec');
const path = require('path');

const confPath = path.resolve(__dirname, '..', 'conf');
const pfctlConfPath = path.resolve(confPath, 'pfctl.rules');

module.exports = {
  async start(up, down, rtt) {
    const halfWayRTT = rtt / 2;

    await this.stop();

    await exec('dnctl', '-q', 'flush');
    await exec('dnctl', '-q', 'pipe', 'flush');

    await exec('dnctl', 'pipe', 1, 'config', 'delay', '0ms', 'noerror');
    await exec('dnctl', 'pipe', 2, 'config', 'delay', '0ms', 'noerror');
    // Needs the right path
    await exec('pfctl', '-f', pfctlConfPath);

    await exec(
      'dnctl',
      'pipe',
      1,
      'config',
      'bw',
      `${down}Kbit/s`,
      'delay',
      `${halfWayRTT}ms`
    );

    await exec(
      'dnctl',
      'pipe',
      3,
      'config',
      'bw',
      `${up}Kbit/s`,
      'delay',
      `${halfWayRTT}ms`
    );
    await exec('pfctl', '-E');
  },
  async stop() {
    await exec('dnctl', '-q', 'flush');
    await exec('dnctl', '-q', 'pipe', 'flush');
    await exec('pfctl', '-f', '/etc/pf.conf');
    await exec('pfctl', '-E');
    await exec('pfctl', '-d');
  }
};
