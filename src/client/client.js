'use strict';

const net = require('net');

const debug = require('debug')('client:connection');

const { resourcesLength } = require('../resource');
const { encode, decode, messageBuilder, MESSAGETYPE, SOURCE } = require('../utils');
const sleep = require('../utils/sleep');

const { onError, optionalServers } = require('./actions');

const clientSocket = new net.Socket();

const maxRetry = 5;
let numberOfTries = 0;
let sktPort = 0;
let sktHost = '';
let clientName = '';
let delay = 2 ** numberOfTries * 1000;
let reconnecting = false;
let connected = true;

async function connect(name, { port, host }) {
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

  return clientSocket;
}

function informServer() {
  const infoMessage = messageBuilder[MESSAGETYPE.INFOCLIENT](clientName, SOURCE.CLIENT);

  return sendMessage(infoMessage);
}

function sendMessage(message) {
  return new Promise((resolve) => {
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

  setTimeout(createConnection, delay, { port: sktPort, host: sktHost });
}

async function onConnection() {
  numberOfTries = 0;
  reconnecting = false;
  connected = true;
  await informServer();
  run();
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
}

function isConnected() {
  return connected;
}

async function run() {
  let shouldRun = true;

  while (shouldRun) {
    const resourcePosition = randomResource();

    const aquireMessage = messageBuilder[MESSAGETYPE.AQUIRE](resourcePosition, clientName);

    try {
      let run = false;
      let recurso = {};

      do {
        const { content } = await sendMessage(aquireMessage);

        debug(`recurso ${content.resource} disponivel ${content.available}`);
        recurso = content.resource;

        if (!content.available) {
          debug('content not available, awaiting resource');
          const {
            content: { available, resource },
          } = await awaitResource();

          run = !available;
          recurso = resource;
        }
      } while (run);

      await sleep(2000);

      const mesage = messageBuilder[MESSAGETYPE.RELEASE](resourcePosition, recurso);

      await sendMessage(mesage);
    } catch (error) {
      debug(error);
      shouldRun = false;
    }
  }
}

function randomResource(MIN = 0, MAX = resourcesLength) {
  return Math.floor(Math.random() * (MAX - MIN) + MIN);
}

module.exports = {
  connect,
  sendMessage,
  awaitResource,
  isReconnecting,
  isConnected,
  reconnecting,
  clientSocket,
};
