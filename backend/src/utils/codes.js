const crypto = require('crypto');
exports.numericCode = (len = 6) => String(crypto.randomInt(0, 10 ** len)).padStart(len, '0');
exports.tempPassword = () => {
  const words = ['Sunrise', 'Baobab', 'Savanna', 'Kilimanjaro', 'Acacia', 'Harambee'];
  return `${words[crypto.randomInt(0, words.length)]}-${crypto.randomInt(1000, 9999)}`;
};
