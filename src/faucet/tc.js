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

const execa = require('execa');
const exec = require('./exec');

async function findTheDefaultInterface() {
  const result = await execa.shell(
    "route | grep '^default' | grep -o '[^ ]*$'"
  );
  return result.stdout;
}

async function setLimits(up, /*down,*/ halfWayRTT, iFace) {
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
  async start(up, rtt) {
    const halfWayRTT = rtt / 2;
    // Stop before starting.
    await this.stop();
    const iFace = await findTheDefaultInterface();
    await setLimits(up, /*down,*/ halfWayRTT, iFace);
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
  }
};
