'use strict';

const debug = require('debug')('client:main');

const {connect, sendMessage, awaitResource} = require('./src/client');
const {resourcesLength} = require('./src/resource');

const {messageBuilder, MESSAGETYPE: {AQUIRE, RELEASE}} = require('./src/utils');
const sleep = require('./src/utils/sleep');

const clientName = process.argv[2];
const host = process.argv[3];
const port = process.argv[4];

(async ()=>{
  await connect(clientName,{port,host});

  let shouldRun = true;

  while (shouldRun) {
    const resourcePosition = randomResource();

    const aquireMessage = messageBuilder[AQUIRE](resourcePosition, clientName);

    try {
      let run = false;
      let recurso = {};

      do {
        const {content} = await sendMessage(aquireMessage);

        debug(`recurso ${content.resource} disponivel ${content.available}`);
        recurso = content.resource;

        if (!content.available) {
          debug('content not available, awaiting resource');
          const {content: {available,resource}} = await awaitResource();

          run = available;
          recurso = resource;
        }
      } while (run);

      await sleep(1000);

      const mesage = messageBuilder[RELEASE](resourcePosition, recurso);

      await sendMessage(mesage);
    } catch (error) {
      debug(error);
      shouldRun = false;
    }
  }
})();

function randomResource(MIN=0,MAX=resourcesLength) {
  return Math.floor(Math.random() * (MAX - MIN ) + MIN);
}

//cliente
// recurso = numero aleatorio de 0 a 10
// monto msg de pedido de recurso = {
//  posicaoDoRecurso: recurso,
//}
// peço recurso ate me liberar
// envio req
//  libero
// uso, altero faco qlqer coisa
// mando de volta atualizado
// msg de att do recurso = {
// posicaoDoRecurso: recurso
// recurso: recursoAtualizado
//}
