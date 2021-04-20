'use strict';

const optionalServers = [];

function incluirBroker(port, host) {
  optionalServers.push({ port, host });
}

module.exports = {
  optionalServers,
  incluirBroker,
};
