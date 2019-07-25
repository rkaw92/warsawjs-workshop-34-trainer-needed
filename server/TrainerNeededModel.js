'use strict';

const User = require('./User');
const Participant = require('./Participant');
const Trainer = require('./Trainer');
const cuid = require('cuid');

class TrainerNeededModel {
  constructor() {
    this._usersByID = new Map();
  }

  _createUser(identification) {
    const self = this;
    // Construct the right type of object:
    const userConstructors = { Trainer, Participant };
    if (!userConstructors[identification.type]) {
      throw new Error('Invalid user type: ' + identification.type);
    }
    const user = new userConstructors[identification.type](identification);
    const userID = identification.user_id;
    self._usersByID.set(userID, user);
    // Route the user's events to their connected clients:
    function privateNotifier(type) {
      return function _notifyUser(payload) {
        user.send({ source: user.getIdentification(), type, payload });
      };
    }
    user.on('helpRequested', privateNotifier('helpRequested'));
    user.on('helpAcknowledged', privateNotifier('helpAcknowledged'));
    user.on('helpRequestFulfilled', privateNotifier('helpRequestFulfilled'));
    user.on('helpVoided', privateNotifier('helpVoided'));
    user.on('thanked', privateNotifier('thanked'));
    // Also register handlers that publish the events to all trainers:
    function trainerNotifier(type) {
      return function _notifyAllTrainers(payload) {
        self._usersByID.forEach(function _notifyTrainer(potentialTrainer) {
          if (potentialTrainer.getIdentification().type === 'Trainer') {
            potentialTrainer.send({ source: user.getIdentification(), type, payload });
          }
        });
      };
    }
    user.on('helpRequested', trainerNotifier('helpRequested'));
    user.on('helpAcknowledged', trainerNotifier('helpAcknowledged'));
    user.on('helpVoided', trainerNotifier('helpVoided'));
  }

  _findOrCreateUser(identification) {
    if (!identification.user_id) {
      identification.user_id = cuid();
    }
    const userID = identification.user_id;
    if (!this._usersByID.has(userID)) {
      this._createUser(identification);
    }
    return this._usersByID.get(userID);
  }

  handleCommand(command, socket, context) {
    switch (command.type) {
      case 'bind': {
        const user = this._findOrCreateUser(command.identification, socket);
        user.updateIdentification(command.identification);
        user.addSocket(socket);
        context.user = user;
        socket.send(JSON.stringify({ type: 'bound', user: user.getIdentification() }));
        break;
      }
      case 'requestHelp':
      case 'offerHelp':
      case 'voidHelp':
      case 'fulfillHelp': {
        const user = context.user;
        if (!user) {
          throw new Error('Socket not bound to any user - did you forget to send bind() first?');
        }
        const methodToCall = user[command.type];
        const params = {
          target: null
        };
        if (command.target) {
          params.target = this._usersByID.get(command.target.user_id);
          if (!params.target) {
            throw new Error('Could not resolve target userID to an object - user does not exist');
          }
        }
        return methodToCall.call(user, params);
      }
    }
  }

  handleDisconnect(socket, context) {
    if (context.user) {
      context.user.removeSocket(socket);
    }
  }
}

module.exports = TrainerNeededModel;
