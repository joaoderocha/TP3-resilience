'use strict';

const optionalServers = [];

function incluirBroker(port, host) {
  optionalServers.push({ port, host });
}

module.exports = {
  optionalServers,

  incluirBroker,
};

// recebe                 envia
// primeira mensagem -> lista de brokers
// pedido do recurso e hash -> permissao de acesso de recurso e envia a lista ou nada
