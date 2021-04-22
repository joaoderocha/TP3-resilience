'use strict';

const server = require('./src/server');

const port = process.argv[2];
const mainHost = process.argv[3];
const mainPort = process.argv[4];

server.start(port, {mainHost, mainPort});
