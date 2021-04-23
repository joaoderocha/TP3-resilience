'use strict';

const {start} = require('./src/server');

const brokerName = process.argv[2];
const port = process.argv[3];
const mainHost = process.argv[4];
const mainPort = process.argv[5];

start(port, {mainHost, mainPort, brokerName});
