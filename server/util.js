'use strict';

const R = require('ramda');

// [colorObj] -> (color, [colorObj])
const availableColor = cs => {
  const i = R.findIndex(R.propEq('used', false))(cs);
  
  if (i === -1) return { color: '#000000', colors: cs };
  
  cs[i].used = true;
  return { color: cs[i].color, colors: cs };
};

// String -> Bool
const commandMessage = message => message.startsWith('/');

// a -> [a] -> ([a], [a])
const splitAtFirst = y => xs => ([
  R.takeWhile(z => z !== y)(xs),
  R.tail(R.dropWhile(z => z !== y)(xs))
]);

module.exports = { availableColor, commandMessage, splitAtFirst };
