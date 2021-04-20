'use strict';

const net = require('net');

const debug = require('debug')('client:connection');

// const sleep = require('../utils/sleep');

const { onData, onError, optionalServers } = require('./actions');

const clientSocket = new net.Socket();

const maxRetry = 5;
let numberOfTries = 0;
let sktPort = 0;
let sktHost = '';
const delay = 1000;

async function connect({ port, host }) {
  sktPort = port;
  sktHost = host;
  debug(`Connecting to ${host} at ${port}...`);

  clientSocket.on('connect', onConnection);
  clientSocket.on('data', onData);
  clientSocket.on('error', onError);
  clientSocket.on('close', onClose);

  await createConnection({ port, host });

  Object.assign(clientSocket, optionalServers);

  return clientSocket;
}

function onClose() {
  debug('Connection lost, trying to reconect...');
  if (numberOfTries >= maxRetry) {
    throw new Error('Could not connect to server');
  }

  numberOfTries += 1;

  setTimeout(createConnection, delay, { port: sktPort, host: sktHost });
}

function onConnection() {
  numberOfTries = 0;
}

function createConnection({ host, port }) {
  return new Promise((resolve) => {
    clientSocket.connect(port, host, () => {
      debug('Client connected!');
      resolve(clientSocket);
    });
  });
}

module.exports = {
  connect,
  // reconnect,
  clientSocket,
};
