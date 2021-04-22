'use strict';

const debug = require('debug')('server:socket:client-message-handler');

const { encode, RESPONSES, messageBuilder, messageHandler } = require('../../utils');

exports.clientMessageHandler = function clientMessageHandler(messageType, content, socket) {
  debug('handling message');
  const result = messageHandler[messageType](content, socket);

  const response = messageBuilder[RESPONSES[messageType]]({ ...result });

  const responseBuffer = encode(response);

  debug('sending response');
  sendResponse(socket, responseBuffer);
};

function sendResponse(socket, buffer) {
  socket.write(buffer);
}
