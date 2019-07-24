'use strict';

const User = require('./User');

class Trainer extends User {
  constructor(identification) {
    super(Object.assign({}, identification, { user_group: null, type: 'Trainer' }));
    this._currentlyHelping = new Set();
  }

  offerHelp({ target: participant }) {
    if (this._currentlyHelping.has(participant)) {
      return;
    }
    participant.acknowledgeHelp({ source: this });
    this._currentlyHelping.add(participant);
  }

  voidHelp({ target: participant }) {
    if (!this._currentlyHelping.has(participant)) {
      return;
    }
    this._currentlyHelping.delete(participant);
    participant.voidHelp({ source: this });
  }

  thank({ source: participant }) {
    if (!this._currentlyHelping.has(participant)) {
      return;
    }
    this._currentlyHelping.delete(participant);
    this.emit('thanked', { participant: participant.getIdentification() });
  }
}

module.exports = Trainer;
