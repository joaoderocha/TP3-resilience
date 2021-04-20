'use strict';

exports.SOURCE = {
  CLIENT: 1,
  SERVER: 2,
};

exports.messageWrapper = function messageWrapper(message, source) {
  return {
    source,
    content: message,
  };
};
