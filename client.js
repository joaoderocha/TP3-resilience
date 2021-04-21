'use strict';

const {connect} = require('./src/client');

const clientName = process.argv[2];
const host = process.argv[3];
const port = process.argv[4];

connect(clientName,{port,host});

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
