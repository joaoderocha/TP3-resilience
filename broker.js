'use strict';

const server = require('./src/server');

const port = process.argv[2];

server.start(port);
