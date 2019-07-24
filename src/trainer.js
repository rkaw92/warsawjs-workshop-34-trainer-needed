'use strict';

const { show, hide, removeChildren } = require('./dom');
const makeStore = require('./store');

module.exports = function trainerView(root, storage) {
  const store = makeStore({
    error: null,
    isRegistered: (
      Boolean(storage.getItem('user_id')) &&
      Boolean(storage.getItem('user_name'))
    ),
    isConnected: false,
    participantCount: 0,
    helpRequests: new Map([
      [ 'user1', { user_name: 'Some User', user_id: 'some_user', user_group: 1, date: new Date(), acknowledged_by: null } ]
    ])
  });
  store.addListener(render);

  function register(formValues) {
    // TODO: Connect to the server, ask for a new user ID, then bind to the obtained ID in trainer mode.
    // When successfully connected and bound, save the details in persistent storage.
    console.log('register: not implemented');
    // storage.setItem('user_id', TODO);
    // storage.setItem('user_name', formValues.user_name);
    // storage.setItem('user_group', formValues.user_group);
    // TODO: Refactor together with the same function in participant.js to avoid code duplication.
    return Promise.resolve();
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
    state.helpRequests.forEach(function({ user_id, user_name, user_group, date, acknowledged_by }) {
      const requestElement = document.importNode(requestTemplate.content, true);
      requestElement.querySelector('.user_name').textContent = user_name;
      requestElement.querySelector('.user_group').textContent = String(user_group);
      requestElement.querySelector('.date').textContent = (new Date(date)).toISOString();
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
