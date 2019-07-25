'use strict';

const { show, hide, enable, disable, removeChildren } = require('./dom');
const makeStore = require('./store');
const makeSocket = require('./socket');

module.exports = function trainerView(root, storage) {
  const store = makeStore({
    isRegistered: (
      Boolean(storage.getItem('binding_trainer'))
    ),
    isConnected: false,
    isBound: false,
    participantCount: 0,
    helpRequests: new Map()
  });
  store.addListener(render);
  const socket = makeSocket();
  socket.on('open', function() {
    if (store.state.isRegistered) {
      bind(JSON.parse(storage.getItem('binding_trainer')));
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
        storage.setItem('binding_trainer', JSON.stringify(user));
        store.update({ isRegistered: true, isBound: true });
      },
      helpRequested: function({ source }) {
        store.state.helpRequests.set(source.user_id, { source, acknowledged: false, helpingTrainer: null, date: new Date() });
        // We need to notify the store of the change - it won't detect it itself:
        store.update({ helpRequests: store.state.helpRequests });
      },
      helpAcknowledged: function({ source, payload }) {
        store.state.helpRequests.get(source.user_id).acknowledged = true;
        store.state.helpRequests.get(source.user_id).helpingTrainer = payload.trainer;
        store.update({ helpRequests: store.state.helpRequests });
      },
      thanked: function({ payload }) {
        store.state.helpRequests.delete(payload.participant.user_id);
        store.update({ helpRequests: store.state.helpRequests });
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
      type: 'Trainer'
    });
    return Promise.resolve();
  }

  function offerHelp(user_id) {
    socket.send(JSON.stringify({ type: 'offerHelp', target: { user_id } }));
  }

  function handleUserRegistration(event) {
    event.preventDefault();
    const registrationForm = event.target;
    const registrationData = new FormData(registrationForm);
    const formValues = {
      user_name: registrationData.get('user_name')
    };
    if (formValues.user_name) {
      register(formValues).then(function() {
        store.update({ isRegistered: true });
      });
    } else {
      store.update({ error: new Error('Missing data in registration form') });
    }
  }

  function render(state) {
    if (state.error) {
      // TODO: Display the error to the user in a visible place.
      console.error(state.error);
    }
    const registrationSection = root.querySelector('.user_registration');
    const registrationForm = registrationSection.querySelector('form');
    const controlSection = root.querySelector('.trainer_controls');
    const disconnectedSection = root.querySelector('.disconnected_warning');
    const requestList = controlSection.querySelector('.requests');
    const requestTemplate = root.querySelector('#request_template');

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

    // Render all participants' requests in the order they came (FIFO):
    removeChildren(requestList);
    state.helpRequests.forEach(function({ source: { user_id, user_name, user_group }, date, acknowledged, helpingTrainer }) {
      const requestElement = document.importNode(requestTemplate.content, true);
      requestElement.querySelector('.user_name').textContent = user_name;
      requestElement.querySelector('.user_group').textContent = String(user_group);
      requestElement.querySelector('.date').textContent = (new Date(date)).toISOString();
      if (acknowledged) {
        hide(requestElement.querySelector('.pending_indicator'), true);
        disable(requestElement.querySelector('.offer_help'));
      }
      requestElement.querySelector('button.offer_help').addEventListener('click', function() {
        offerHelp(user_id);
      });
      requestList.appendChild(requestElement);
    });

    registrationForm.addEventListener('submit', handleUserRegistration);
  }

  // TODO: Listen for notifications that indicate:
  // * what (how many) participants are online
  // * when a participant requests help
  // * when a trainer acknowledges a help request
  // * when a trainer reneges on their acknowledgement
  // * when a help request is considered fulfilled

  store.init();
};
