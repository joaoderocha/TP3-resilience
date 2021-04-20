'use strict';

const debug = require('debug')('client:socket:onConnection');

exports.onData = function onData(socket) {
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
