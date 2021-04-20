'use strict';

const {connect} = require('./src/client');

const host = process.argv[2];
const port = process.argv[3];

connect({port,host});
