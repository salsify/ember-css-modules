'use strict';

function removeAttr(node, attribute) {
  node.attributes.splice(node.attributes.indexOf(attribute), 1);
}

function removePair(node, pair) {
  node.hash.pairs.splice(node.hash.pairs.indexOf(pair), 1);
}

function seperator() {
  return {
    type: 'StringLiteral',
    value: ' ',
    original: ' '
  };
}

function attr(node, path) {
  return findBy(node.attributes, 'name', path);
}

function pair(node, path) {
  return findBy(node.hash.pairs, 'key', path);
}

function findBy(target, key, path) {
  for (var i = 0, l = target.length; i < l; i++) {
    if (target[i][key] === path) {
      return target[i];
    }
  }

  return false;
}

module.exports = {
  pair: pair,
  attr: attr,
  seperator: seperator,
  removePair: removePair,
  removeAttr: removeAttr
}
