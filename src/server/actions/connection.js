'use strict';

const debug = require('debug')('server:socket:onConnection');

const { SOURCE, decode } = require('../../utils');

const { clientMessageHandler } = require('./client-mesage-handler');

exports.onConnection = function onConnection(socket) {
  socket.on('data', (data) => {
    try {
      const { source, messageType, content } = decode(data);

      switch (source) {
        case SOURCE.CLIENT:
          clientMessageHandler(messageType, content, socket);
          break;
        case SOURCE.BROKER:
          brokerMessageHandler(messageType, content, socket);
          break;
        default:
          debug('Source not found');
          break;
      }
    } catch (error) {
      debug('erro na leitura dos dados', error.message);
    }
  });
};
