'use strict';

const net = require('net');

const debug = require('debug')('client:connection');

const { encode, decode, messageBuilder, MESSAGETYPE, SOURCE } = require('../utils');

const { onError, optionalServers } = require('./actions');

const clientSocket = new net.Socket();

const maxRetry = 5;
let numberOfTries = 0;
let sktPort = 0;
let sktHost = '';
let clientName = '';
let delay = 2 ** numberOfTries * 1000;

async function connect(name, { port, host }) {
  clientName = name;
  sktPort = port;
  sktHost = host;
  Object.assign(clientSocket, { clientName });
  debug(`Connecting to ${host} at ${port}...`);

  clientSocket.on('connect', onConnection);
  // clientSocket.on('data', onData);
  clientSocket.on('error', onError);
  clientSocket.on('close', onClose);

  await createConnection({ port, host });

  const infoMessage = messageBuilder[MESSAGETYPE.INFOCLIENT](clientName, SOURCE.CLIENT);

  await sendMessage(infoMessage);

  return clientSocket;
}

function sendMessage(message) {
  return new Promise((resolve) => {
    clientSocket.once('data', (data) => {
      resolve(decode(data));
    });

    clientSocket.write(encode(message));
  });
}

function awaitResource() {
  return new Promise((resolve, reject) => {
    clientSocket.once('data', (data) => {
      resolve(encode(data));
    });

    setTimeout(reject, 5000, { available: false });
  });
}

function onClose() {
  debug('Connection lost, trying to reconect...');
  if (numberOfTries >= maxRetry) {
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
  sendMessage,
  awaitResource,
  clientSocket,
};

// envia                 recebe
// primeira mensagem -> lista de brokers
// acessar recurso (hash da lista) -> resposta de acesso ao recurso e (lista || nada)
