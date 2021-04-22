'use strict';

const debug = require('debug')('server:message-decoder');

exports.encode = function encode(object) {
  debug(`ENCODE object: ${object}`);
  const jsonString = JSON.stringify(object);

  debug(`ENCODE jsonString ${jsonString}`);

  return Buffer.from(jsonString);
};

exports.decode = function decode(buffer) {
  const bufferString = buffer.toString();

  debug(`DECODE buffer String ${bufferString}`);
  debug(`DECODE json parse ${JSON.parse(bufferString)}`);

  return JSON.parse(bufferString);
};