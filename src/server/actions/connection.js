'use strict';

const debug = require('debug')('server:socket:onConnection');

const log = [];

exports.onConnection = function onConnection(socket) {
  // listaDeSocketsDeClientes.push(socket);
  // listaDeSocketsDeBrokers.push(socket);
  debug(`client ${socket}`);
  socket.on('data', (data) => {
    try {
      log.push(data.toJSON());
      debug(data.toJSON());
      sendResponse(socket, log.toString());
    } catch (error) {
      debug('erro na leitura dos dados', error.message);
    }
  });
};

function sendResponse(socket, message) {
  socket.write(message);
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
