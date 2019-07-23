'use strict';

const viewFunctions = {
  participant: require('./participant'),
  trainer: require('./trainer')
};

/*
  This is the entry point for the "Trainer Needed" application.
  It adaptively runs the appropriate view function based on the arguments
   of the <script> element in the document.
*/

(function _trainerNeededApp(root, storage) {
  const scriptElement = root.querySelector('#trainer_needed_script');
  if (!scriptElement) {
    throw new Error('Script element not found');
  }
  const operatingMode = scriptElement.dataset.mode;
  if (viewFunctions[operatingMode]) {
    viewFunctions[operatingMode](root, storage);
  } else {
    throw new Error('Invalid operating mode specified for the Trainer Needed entry point');
  }
})(document, window.localStorage);
