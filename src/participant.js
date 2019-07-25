'use strict';

const { show, hide } = require('./dom');
const makeStore = require('./store');
const makeSocket = require('./socket');

module.exports = function participantView(root, storage) {
  const store = makeStore({
    error: null,
    isRegistered: (
      Boolean(storage.getItem('binding'))
    ),
    isConnected: false,
    isBound: false,
    helpRequested: false,
    helpAcknowledged: false,
    helpingTrainer: null
  });
  store.addListener(render);
  const socket = makeSocket();
  socket.on('open', function() {
    if (store.state.isRegistered) {
      bind(JSON.parse(storage.getItem('binding')));
    }
    store.update({ isConnected: true });
  });
  socket.on('close', function() {
    store.update({ isConnected: false });
  });
  socket.on('message', function({ data }) {
    const parsedData = JSON.parse(data);
    const handlers = {
      bound: function({ user }) {
        storage.setItem('binding', JSON.stringify(user));
        store.update({ isRegistered: true });
        store.update({ isBound: true });
      },
      helpRequested: function() {
        store.update({ helpRequested: true });
      },
      helpAcknowledged: function({ payload }) {
        store.update({ helpAcknowledged: true, helpingTrainer: payload.trainer });
      }
    };
    if (handlers[parsedData.type]) {
      handlers[parsedData.type](parsedData);
    }
  });

  function bind(identification) {
    socket.send(JSON.stringify({ type: 'bind', identification }));
  }

  function register(formValues) {
    bind({
      user_id: null,
      user_name: formValues.user_name,
      user_group: formValues.user_group,
      type: 'Participant'
    });
  }

  function handleUserRegistration(event) {
    event.preventDefault();
    const registrationForm = event.target;
    const registrationData = new FormData(registrationForm);
    const formValues = {
      user_name: registrationData.get('user_name'),
      user_group: Number(registrationData.get('user_group'))
    };
    if (formValues.user_name && formValues.user_group) {
      register(formValues);
    } else {
      store.update({ error: new Error('Missing data in registration form') });
    }
  }

  function handleTrainerSummoningStart(event) {
    event.preventDefault();
    socket.send(JSON.stringify({ type: 'requestHelp' }));
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
    const disconnectedSection = root.querySelector('.disconnected_warning');
    const controlSection = root.querySelector('.participant_controls');
    const summoningButton = controlSection.querySelector('button.start');
    const cancelButton = controlSection.querySelector('button.stop');
    const waitForTrainerText = controlSection.querySelector('.wait_for_trainer');
    const trainerRespondedText = controlSection.querySelector('.trainer_responded');
    if (state.isRegistered && state.isBound) {
      hide(registrationSection);
      show(controlSection);
    } else {
      show(registrationSection);
      hide(controlSection);
    }
    if (state.isConnected) {
      hide(disconnectedSection);
    } else {
      show(disconnectedSection);
    }
    if (state.helpRequested && !state.helpAcknowledged) {
      show(waitForTrainerText);
    } else if (state.helpRequested && state.helpAcknowledged) {
      hide(waitForTrainerText);
      show(trainerRespondedText);
      trainerRespondedText.querySelector('.trainer_name').textContent = state.helpingTrainer.user_name;
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
  // * that our help request has been fulfilled (this can be indicated by the trainer)
  // Upon receiving these, the view should update.

  store.init();
};
