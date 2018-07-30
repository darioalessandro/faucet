
const SERVER_URL = 'ws://vehicle-server:3201/ws';
const SEQUENCE_NUMBER_LENGTH = 10;
const throttle = require('../lib/index');
const ServerClient = require('./ServerClient').ServerClient;

function createFakePayload(kb) {
    const utf8CharSizeBytes = 2;
    const numberOfCharacters = (kb * 1000) / utf8CharSizeBytes;
    return Array(numberOfCharacters).fill('-').join('');
}

function sequenceNumberAsString(seq) {
    const s = `${new Array(SEQUENCE_NUMBER_LENGTH - seq.toFixed().length).fill(0).join('')}${seq}`;
    console.log('s', s);
    return s;
}

async function runTest({ payloadSize, up, down, rtt }) {
    console.log('running test');
    console.log('Payload size', payloadSize, 'Kb');
    console.log('Up rate', up, 'Kbps');
    console.log('Down rate', down, 'Kbps');
    console.log('RTT', rtt, 'mS');
    // await throttle.start({ up, down, rtt});
    const serverClient = new ServerClient({serverUrl: SERVER_URL});
    await serverClient.connect({retryCount2: 10});
    const payload= createFakePayload(payloadSize) + sequenceNumberAsString(1);
    console.log('info', 'sending payload with size', Buffer.byteLength(payload, 'utf8') / 1000, 'Kb');
    const requestSent = Date.now();
    await serverClient.sendAndWaitForResponse(payload);
    const responseReceived = Date.now();
    console.log('Request took', responseReceived - requestSent, 'mS');
    await serverClient.disconnect();
    await throttle.stop();
}


runTest({
    payloadSize: parseInt(process.env.PAYLOAD_SIZE),
    up: parseInt(process.env.UP_RATE_KBPS),
    down: parseInt(process.env.DOWN_RATE_KBPS),
    rtt: parseInt(process.env.ROUND_TRIP_TIME),
});