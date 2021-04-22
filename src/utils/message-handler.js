'use strict';

const util = require('util');

const debug = require('debug')('server:message-handler');

const resource = require('../resource');

const { listaDeSocketsDeClientes, addLog, endLog } = require('../server/db');

const { MESSAGETYPE, messageBuilder } = require('./message-builder');
const { encode } = require('./message-decoder');

function aquireHandler(content) {
  debug('aquireHandler');

  const { resourcePosition: idResource, clientId: idClient } = content;

  debug(`idResource ${idResource}, idClient ${idClient}`);

  addLog(`aquire de ${idClient}`);
  if (!resource.lockResource(idResource)) {
    resource.insertResourceQueue(idResource, idClient);

    addLog(`aquire de ${idClient} falhou`);
    endLog();

    return { available: false };
  }

  if (resource.checkOnQueue(idResource, idClient)) {
    resource.removeResourceQueue(idResource);
  }

  const recurso = resource.acquireResource(idResource);

  addLog(`aquire de ${idClient} conseguiu o recurso ${recurso}`);
  endLog();

  debug(`recurso ${recurso}`);

  return {
    resource: recurso,
    available: true,
  };
}

function ackHandler() {
  debug('ackHandler');

  return {
    statusCode: 'ok',
  };
}

function releaseHandler(content) {
  debug('release handler');

  const { resourcePosition: idRecurso, resource: recurso } = content;

  addLog(`release do recurso ${recurso}`);

  debug(`release ${idRecurso}`);

  const idClient = resource.removeResourceQueue(idRecurso);

  console.log(idClient);

  console.log('proximo da fila', idClient);
  resource.print();

  addLog(`proximo da fila ${idClient}`);

  resource.updateResource(idRecurso, recurso);

  if (!idClient) {
    resource.releaseResource(idRecurso);
    addLog(`nao tem proximo, libera recurso ${idRecurso}`);

    return {
      statusCode: 'ok',
    };
  }

  addLog(`enviando recurso pro ${idClient}`);

  const clientSocket = listaDeSocketsDeClientes.get(idClient);

  const response = messageBuilder[MESSAGETYPE.AQUIRERESPONSE]({ available: true, resource: recurso });

  clientSocket.write(encode(response));

  return {
    statusCode: 'ok',
  };
}

function infoClientHandler(content, socket) {
  debug('infoClientHandler');
  const { socketName } = content;

  debug(`nome do socket ${socketName}`);

  listaDeSocketsDeClientes.set(socketName, socket);

  return true;
}

const messageHandler = {
  [MESSAGETYPE.AQUIRE]: aquireHandler,
  [MESSAGETYPE.ACK]: ackHandler,
  [MESSAGETYPE.RELEASE]: releaseHandler,
  [MESSAGETYPE.INFOCLIENT]: infoClientHandler,
};

module.exports = {
  messageHandler,
};
