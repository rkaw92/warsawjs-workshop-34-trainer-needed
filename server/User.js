'use strict';

const EventEmitter = require('events').EventEmitter;

class User extends EventEmitter {
  constructor({ user_id, user_name, user_group, type }) {
    super();
    this._identification = { user_id, user_name, user_group, type };
    this._sockets = new Set();
  }

  getIdentification() {
    return this._identification;
  }

  updateIdentification({ user_id, user_name, user_group, type }) {
    this._identification = { user_id, user_name, user_group, type };
    this.emit('identificationUpdated', this._identification);
  }

  addSocket(socket) {
    this._sockets.add(socket);
  }

  removeSocket(socket) {
    this._sockets.delete(socket);
  }

  send(messageObject) {
    this._sockets.forEach(function(socket) {
      try {
        socket.send(JSON.stringify(messageObject));
      } catch (error) {
        console.warn('error sending message to user via socket: %s', error);
      }
    });
  }
}

module.exports = User;
