'use strict';

const User = require('./User');

class Participant extends User {
  constructor(identification) {
    super(Object.assign({}, identification, { type: 'Participant' }));
    this._helpRequested = false;
    this._helpAcknowledged = false;
    this._helpingTrainer = null;
  }

  requestHelp() {
    // Guard clause: if already requested help, do nothing.
    if (this._helpRequested) {
      return;
    }
    this._helpRequested = true;
    this.emit('helpRequested');
  }

  acknowledgeHelp({ source: trainer }) {
    if (!this._helpRequested) {
      throw new Error('This participant is not currently requesting help');
    }
    if (this._helpAcknowledged) {
      return;
    }
    this._helpAcknowledged = true;
    this._helpingTrainer = trainer;
    this.emit('helpAcknowledged', { trainer: trainer.getIdentification() });
  }

  voidHelp({ source: trainer }) {
    if (!this._helpAcknowledged) {
      return;
    }
    if (this._helpingTrainer !== trainer) {
      throw new Error('This trainer is not currently helping this participant and thus cannot void his help');
    }
    this._helpAcknowledged = false;
    this._helpingTrainer = null;
    this.emit('helpVoided');
  }

  fulfillHelp() {
    if (!this._helpRequested) {
      return;
    }
    this._helpRequested = false;
    this._helpAcknowledged = false;
    if (this._helpingTrainer) {
      this._helpingTrainer.thank({ source: this });
      this._helpingTrainer = null;
    }
    this.emit('helpRequestFulfilled');
  }
}

module.exports = Participant;
