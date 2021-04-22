'use strict';

const {connect} = require('./src/client');
const { encode } = require('./src/utils');

(async ()=>{
  const skt = await connect('teste',{port: 8080, host:'localhost'});

  const obj = {
    source: 'client',
    messageType: 'aquire',
    content: {
      resourcePosition: 10
    },
  };

  skt.write(encode(obj));
})();
