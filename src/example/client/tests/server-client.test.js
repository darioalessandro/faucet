const assert = require('assert');

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