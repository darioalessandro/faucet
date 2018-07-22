'use strict';
const execa = require('execa');
const sudo = require('./sudo');

async function getDefaultInterface() {
  const result = await execa.shell(
    "route | grep '^default' | grep -o '[^ ]*$'"
  );
  return result.stdout;
}

async function modProbe() {
  console.log('modProbe ');
  try {
      const result = await sudo('modprobe', 'ifb', '--numifbs=1');
      console.log('result', result.stdout);
  } catch (e) {
    // we are probably in a Docker env
    // let us hope that the host is Linux
    try {
        const result = await sudo('ip', 'link', 'add', 'ifb0', 'type', 'ifb');
        console.log('result', result.stdout);
    } catch (e) {
        console.log('error', e);
      // If we already setup ifb in a previous run, this will fail
    }
  }
}

async function setup(defaultInterface) {
  console.log('setup1');
  try {
      await sudo('ip', 'link', 'set', 'dev', 'ifb0', 'up');
  }catch(e) {
    console.error(e);
  }
  console.log('setup2');
  try {
      await sudo('tc', 'qdisc', 'add', 'dev', defaultInterface, 'ingress');
  }catch(e) {
    console.error(e);
  }
  console.log('setup3');
  try {
      await sudo(
          'tc',
          'filter',
          'add',
          'dev',
          defaultInterface,
          'parent',
          'ffff:',
          'protocol',
          'ip',
          'u32',
          'match',
          'u32',
          '0',
          '0',
          'flowid',
          '1:1',
          'action',
          'mirred',
          'egress',
          'redirect',
          'dev',
          'ifb0'
      );
  }catch(e) {
    console.error(e);
  }
}

async function setLimits(up, down, halfWayRTT, iFace) {
  console.log('set limits');
  try {
  await sudo(
    'tc',
    'qdisc',
    'add',
    'dev',
    'ifb0',
    'root',
    'handle',
    '1:0',
    'netem',
    'delay',
    `${halfWayRTT}ms`,
    'rate',
    `${down}kbit`
  );
  }catch(e) {
      console.error(e);
  }
  try {
  await sudo(
    'tc',
    'qdisc',
    'add',
    'dev',
    iFace,
    'root',
    'handle',
    '1:0',
    'netem',
    'delay',
    `${halfWayRTT}ms`,
    'rate',
    `${up}kbit`
  );
  }catch(e) {
      console.error(e);
  }
}

module.exports = {
  async start(up, down, rtt) {
    const halfWayRTT = rtt / 2;

    try {
      await this.stop();
    } catch (e) {
      // ignore
    }

    const iFace = await getDefaultInterface();
    console.log(`interface`, iFace);
    // await modProbe();
    // await setup(iFace);
    await setLimits(up, down, halfWayRTT, iFace);
  },
  async stop() {
    const iFace = await getDefaultInterface();

    try {
      try {
        await sudo('tc', 'qdisc', 'del', 'dev', iFace, 'root');
        await sudo('tc', 'qdisc', 'del', 'dev', iFace, 'ingress');
      } catch (e) {
        // make sure we try to remove the ingress
        sudo('tc', 'qdisc', 'del', 'dev', iFace, 'ingress');
      }
    } catch (e) {
      // ignore
    }

    try {
      await sudo('tc', 'qdisc', 'del', 'dev', 'ifb0', 'root');
    } catch (e) {
      // do nada
    }
  }
};
