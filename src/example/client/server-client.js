const WebSocket = require('ws');

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

/**
 * Used to connect to the server and send data.
 */

class ServerClient {

    constructor({ timeout = 5000, serverUrl }) {
        this.timeout = timeout;
        this.serverUrl = serverUrl;
    }

    async sendAndWaitForResponse(request) {
        console.log('Sending payload with size', Buffer.byteLength(request, 'utf8') / 1000, 'Kb');
        return new Promise((resolve, reject) => {
            if (this.ws.readyState !== WebSocket.OPEN) {
                reject('Web socket is not open');
            }
            this.ws.send(request);
            this.ws.on('message', (message) => {
                resolve(message);
            });
            this.ws.on('error', error => {
               reject(error);
            });
        });
    };

    async connect({ retryCount2 = 10 }) {
        let retryCount = retryCount2;
        return new Promise((resolve, reject) => {
            let timeout = setTimeout(() => {
                reject('timeout');
                timeout = null;
            }, this.timeout);
            const self = this;
            function _connect() {
                self.ws = new WebSocket(self.serverUrl, {
                    headers: {
                        vin: '123',
                    },
                });
                self.ws.on('error', () => {
                    if (timeout) {
                        setTimeout(() => {
                            retryCount--;
                            if (retryCount > 0 && timeout) {
                                _connect();
                            }
                        }, 500);
                    }
                });
                self.ws.on('close', () => {
                    console.log('close');
                });
                self.ws.on('open', () => {
                    console.log('websocket is connected');
                    clearTimeout(timeout);
                    timeout = null;
                    resolve();
                });
            }
            _connect();
        });
    }

    async disconnect() {
        await this.ws.close(1001, 'vehicle initiated');
    }
}

module.exports = { ServerClient };