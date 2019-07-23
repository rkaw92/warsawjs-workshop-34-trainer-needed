'use strict';

function makeStore(initialState = null) {
  let state = initialState;
  let updateListeners = new Set();
  function runListeners() {
    updateListeners.forEach(function(listener) {
      listener(state);
    });
  }
  return {
    update: function update(updater) {
      if (typeof updater === 'function') {
        state = updater(state);
      } else if (typeof updater === 'object' && updater) {
        Object.assign(state, updater);
      } else {
        throw new Error('Invalid format for state updater - expected a function or object');
      }
      runListeners();
    },
    addListener(listener) {
      updateListeners.add(listener);
    },
    get state() {
      return state;
    },
    set state(updater) {
      this.update(updater);
    },
    init() {
      runListeners();
    }
  };
}

module.exports = makeStore;
