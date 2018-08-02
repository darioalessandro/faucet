'use strict';
const execa = require('execa');
const exec = require('./exec');

async function findTheDefaultInterface() {
  const result = await execa.shell(
    "route | grep '^default' | grep -o '[^ ]*$'"
  );
  return result.stdout;
}

async function setLimits(up, down, halfWayRTT, iFace) {
    // Configure up bitrate
    await exec('tc', 'qdisc', 'add', 'dev', iFace, 'root', 'handle', '1:0',
    'netem', 'delay', `${halfWayRTT}ms`, 'rate', `${up}kbit`);

    // Configure down bitrate.
    // TODO (Dario): Use the technique described here
    // It turns out that it is not possible to control the ingress bitrate through tc.
    // await exec('tc', 'qdisc', 'add', 'dev', iFace, 'handle', 'ffff:', 'ingress');
    // await exec('tc', 'filter', 'add', 'dev', iFace, 'parent', 'ffff:', 'protocol', 'ip', 'prio', '50',
    //     'u32', 'match', 'ip', 'src', '0.0.0.0/0', 'police', 'rate', `${down}kbit`,
    //     'burst', '10k', 'drop', 'flowid', ':1');
}

module.exports = {
  async start(up, down, rtt) {
    const halfWayRTT = rtt / 2;
    // Stop before starting.
    await this.stop();
    const iFace = await findTheDefaultInterface();
    await setLimits(up, down, halfWayRTT, iFace);
  },
  async stop() {
    const iFace = await findTheDefaultInterface();

    try {
      try {
        await exec('tc', 'qdisc', 'del', 'dev', iFace, 'root');
        await exec('tc', 'qdisc', 'del', 'dev', iFace, 'ingress');
      } catch (e) {
        // make sure we try to remove the ingress
        await exec('tc', 'qdisc', 'del', 'dev', iFace, 'ingress');
      }
    } catch (e) {
      // ignore
    }

    try {
      await exec('tc', 'qdisc', 'del', 'dev', 'ifb0', 'root');
    } catch (e) {
      // do nada
    }
  }
};
