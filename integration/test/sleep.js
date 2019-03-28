module.exports = function(ms) {
  return new Promise(function(resolve) {
    setTimeout(resolve, ms);
  });
};
