const WebSocket = require('ws');
const http = require('http');
const express = require('express')();
const bodyParser = require('body-parser');
const logger = require('winston');
const SERVER_URL = 'ws://vehicle-server:3201/ws';

let ws;

function setupWebsocket(vin) {
    logger.log('info', 'connecting to websocket...');
    ws = new WebSocket(SERVER_URL, {
        headers: {
            vin: vin,
        },
    });
    ws.on('error', (e) => {
        logger.log('info', e);
        logger.log('info', e);
    });
    ws.on('close', () => logger.error('close'));
    ws.on('open', () => {
        logger.log('info', 'open');
    });
}

setupWebsocket('123');