'use strict';

const debug = require('debug')('server:message-handler');

const { MESSAGETYPE } = require('./message-builder');

function aquireHandler() {
  debug('rodei aquireHandler');
}

function ackHandler() {
  debug('rodei ackHandler');
}

const messageHandler = {
  [MESSAGETYPE.AQUIRE]: aquireHandler,
  [MESSAGETYPE.ACK]: ackHandler,
};

module.exports = {
  messageHandler,
};
