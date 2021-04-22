'use strict';

const debug = require('debug')('main:client');

const {connect, sendMessage, awaitResource, isReconnecting, isConnected, getCurrentDelay} = require('./src/client');
const { resourcesLength } = require('./src/resource');
const { messageBuilder, MESSAGETYPE } = require('./src/utils');
const sleep = require('./src/utils/sleep');

const clientName = process.argv[2];
const host = process.argv[3];
const port = process.argv[4];

async function main() {
  console.log('conectado');

  await connect(clientName,{port,host});

  let shouldRun = true;

  while (shouldRun) {
  console.log('rodando');

    const resourcePosition = randomResource();

    const aquireMessage = messageBuilder[MESSAGETYPE.AQUIRE](resourcePosition, clientName);

    try {
      const recurso = await adquireRecurso(aquireMessage);

      // usa recurso
      await sleep(2000);

      const mesage = messageBuilder[MESSAGETYPE.RELEASE](resourcePosition, recurso);

      console.log('com recurso');

      await sendMessage(mesage);
    } catch (error) {
      console.log(error);

      console.log('deu erro, reconectando');

      while (isReconnecting() && !isConnected()) {
        console.log('reconectando');
        sleep(getCurrentDelay());
      }

      if (!isConnected()) {
        shouldRun = false;
      }
    }
  }
}

async function adquireRecurso(aquireMessage) {
  let run = false;
  let recurso = {};

  console.log('buscando recurso');

  do {
    const { content } = await sendMessage(aquireMessage);

    debug(`recurso ${content.resource} disponivel ${content.available}`);
    recurso = content.resource;

    if (!content.available) {
      debug('content not available, awaiting resource');
      const {
        content: { available, resource },
      } = await awaitResource();

      run = !available;
      recurso = resource;
    }
  } while (run);

  return recurso;
}

function randomResource(MIN = 0, MAX = resourcesLength) {
  return Math.floor(Math.random() * (MAX - MIN) + MIN);
}

main();

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
