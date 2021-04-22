'use strict';

const util = require('util');

const debug = require('debug')('server:socket:client-message-handler');

const { encode, RESPONSES, messageBuilder, messageHandler } = require('../../utils');

exports.clientMessageHandler = function clientMessageHandler(messageType, content, socket) {
  debug(`messageType: ${messageType} content: ${util.inspect(content)}`);

  const result = messageHandler[messageType](content, socket);

  debug(`result: ${util.inspect(result)}`);

  const response = messageBuilder[RESPONSES[messageType]]({ ...result });

  debug(`response: ${util.inspect(response)}`);

  const responseBuffer = encode(response);

  debug(`Buffer ${responseBuffer.toString()}`);

  sendResponse(socket, responseBuffer);
};

function sendResponse(socket, buffer) {
  socket.write(buffer);
}
