'use strict';

// View utilities to encapsulate dealing with CSS classes:
function show(element) {
  element.classList.remove('hidden');
}

function hide(element) {
  element.classList.add('hidden');
}

function enable(element) {
  element.disabled = false;
}

function disable(element) {
  element.disabled = true;
}

function removeChildren(node) {
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
}

module.exports = {
  show,
  hide,
  enable,
  disable,
  removeChildren
};
