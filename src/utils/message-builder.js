'use strict';

const { messageWrapper } = require('./message-wrapper');

const SOURCE = {
  CLIENT: 'client',
  BROKER: 'broker',
};

const MESSAGETYPE = {
  AQUIRE: 'aquire',
  RELEASE: 'release',
  AQUIRERESPONSE: 'aquireResponse',
  ACK: 'ack',
};

const RESPONSES = {
  [MESSAGETYPE.AQUIRE]: MESSAGETYPE.AQUIRERESPONSE,
  [MESSAGETYPE.RELEASE]: MESSAGETYPE.ACK,
};

const messageBuilder = {
  [MESSAGETYPE.AQUIRE]: (resourcePosition) => {
    const content = {
      resourcePosition,
    };

    return messageWrapper(MESSAGETYPE.AQUIRE, SOURCE.CLIENT, content);
  },
  [MESSAGETYPE.AQUIRERESPONSE]: (resource, avaliable) => {
    const content = {
      avaliable,
      resource,
    };

    return messageWrapper(MESSAGETYPE.AQUIRERESPONSE, SOURCE.BROKER, content);
  },
  [MESSAGETYPE.RELEASE]: (resourcePosition, resource) => {
    const content = {
      resourcePosition,
      resource,
    };

    return messageWrapper(MESSAGETYPE.RELEASE, SOURCE.CLIENT, content);
  },
  [MESSAGETYPE.ACK]: (statusCode) => {
    const content = {
      statusCode,
    };

    return messageWrapper(MESSAGETYPE.ACK, SOURCE.BROKER, content);
  },
};

module.exports = {
  messageBuilder,
  MESSAGETYPE,
  SOURCE,
  RESPONSES,
};
