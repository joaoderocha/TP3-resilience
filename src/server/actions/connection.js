'use strict';

const debug = require('debug')('server:socket:onConnection');

exports.onConnection = function onConnection(socket) {
  debug(`client ${socket}`);
  socket.on('data', (data) => {
    try {
      debug(data.toJSON());
      sendResponse(socket, data);
    } catch (error) {
      debug('erro na leitura dos dados', error.message);
    }
  });
};

function sendResponse(socket, message) {
  socket.write(message);
}
