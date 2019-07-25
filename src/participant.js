'use strict';

const { show, hide, enable, disable } = require('./dom');
const makeStore = require('./store');
const makeSocket = require('./socket');

module.exports = function participantView(root, storage) {
  const store = makeStore({
    error: null,
    isRegistered: (
      Boolean(storage.getItem('binding_participant'))
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
      bind(JSON.parse(storage.getItem('binding_participant')));
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
        storage.setItem('binding_participant', JSON.stringify(user));
        store.update({ isRegistered: true });
        store.update({ isBound: true });
      },
      helpRequested: function() {
        store.update({ helpRequested: true });
      },
      helpAcknowledged: function({ payload }) {
        store.update({ helpAcknowledged: true, helpingTrainer: payload.trainer });
      },
      helpRequestFulfilled: function() {
        store.update({ helpRequested: false, helpAcknowledged: false, helpingTrainer: null });
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

  function handleThanks(event) {
    event.preventDefault();
    socket.send(JSON.stringify({ type: 'fulfillHelp' }));
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
    const thanksButton = controlSection.querySelector('button.thanks');
    const waitForTrainerText = controlSection.querySelector('.wait_for_trainer');
    const trainerRespondedText = controlSection.querySelector('.trainer_responded');
    console.log('render state: %j', state);
    if (state.isRegistered) {
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
    if (!state.helpRequested) {
      hide(waitForTrainerText);
      hide(trainerRespondedText);
      disable(thanksButton);
    } else if (state.helpRequested && !state.helpAcknowledged) {
      show(waitForTrainerText);
      hide(trainerRespondedText);
      disable(thanksButton);
    } else if (state.helpRequested && state.helpAcknowledged) {
      hide(waitForTrainerText);
      show(trainerRespondedText);
      enable(thanksButton);
      trainerRespondedText.querySelector('.trainer_name').textContent = state.helpingTrainer.user_name;
    }

    registrationForm.addEventListener('submit', handleUserRegistration);
    summoningButton.addEventListener('click', handleTrainerSummoningStart);
    thanksButton.addEventListener('click', handleThanks);
  }

  // TODO: Listen for notifications that indicate:
  // * that a trainer has cancelled their acknowledgement and will not come
  // * that our help request has been fulfilled (this can be indicated by the trainer)
  // Upon receiving these, the view should update.

  store.init();
};
