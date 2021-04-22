'use strict';

const debug = require('debug')('server:socket:onConnection');

const { SOURCE, decode, encode, RESPONSES, messageBuilder, messageHandler } = require('../../utils');

exports.onConnection = function onConnection(socket) {
  // listaDeSocketsDeClientes.push(socket);
  // listaDeSocketsDeBrokers.push(socket);
  debug(`client ${socket}`);
  socket.on('data', (data) => {
    try {
      const { source, messageType, content } = decode(data);

      console.log(source, SOURCE.CLIENT);
      console.log(source === SOURCE.CLIENT);

      switch (source) {
        case SOURCE.CLIENT:
          clientMessageHandler(messageType, content, socket);
          break;
        case SOURCE.BROKER:
          // brokerMessageHandler(messageType, content, socket);
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

function clientMessageHandler(messageType, content, socket) {
  debug(`messageType: ${messageType} content: ${content}`);

  const result = messageHandler[messageType](content);

  debug(`result: ${result}`);

  const response = messageBuilder[RESPONSES[messageType]]({ ...result });

  debug(`response: ${response}`);

  const responseBuffer = encode(response);

  debug(`Buffer ${responseBuffer.toString()}`);

  sendResponse(socket, responseBuffer);
}

function sendResponse(socket, buffer) {
  socket.write(buffer);
}

// recurso = [
//   {
//     liberado: true,
//     recurso: 'a',
//   },
// ];

//                         envia                recebe
// mensagem -> client -> requisicaoDeRecurso -> recurso ou espera
//                    -> releaseDeRecurso (deve atualizar recurso) -> ok
//                    -> ok <- lista atualizada de brokers
//                    ->
//                    ->
//                    ->
//                    ->
//                         recebe                responde
//          -> broker -> requisicaoDeRecurso -> recurso ou espera
//                    -> releaseDeRecurso (deve atualizar recurso) -> ok
//                    ->
//                    ->
//                    ->
//                    ->
