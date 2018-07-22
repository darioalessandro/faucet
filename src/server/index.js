const WebSocket = require('ws');
const http = require('http');
const express = require('express')();
const bodyParser = require('body-parser');
const logger = require('winston');
const uuid = require('uuid');
const WS_PATH = '/ws';
const SERVER_PORT = 3201;

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
        logger.info(`express server setup on ${SERVER_PORT}`);
    });
}

setupHttpServer();

const wsServer = new WebSocket.Server({
    server,
    path: WS_PATH,
    perMessageDeflate: false,
});

wsServer.on('connection', (connection, req) => {
    logger.info(`websocket connection on ${req.url}`);
    onConnection(connection, uuid());
});

wsServer.on('listening', () => {
    logger.info(`websocket setup on ${SERVER_PORT}`);
});

function onConnection(socket, connId) {
    const address = socket._socket.remoteAddress;
    const port = socket._socket.remotePort;
    socketConnections[connId] = socket;

    logger.info('connection from %s:%s', address, port);

    socket.on('message', message => {
        logger.info('on message', message);
    });

    socket.on('error', () => {
        logger.info('error', message);
    });

    socket.on('close', () => {
        delete socketConnections[connId];
    });
}

logger.info(`ws-server path=${wsServer.path}`);
