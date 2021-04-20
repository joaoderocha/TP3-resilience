'use strict';

const {connect} = require('./src/client');
const server = require('./src/server');

(async ()=>{
  await server.start(8080);

  await connect(8080, 'localhost');
})();
