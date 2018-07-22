const WebSocket = require('ws');
const http = require('http');
const express = require('express')();
const bodyParser = require('body-parser');
const logger = require('winston');
const uuid = require('uuid');
const WS_PATH = '/ws';
const SERVER_PORT = 3201;
const SEQUENCE_NUMBER_LENGTH = 10;
const throttle = require('../lib/index');

throttle.start({up: 360, down: 780, rtt: 200}).then(() => {
    let server;

    let socketConnections = {};

    function setupHttpServer() {
        express.use(bodyParser.json({ limit: '30mb' }));
        express.use(bodyParser.urlencoded({ extended: true }));
        express.use(
            bodyParser.raw({
                type: 'application/octet-stream',
                limit: '30mb',
            }),
        );
        server = http.createServer(express);
        server.listen(SERVER_PORT, () => {
            console.log(`express server setup on ${SERVER_PORT}`);
        });
    }

    setupHttpServer();

    const wsServer = new WebSocket.Server({
        server,
        path: WS_PATH,
        perMessageDeflate: false,
    });

    wsServer.on('connection', (connection, req) => {
        console.log(`websocket connection on ${req.url}`);
        onConnection(connection, uuid());
    });

    wsServer.on('listening', () => {
        console.log(`websocket setup on ${SERVER_PORT}`);
    });

    function onConnection(socket, connId) {
        const address = socket._socket.remoteAddress;
        const port = socket._socket.remotePort;
        socketConnections[connId] = socket;

        console.log('connection from %s:%s', address, port);

        socket.on('message', message => {
            console.log('on message', Buffer.byteLength(message, 'utf8') / 1000, 'Kb');
            // last SEQUENCE_NUMBER_LENGTH chars of the payload are the sequence number;
            socket.send(message.substring(message.length - SEQUENCE_NUMBER_LENGTH - 1, message.length - 1));
        });

        socket.on('error', () => {
            console.log('error', message);
        });

        socket.on('close', () => {
            delete socketConnections[connId];
        });
    }

    console.log(`ws-server path=${wsServer.path}`);
});
