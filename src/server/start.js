'use strict';

const net = require('net');

const debug = require('debug')('server:start');

const { onError, onConnection } = require('./actions');

exports.start = function start(port) {
  debug('Starting server...');
  const server = net.createServer();

  server.on('connection', onConnection);
  server.on('error', onError);

  return new Promise((resolve) => {
    server.listen({ port }, () => {
      debug(`Server listening on ${port}`);

      resolve(server);
    });
  });
};
