'use strict';

const util = require('util');

const debug = require('debug')('server:message-handler');

const resource = require('../resource');

const { listaDeSocketsDeClientes } = require('../server/db');

const { MESSAGETYPE, messageBuilder } = require('./message-builder');
const { encode } = require('./message-decoder');

function aquireHandler(content) {
  debug('aquireHandler');

  const { resourcePosition: idResource, clientId: idClient } = content;

  debug(`idResource ${idResource}, idClient ${idClient}`);

  if (!resource.lockResource(idResource)) {
    resource.insertResourceQueue(idResource, idClient);

    return { available: false };
  }

  if (resource.checkOnQueue(idResource, idClient)) {
    resource.removeResourceQueue(idResource);
  }

  const recurso = resource.acquireResource(idResource);

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

  debug(`release ${util.inspect(idRecurso)}`);

  const idClient = resource.removeResourceQueue();

  resource.updateResource(idRecurso, recurso);

  if (!idClient) {
    resource.releaseResource(idRecurso);

    return {
      statusCode: 'ok',
    };
  }

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
