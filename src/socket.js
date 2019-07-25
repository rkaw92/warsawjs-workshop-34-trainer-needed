'use strict';

const EventEmitter = require('eventemitter2');

class SocketAdapter extends EventEmitter {
  constructor(socketURL) {
    super();
    const self = this;
    self._socket = null;
    function _connect() {
      const socket = new WebSocket(socketURL);
      self._socket = socket;
      socket.addEventListener('open', function() {
        self.emit('open');
      });
      socket.addEventListener('message', function(...args) {
        self.emit('message', ...args);
      });
      let ended = false;
      socket.addEventListener('error', function() {
        if (!ended) {
          ended = true;
          setTimeout(_connect, 2000);
          self.emit('close');
        }
      });
      socket.addEventListener('close', function() {
        if (!ended) {
          ended = true;
          setTimeout(_connect, 2000);
          self.emit('close');
        }
      });
    }

    _connect();
  }

  send(...args) {
    return this._socket.send(...args);
  }
}


function makeSocket() {
  const protocolMap = {
    'http:': 'ws:',
    'https:': 'wss:'
  };
  const socketProtocol = protocolMap[window.location.protocol] || '';
  let socketAdapter = new SocketAdapter(socketProtocol + '//' + window.location.host);
  return socketAdapter;
}

module.exports = makeSocket;
