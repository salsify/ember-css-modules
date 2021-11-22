'use strict';

function removeAttr(node, attribute) {
  node.attributes.splice(node.attributes.indexOf(attribute), 1);
}

function removePair(node, pair) {
  node.hash.pairs.splice(node.hash.pairs.indexOf(pair), 1);
}

function getAttr(node, path) {
  return findBy(node.attributes, 'name', path);
}

function getPair(node, path) {
  return findBy(node.hash.pairs, 'key', path);
}

function updateStringValue(node, updater) {
  if (node.type === 'TextNode') {
    node.chars = updater(node.chars);
  } else if (node.type === 'StringLiteral') {
    node.value = updater(node.value);
    node.original = updater(node.original);
  } else {
    throw new Error('Unknown node type ' + node.type + ' (not a string?)');
  }
}

function mustacheToSexpr(builders, node) {
  if (node.type !== 'MustacheStatement') {
    return node;
  }

  var params = node.params.map(textToString.bind(null, builders));
  return builders.sexpr(node.path, params, node.hash);
}

function textToString(builders, node) {
  if (node.type === 'TextNode') {
    return builders.string(node.chars);
  } else {
    return node;
  }
}

function concatStatementToParams(builders, node) {
  return node.parts.map(function (part) {
    if (part.type === 'MustacheStatement') {
      if (!part.params.length && !part.hash.pairs.length) {
        return part.path;
      } else {
        return mustacheToSexpr(builders, part);
      }
    } else {
      return textToString(builders, part);
    }
  });
}

function findBy(target, key, path) {
  for (var i = 0, l = target.length; i < l; i++) {
    if (target[i][key] === path) {
      return target[i];
    }
  }

  return false;
}

function pushAll(target, arr) {
  for (var i = 0; i < arr.length; i++) {
    target.push(arr[i]);
  }

  return target;
}

module.exports = {
  pushAll: pushAll,
  getPair: getPair,
  getAttr: getAttr,
  removePair: removePair,
  removeAttr: removeAttr,
  mustacheToSexpr: mustacheToSexpr,
  updateStringValue: updateStringValue,
  concatStatementToParams: concatStatementToParams,
};
