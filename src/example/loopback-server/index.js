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

const WebSocket = require('ws');
const http = require('http');
const express = require('express')();
const bodyParser = require('body-parser');
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
    // console.log(`websocket connection on ${req.url}`);
    onConnection(connection, uuid());
});

wsServer.on('listening', () => {
    console.log(`websocket setup on ${SERVER_PORT}`);
});

function onConnection(socket, connId) {
    const address = socket._socket.remoteAddress;
    const port = socket._socket.remotePort;
    socketConnections[connId] = socket;
    // console.log('connection from %s:%s', address, port);
    socket.on('message', message => {
        console.log('on message', Buffer.byteLength(message, 'utf8') / 1000, 'Kb');
        socket.send(message);
    });

    socket.on('error', () => {
        console.log('error', message);
    });

    socket.on('close', () => {
        delete socketConnections[connId];
    });
}

console.log(`ws-server path=${wsServer.path}`);
