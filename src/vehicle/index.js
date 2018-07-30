const WebSocket = require('ws');
const SERVER_URL = 'ws://vehicle-server:3201/ws';
const PING_INTERVAL_MS = 1000;
const SEQUENCE_NUMBER_LENGTH = 10;
const NUMBER_OF_TESTS = 1;
const throttle = require('../lib/index');
const TestCondition = require('../test-conditions/config').TestConditions;

console.log('TestConditions', TestCondition[0]);

throttle.start(TestCondition[0]).then(() => {

    /**
     *
     * @param kb
     * @returns {string}
     */

    function createFakePayload(kb) {
        const utf8CharSizeBytes = 2;
        const numberOfCharacters = (kb * 1000) / utf8CharSizeBytes;
        return Array(numberOfCharacters).fill('-').join('');
    }

    function schedulePings() {
        interval = setInterval(sendPing, PING_INTERVAL_MS);
    }

    function sequenceNumberAsString(seq) {
        const s = `${new Array(SEQUENCE_NUMBER_LENGTH - seq.toFixed().length).fill(0).join('')}${seq}`;
        console.log('s', s);
        return s;
    }

    function sendPing() {
        if (sequenceNumber === NUMBER_OF_TESTS) {
            clearInterval(interval);
            return;
        }
        const payload= createFakePayload(100) + sequenceNumberAsString(sequenceNumber);
        console.log('info', 'sending payload with size', Buffer.byteLength(payload, 'utf8') / 1000, 'Kb');
        latencyTable[sequenceNumber].requestSent = Date.now();
        ws.send(payload);
        sequenceNumber++;
    }

    function connectToServer() {
        console.log('info', 'connecting to websocket...');
        ws = new WebSocket(SERVER_URL, {
            headers: {
                vin: '123',
            },
        });
        ws.on('error', (e) => {
            console.log('info', e);
            setTimeout(() => {
                connectToServer();
            }, 2000);
        });
        ws.on('close', () => {
            console.log('close');
        });
        ws.on('open', () => {
            console.log('info', 'open');
            schedulePings(ws);
        });
        ws.on('message', (message) => {
            const parsedSequenceNumber = new Number(message.substring(message.length - SEQUENCE_NUMBER_LENGTH - 1, message.length - 1));
            latencyTable[parsedSequenceNumber].responseReceived = Date.now();
            latencyTable[parsedSequenceNumber].roundTrip = latencyTable[parsedSequenceNumber].responseReceived - latencyTable[parsedSequenceNumber].requestSent;
            if (Object.keys(latencyTable).length === NUMBER_OF_TESTS) {
                console.log('finished test');
                console.log(JSON.stringify(latencyTable));
            }
        })
    }

    connectToServer();
});