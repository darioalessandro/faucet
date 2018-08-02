const assert = require('assert');

const SERVER_URL = 'ws://loopback-server:3201/ws';
const SEQUENCE_NUMBER_LENGTH = 10;
const faucet = require('../../../faucet/index');
const ServerClient = require('./../server-client').ServerClient;

const createFakePayload = (kb) => {
    const utf8CharSizeBytes = 2;
    const numberOfCharacters = (kb * 2000) / utf8CharSizeBytes;
    return Array(numberOfCharacters).fill('-').join('');
};

describe('server-client', function() {
    const networkConditions = [
        { up:100, down:100, rtt:10 },
        { up:1000, down:100, rtt:10 },
        { up:10000, down:100, rtt:200 },
        { up:10, down:100, rtt:10 },
    ];

    networkConditions.forEach(async (networkConditions) => {
        it('Send and receive a 50kb payload in less than 1 second', async function() {
            this.timeout(500000);
            await faucet.start(networkConditions);
            const serverClient = new ServerClient({serverUrl: SERVER_URL});
            await serverClient.connect({retryCount2: 10});
            const payload= createFakePayload(50);
            const requestSent = Date.now();
            await serverClient.sendAndWaitForResponse(payload);
            const responseReceived = Date.now();
            const roundTripDelay = responseReceived - requestSent;
            console.log('roundTripDelay: ', roundTripDelay);
            assert(roundTripDelay < 1000, `Request must take less than\
             1 second, but it took ${roundTripDelay}mS`);
            await serverClient.disconnect();
            await faucet.stop();
        });
    });
});