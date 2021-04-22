'use strict';

const net = require('net');

const debug = require('debug')('client:connection');

const { encode, decode, messageBuilder, MESSAGETYPE, SOURCE } = require('../utils');
const sleep = require('../utils/sleep');

const { onError, optionalServers } = require('./actions');

let clientSocket = null;

const maxRetry = 5;
let numberOfTries = 0;
let sktPort = 0;
let sktHost = '';
let clientName = '';
let delay = 2 ** numberOfTries * 1000;
let reconnecting = false;
let connected = false;

async function connect(name, { port, host }) {
  clientSocket = new net.Socket();
  clientName = name;
  sktPort = port;
  sktHost = host;
  Object.assign(clientSocket, { clientName });
  debug(`Connecting to ${host} at ${port}...`);

  clientSocket.on('connect', onConnection);
  clientSocket.on('error', onError);
  clientSocket.on('close', onClose);
  clientSocket.on('drain', () => {
    clientSocket.resume();
  });
  await createConnection({ port, host });

  await informServer();

  return clientSocket;
}

function informServer() {
  const infoMessage = messageBuilder[MESSAGETYPE.INFOCLIENT](clientName, SOURCE.CLIENT);

  return sendMessage(infoMessage);
}

function sendMessage(message) {
  return new Promise((resolve, reject) => {
    setTimeout(reject, 10000, new Error('Could not connect to server'));
    clientSocket.once('data', (data) => {
      resolve(decode(data));
    });

    const buffered = clientSocket.write(encode(message));

    if (!buffered) {
      clientSocket.pause();
    }
  });
}

function awaitResource() {
  return new Promise((resolve, reject) => {
    clientSocket.once('data', (data) => {
      resolve(decode(data));
    });

    setTimeout(reject, 10000, { available: false });
  });
}

function onClose() {
  if (!clientSocket.destroyed) {
    clientSocket.destroy();
  }

  reconnecting = true;
  debug('Connection lost, trying to reconect...');
  if (numberOfTries >= maxRetry) {
    reconnecting = false;
    throw new Error('Could not connect to server');
  }

  delay = 2 ** numberOfTries * 1000;
  numberOfTries += 1;

  let newBroker = null;

  if (optionalServers.length > 0) {
    newBroker = optionalServers.pop();
  }

  debug(`${optionalServers.length}`);

  if (newBroker) {
    sktPort = newBroker.port;
    sktHost = newBroker.host;
    debug(`New broker found at ${sktHost} and ${sktPort}`);
  }

  setTimeout(connect, delay, { port: sktPort, host: sktHost }, clientName);
}

function onConnection() {
  numberOfTries = 0;
  reconnecting = false;
  connected = true;
}

function createConnection({ host, port }) {
  return new Promise((resolve) => {
    clientSocket.connect(port, host, () => {
      debug('Client connected!');

      resolve(clientSocket);
    });
  });
}

function isReconnecting() {
  return reconnecting;
  // return new Proxy(isReconnecting, {
  //   apply: (target) =>
  //     new Promise((resolve, reject) => {
  //       while (reconnecting) {
  //         if (numberOfTries > maxRetry) {
  //           reject(new Error('Failed to reconnect too many times'));
  //         }
  //         sleep(delay);
  //       }
  //       resolve(reconnecting);
  //     }),
  // });
}

function isConnected() {
  return connected;
}

function getCurrentDelay() {
  return delay;
}

module.exports = {
  connect,
  sendMessage,
  awaitResource,
  isReconnecting,
  isConnected,
  getCurrentDelay,
  reconnecting,
  clientSocket,
};
