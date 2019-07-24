'use strict';

// View utilities to encapsulate dealing with CSS classes:
function show(element) {
  element.classList.remove('hidden');
}

function hide(element) {
  element.classList.add('hidden');
}

function removeChildren(node) {
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
}

module.exports = {
  show,
  hide,
  removeChildren
};
