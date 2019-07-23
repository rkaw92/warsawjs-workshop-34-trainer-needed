'use strict';

const { show, hide } = require('./dom');
const makeStore = require('./store');

module.exports = function participantView(root, storage) {
  const store = makeStore({
    error: null,
    isRegistered: Boolean(storage.getItem('user_name') && storage.getItem('user_group'))
  });
  store.addListener(render);

  function register() {
    // TODO: Connect to the server, ask for a new user ID, then bind to the obtained ID.
    // Finally, when done, save the user ID, name and group.
    console.log('register: not implemented');
    // storage.setItem('user_name', values.user_name);
    // storage.setItem('user_group', values.user_group);
    return Promise.resolve();
  }

  function handleUserRegistration(event) {
    event.preventDefault();
    const registrationForm = event.target;
    const registrationData = new FormData(registrationForm);
    const values = {
      user_name: registrationData.get('user_name'),
      user_group: Number(registrationData.get('user_group'))
    };
    if (values.user_name && values.user_group) {
      register().then(function() {
        store.update({ isRegistered: true });
      });
    } else {
      store.update({ error: new Error('Missing data in registration form') });
    }
  }

  function handleTrainerSummoningStart(event) {
    event.preventDefault();
    // TODO: Send a message over WebSocket to ask a trainer for support.
    // TODO: Update state locally after successfully asking, or alternatively
    //  use event-based updates and do nothing until an event arrives.
    // TODO: Debounce repeated clicks when the request is still in flight.
    console.log('handleTrainerSummoningStart: not implemented');
  }

  function handleTrainerSummoningCancel(event) {
    event.preventDefault();
    // TODO: Send a message over WebSocket to cancel your support request.
    // TODO: Update state locally after cancelling - either on receipt of
    //  command acknowledgement if doing RPC style, or on event.
    // TODO: Debounce repeated clicks when the request is still in flight.
    console.log('handleTrainerSummoningCancel: not implemented');
  }

  function render(state) {
    if (state.error) {
      // TODO: Display the error to the user in a visible place.
      console.error(state.error);
    }
    const registrationSection = root.querySelector('.user_registration');
    const registrationForm = registrationSection.querySelector('form');
    const controlSection = root.querySelector('.participant_controls');
    const summoningButton = controlSection.querySelector('button.start');
    const cancelButton = controlSection.querySelector('button.stop');
    if (state.isRegistered) {
      hide(registrationSection);
      show(controlSection);
    } else {
      show(registrationSection);
      hide(controlSection);
    }
    // TODO: Enable/disable the appropriate buttons based on:
    // * connection state (all disabled - wait for connection)
    // * current summoning activity (only allow start when not started already)

    registrationForm.addEventListener('submit', handleUserRegistration);
    summoningButton.addEventListener('click', handleTrainerSummoningStart);
    cancelButton.addEventListener('click', handleTrainerSummoningCancel);
  }

  // TODO: Listen for notifications that indicate:
  // * that a trainer has been requested (during our previous connection?)
  // * that a trainer has acknowledged the request and is coming
  // * that a trainer has cancelled their acknowledgement and will not come
  // Upon receiving these, the view should update.

  store.init();
};
